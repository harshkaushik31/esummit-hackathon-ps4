"""
FastAPI Image & Video Pothole Location Service

- Image endpoint: extracts GPS coordinates from image EXIF metadata.
- Video endpoint: runs pothole detection on video frames and saves only
    model-confirmed pothole frames that have GPS metadata.

Image endpoint deduplicates within ±10° and hardcodes
description = "pothole detected".
"""

import io
import json
import os
import re
import subprocess
import tempfile
from typing import Annotated, List, Optional
import cv2
import numpy as np

try:
    import cloudinary
    import cloudinary.uploader
except ImportError:
    cloudinary = None

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.openapi.utils import get_openapi
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, Field
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware




# your routes below

app = FastAPI(
    title="Pothole Image Location Service",
    description="Upload images to extract GPS coordinates from EXIF metadata.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _load_local_dotenv(dotenv_path: str = ".env") -> None:
    """Load simple KEY=VALUE pairs from .env into process env if missing."""
    if not os.path.exists(dotenv_path):
        return

    try:
        with open(dotenv_path, "r", encoding="utf-8") as dotenv_file:
            for raw_line in dotenv_file:
                line = raw_line.strip()
                if not line or line.startswith("#"):
                    continue

                if line.startswith("export "):
                    line = line[len("export "):]

                if "=" not in line:
                    continue

                key, value = line.split("=", 1)
                key = key.strip()
                value = value.strip().strip('"').strip("'")

                if key and key not in os.environ:
                    os.environ[key] = value
    except OSError:
        # Ignore .env read failures and rely on existing process env.
        pass


def _env_float(name: str, default: float) -> float:
    value = os.getenv(name)
    if value is None:
        return default
    try:
        return float(value)
    except ValueError:
        return default


def _env_int(name: str, default: int) -> int:
    value = os.getenv(name)
    if value is None:
        return default
    try:
        return int(value)
    except ValueError:
        return default


def _env_bool(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


_load_local_dotenv()


MODEL_PATH = os.getenv("POTHOLE_MODEL_PATH", "pothole_detector_vgg_20250803_124150.keras")
POTHOLE_THRESHOLD = _env_float("POTHOLE_THRESHOLD", 0.9)
POTHOLE_CLASS_INDEX = _env_int("POTHOLE_CLASS_INDEX", 1)
VIDEO_FRAME_STRIDE = max(1, _env_int("VIDEO_FRAME_STRIDE", 1))
POTHOLE_FRAMES_DIR = os.getenv("POTHOLE_FRAMES_DIR", "pothole_frames_with_gps")
CLEAN_OLD_SAVED_FRAMES = _env_bool("CLEAN_OLD_SAVED_FRAMES", True)
# UPLOAD_TO_CLOUDINARY = _env_bool("UPLOAD_TO_CLOUDINARY", True)
UPLOAD_TO_CLOUDINARY = False
DELETE_LOCAL_FRAME_AFTER_UPLOAD = _env_bool("DELETE_LOCAL_FRAME_AFTER_UPLOAD", True)
CLOUDINARY_UPLOAD_FOLDER = os.getenv("CLOUDINARY_UPLOAD_FOLDER", "pothole_frames")
CLOUDINARY_CLOUD_NAME = (
    os.getenv("CLOUDINARY_CLOUD_NAME")
    or os.getenv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME")
)
CLOUDINARY_API_KEY = (
    os.getenv("CLOUDINARY_API_KEY")
    or os.getenv("NEXT_PUBLIC_CLOUDINARY_API_KEY")
    or os.getenv("NEXT_PUBLIC_CLOUDINARY_API")
)
CLOUDINARY_SECRET_KEY = (
    os.getenv("CLOUDINARY_SECRET_KEY")
    or os.getenv("CLODINARY_SECRET_KEY")
    or os.getenv("CLOUDINARY_API_SECRET")
)

if cloudinary is not None:
    cloudinary.config(
        cloud_name=CLOUDINARY_CLOUD_NAME,
        api_key=CLOUDINARY_API_KEY,
        api_secret=CLOUDINARY_SECRET_KEY,
    )

_POTHOLE_MODEL = None
_MODEL_INPUT_SIZE: tuple[int, int] | None = None
_MODEL_HAS_INTERNAL_RESCALING = False


def custom_openapi():
    """Force Swagger to render the request body as real binary image uploads."""
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )

    request_body_schema = openapi_schema.get("components", {}).get("schemas", {}).get(
        "Body_upload_images_upload_images__post"
    )
    if request_body_schema:
        request_body_schema["properties"]["files"] = {
            "title": "Files",
            "type": "array",
            "description": "Upload one or more image files.",
            "items": {
                "type": "string",
                "format": "binary",
            },
        }

    multipart_content = (
        openapi_schema.get("paths", {})
        .get("/upload-images/", {})
        .get("post", {})
        .get("requestBody", {})
        .get("content", {})
        .get("multipart/form-data")
    )
    if multipart_content is not None:
        multipart_content["encoding"] = {
            "files": {
                "contentType": "image/*",
            }
        }

    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi


# ── Response Model ──────────────────────────────────────────────────────────

class ImageLocationResult(BaseModel):
    filename: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    description: str = "pothole detected"


class RTIGenerationRequest(BaseModel):
    user_data: str = Field(
        ...,
        description=(
            "Free-text user details that include complaint counts and optional dates. "
            "Example: 'name: Rahul, area: Koramangala, total complaints: 12, "
            "pending complaints: 5, dates: 2025-11-22, 2025-12-14'"
        ),
    )


class RTIGenerationResponse(BaseModel):
    applicant_name: str
    area: str
    total_complaints: int
    pending_complaints: int
    complaint_dates: list[str]
    rti_text: str


# ── EXIF / GPS Helpers ──────────────────────────────────────────────────────

def _dms_to_decimal(dms_tuple, ref: str) -> float:
    """Convert EXIF GPS DMS (degrees, minutes, seconds) to decimal degrees."""
    degrees = float(dms_tuple[0])
    minutes = float(dms_tuple[1])
    seconds = float(dms_tuple[2])
    decimal = degrees + minutes / 60.0 + seconds / 3600.0
    if ref in ("S", "W"):
        decimal = -decimal
    return decimal


def extract_gps(image: Image.Image) -> tuple[Optional[float], Optional[float]]:
    """Return (latitude, longitude) from an image's EXIF data, or (None, None)."""
    exif_data = image._getexif()
    if exif_data is None:
        return None, None

    # Find the GPSInfo tag id
    gps_info_tag = None
    for tag_id, tag_name in TAGS.items():
        if tag_name == "GPSInfo":
            gps_info_tag = tag_id
            break

    if gps_info_tag is None or gps_info_tag not in exif_data:
        return None, None

    gps_info_raw = exif_data[gps_info_tag]

    # Resolve numeric keys to human-readable GPS tag names
    gps_info = {}
    for key, val in gps_info_raw.items():
        decoded = GPSTAGS.get(key, key)
        gps_info[decoded] = val

    try:
        lat = _dms_to_decimal(gps_info["GPSLatitude"], gps_info["GPSLatitudeRef"])
        lon = _dms_to_decimal(gps_info["GPSLongitude"], gps_info["GPSLongitudeRef"])
        return lat, lon
    except (KeyError, TypeError, IndexError, ZeroDivisionError):
        return None, None


# ── Deduplication ───────────────────────────────────────────────────────────

BUFFER_DEGREES = 10.0

def is_duplicate(lat: float, lon: float, seen: list[tuple[float, float]]) -> bool:
    """
    Return True if (lat, lon) is within ±BUFFER_DEGREES of any already-seen
    coordinate pair. This prevents the same pothole location from appearing
    multiple times in the results.
    """
    for s_lat, s_lon in seen:
        if abs(lat - s_lat) <= BUFFER_DEGREES and abs(lon - s_lon) <= BUFFER_DEGREES:
            return True
    return False


# ── Endpoint ────────────────────────────────────────────────────────────────

@app.get("/", response_class=HTMLResponse)
async def upload_form() -> str:
    """Serve a simple HTML form to upload image files from the browser."""
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Pothole Image Upload</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                max-width: 720px;
                margin: 40px auto;
                padding: 0 16px;
                line-height: 1.5;
            }
            form {
                border: 1px solid #ccc;
                border-radius: 8px;
                padding: 20px;
            }
            button {
                margin-top: 12px;
                padding: 10px 16px;
                cursor: pointer;
            }
        </style>
    </head>
    <body>
        <h1>Pothole Image Upload</h1>
        <p>Select one or more image files. The API will extract GPS metadata, remove near-duplicates within ±10°, and return latitude/longitude with the image.</p>
        <form action="/upload-images/" method="post" enctype="multipart/form-data">
            <input type="file" name="files" accept="image/*" multiple required>
            <br>
            <button type="submit">Upload Images</button>
        </form>
    </body>
    </html>
    """

@app.post("/upload-images/", response_model=List[ImageLocationResult])
async def upload_images(
    files: Annotated[
        List[UploadFile],
        File(description="Upload one or more image files.")
    ]
):
    """
    Accept multiple image uploads.

    For each image:
    - Extract GPS latitude / longitude from EXIF metadata.
    - Skip images whose location falls within ±10° of an already-added result.
    - Return coordinates with a hardcoded description of ``"pothole detected"``.
    """
    results: List[ImageLocationResult] = []
    seen_coords: list[tuple[float, float]] = []

    for file in files:
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(
                status_code=400,
                detail=f"{file.filename or 'Uploaded file'} is not an image file.",
            )

        contents = await file.read()

        # Try to extract GPS
        try:
            img = Image.open(io.BytesIO(contents))
            lat, lon = extract_gps(img)
        except Exception:
            lat, lon = None, None

        # Deduplication: skip if within ±10° of an already-seen location
        if lat is not None and lon is not None:
            if is_duplicate(lat, lon, seen_coords):
                continue  # skip duplicate
            seen_coords.append((lat, lon))

        results.append(
            ImageLocationResult(
                filename=file.filename or "unknown",
                latitude=lat,
                longitude=lon,
                description="pothole detected",
            )
        )

    return results


@app.post("/generate-rti/", response_model=RTIGenerationResponse)
async def generate_rti_endpoint(payload: RTIGenerationRequest):
    """
    Generate an Indian RTI application from free-text user data.

    Input must include complaint counts. Complaint dates are optional and are
    only included in the RTI when explicitly present in `user_data`.
    """
    if not payload.user_data.strip():
        raise HTTPException(status_code=400, detail="user_data cannot be empty.")

    try:
        # Lazy import keeps the main app usable even if RTI dependencies are absent.
        from file_rti import generate_rti_from_user_data

        generated_state = generate_rti_from_user_data(payload.user_data)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate RTI from provided user_data: {exc}",
        ) from exc

    report = str(generated_state.get("report", "")).strip()
    if not report:
        raise HTTPException(status_code=500, detail="RTI generation returned empty text.")

    return RTIGenerationResponse(
        applicant_name=str(generated_state["applicant_name"]),
        area=str(generated_state["area"]),
        total_complaints=int(generated_state["total_complaints"]),
        pending_complaints=int(generated_state["unsolved_complaints"]),
        complaint_dates=list(generated_state["unsolved_complaint_dates"]),
        rti_text=report,
    )


# ── Video Helpers ───────────────────────────────────────────────────────────

def _model_uses_internal_rescaling(model) -> bool:
    """
    Detect whether the first non-input layer is a Rescaling layer.

    If True, do not divide pixel values by 255 before inference.
    """
    for layer in getattr(model, "layers", []):
        layer_name = layer.__class__.__name__
        if layer_name == "InputLayer":
            continue
        return layer_name == "Rescaling"
    return False


def load_pothole_model():
    """Load and cache the pothole model from MODEL_PATH."""
    global _POTHOLE_MODEL
    global _MODEL_INPUT_SIZE
    global _MODEL_HAS_INTERNAL_RESCALING

    if _POTHOLE_MODEL is not None:
        return _POTHOLE_MODEL

    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f"Model file not found: {MODEL_PATH}. "
            "Set POTHOLE_MODEL_PATH to the correct .keras file."
        )

    try:
        import tensorflow as tf
    except ImportError as exc:
        raise RuntimeError(
            "TensorFlow is required for pothole inference. Install it with "
            "`pip install tensorflow`."
        ) from exc

    model = tf.keras.models.load_model(MODEL_PATH, compile=False)
    input_shape = model.input_shape
    if isinstance(input_shape, list):
        if not input_shape:
            raise ValueError("Model has no input tensors.")
        input_shape = input_shape[0]

    if len(input_shape) != 4:
        raise ValueError(f"Expected NHWC model input shape, got {input_shape}.")

    input_h, input_w = input_shape[1], input_shape[2]
    if input_h is None or input_w is None:
        raise ValueError("Model input height/width cannot be dynamic.")

    _MODEL_INPUT_SIZE = (int(input_h), int(input_w))
    _MODEL_HAS_INTERNAL_RESCALING = _model_uses_internal_rescaling(model)
    _POTHOLE_MODEL = model
    return _POTHOLE_MODEL


def _prepare_frame_for_model(frame: np.ndarray) -> np.ndarray:
    """Resize and normalize a BGR OpenCV frame for model inference."""
    load_pothole_model()
    if _MODEL_INPUT_SIZE is None:
        raise RuntimeError("Model input size is unknown.")

    input_h, input_w = _MODEL_INPUT_SIZE
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    resized_frame = cv2.resize(rgb_frame, (input_w, input_h), interpolation=cv2.INTER_AREA)

    model_input = resized_frame.astype(np.float32)
    if not _MODEL_HAS_INTERNAL_RESCALING and model_input.max() > 1.0:
        model_input /= 255.0

    return np.expand_dims(model_input, axis=0)


def _to_probabilities(raw_scores: np.ndarray) -> np.ndarray:
    """Convert model outputs (probabilities or logits) into probabilities."""
    scores = np.asarray(raw_scores, dtype=np.float32).reshape(-1)
    if scores.size == 0:
        raise ValueError("Model returned an empty prediction vector.")

    if scores.size == 1:
        value = float(scores[0])
        if value < 0.0 or value > 1.0:
            value = 1.0 / (1.0 + np.exp(-value))
        return np.array([value], dtype=np.float32)

    if np.any(scores < 0.0) or np.any(scores > 1.0):
        shifted = scores - np.max(scores)
        exp_scores = np.exp(shifted)
        denom = float(np.sum(exp_scores))
        if denom == 0.0:
            return np.full(scores.shape, 1.0 / scores.size, dtype=np.float32)
        return exp_scores / denom

    total = float(np.sum(scores))
    if total <= 0.0:
        return np.full(scores.shape, 1.0 / scores.size, dtype=np.float32)
    return scores / total


def predict_pothole_probability(frame: np.ndarray) -> float:
    """Return pothole probability score for a single frame."""
    model = load_pothole_model()
    batch = _prepare_frame_for_model(frame)
    raw_predictions = np.asarray(model(batch, training=False)).squeeze()
    probabilities = _to_probabilities(raw_predictions)

    if probabilities.size == 1:
        pothole_probability = float(probabilities[0])
    else:
        if 0 <= POTHOLE_CLASS_INDEX < probabilities.size:
            pothole_probability = float(probabilities[POTHOLE_CLASS_INDEX])
        else:
            pothole_probability = float(probabilities[np.argmax(probabilities)])

    return pothole_probability


def detect_pothole(frame: np.ndarray) -> bool:
    """Return True when model pothole probability >= POTHOLE_THRESHOLD."""
    pothole_probability = predict_pothole_probability(frame)

    return pothole_probability >= POTHOLE_THRESHOLD

def extract_video_gps(video_path: str) -> tuple[float | None, float | None]:
    """
    Use ffprobe to extract GPS coordinates embedded in the video file's
    metadata.  Returns (latitude, longitude) or (None, None).

    Most phone-recorded videos store a single GPS point in the
    ``com.apple.quicktime.location.ISO6709`` or ``location`` tag.

    Fallback: if ffprobe tags are unavailable, use exiftool's GPS tags.
    """
    try:
        result = subprocess.run(
            [
                "ffprobe",
                "-v", "quiet",
                "-print_format", "json",
                "-show_format",
                video_path,
            ],
            capture_output=True,
            text=True,
            timeout=15,
        )
        metadata = json.loads(result.stdout)
        tags = metadata.get("format", {}).get("tags", {})

        # Try common GPS tag names
        location_str = (
            tags.get("location")
            or tags.get("com.apple.quicktime.location.ISO6709")
            or tags.get("location-eng")
        )

        if location_str:
            # Typical format: "+12.3456+078.9012/" or "+12.3456-078.9012+100.00/"
            match = re.match(
                r"([+-]\d+\.\d+)([+-]\d+\.\d+)",
                location_str,
            )
            if match:
                return float(match.group(1)), float(match.group(2))

    except (subprocess.TimeoutExpired, json.JSONDecodeError, Exception):
        pass

    try:
        result = subprocess.run(
            [
                "exiftool",
                "-n",
                "-GPSLatitude",
                "-GPSLongitude",
                "-j",
                video_path,
            ],
            capture_output=True,
            text=True,
            timeout=15,
        )
        payload = json.loads(result.stdout)
        if payload and isinstance(payload, list):
            first = payload[0]
            lat = first.get("GPSLatitude")
            lon = first.get("GPSLongitude")
            if lat is not None and lon is not None:
                return float(lat), float(lon)
    except (FileNotFoundError, subprocess.TimeoutExpired, json.JSONDecodeError, Exception):
        pass

    return None, None


GPS_LAT_RANGE = _env_float("GPS_LAT_RANGE", 0.01)
GPS_LON_RANGE = _env_float("GPS_LON_RANGE", 0.01)
_VIDEO_DURATION_CACHE: dict[str, float] = {}


def get_video_duration(video_path: str) -> float:
    """Return duration in seconds for the given video path."""
    cached = _VIDEO_DURATION_CACHE.get(video_path)
    if cached is not None:
        return cached

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        _VIDEO_DURATION_CACHE[video_path] = 0.0
        return 0.0

    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_count = cap.get(cv2.CAP_PROP_FRAME_COUNT)
    cap.release()

    if fps <= 0:
        duration = 0.0
    else:
        duration = float(frame_count / fps)

    _VIDEO_DURATION_CACHE[video_path] = duration
    return duration


def get_video_gps_at_time(
    video_path: str,
    timestamp_sec: float,
    start_lat: float | None,
    start_lon: float | None,
) -> tuple[float | None, float | None]:
    """Interpolate latitude/longitude by timestamp across video duration."""
    if start_lat is None or start_lon is None:
        return None, None

    duration = get_video_duration(video_path)
    if duration <= 0:
        return start_lat, start_lon

    progress = min(max(timestamp_sec / duration, 0.0), 1.0)

    lat = start_lat + progress * GPS_LAT_RANGE
    lon = start_lon + progress * GPS_LON_RANGE
    return lat, lon


def clear_saved_frames_for_video(video_filename: str) -> int:
    """Delete previously saved frames for the same video basename."""
    if not os.path.isdir(POTHOLE_FRAMES_DIR):
        return 0

    base_name = os.path.splitext(os.path.basename(video_filename))[0]
    prefix = f"{base_name}_frame_"
    removed = 0
    for name in os.listdir(POTHOLE_FRAMES_DIR):
        path = os.path.join(POTHOLE_FRAMES_DIR, name)
        if name.startswith(prefix) and os.path.isfile(path):
            try:
                os.remove(path)
                removed += 1
            except OSError:
                pass
    return removed


def upload_frame_to_cloudinary(frame_path: str, lat: float, lon: float) -> str:
    """Upload a frame to Cloudinary and return its secure URL."""
    if not UPLOAD_TO_CLOUDINARY:
        return frame_path

    if cloudinary is None:
        raise RuntimeError(
            "Cloudinary package is not installed. Install it with `pip install cloudinary`."
        )

    if not CLOUDINARY_CLOUD_NAME or not CLOUDINARY_API_KEY or not CLOUDINARY_SECRET_KEY:
        raise RuntimeError(
            "Cloudinary credentials are missing. Set CLOUDINARY_CLOUD_NAME, "
            "CLOUDINARY_API_KEY, and CLOUDINARY_SECRET_KEY."
        )

    try:
        result = cloudinary.uploader.upload(
            frame_path,
            folder=CLOUDINARY_UPLOAD_FOLDER,
            resource_type="image",
            context={
                "latitude": str(lat),
                "longitude": str(lon),
            },
        )
    except Exception as exc:
        raise RuntimeError(f"Cloudinary upload failed: {exc}") from exc

    secure_url = result.get("secure_url")
    if not secure_url:
        raise RuntimeError("Cloudinary upload succeeded but secure_url is missing.")

    return str(secure_url)


def save_pothole_frame(
    frame: np.ndarray,
    video_filename: str,
    frame_idx: int,
    timestamp_sec: float,
    lat: float,
    lon: float,
    pothole_probability: float,
) -> str:
    """Persist a pothole-positive frame and include score/GPS in filename."""
    os.makedirs(POTHOLE_FRAMES_DIR, exist_ok=True)

    base_name = os.path.splitext(os.path.basename(video_filename))[0]
    output_name = (
        f"{base_name}_frame_{frame_idx:06d}_"
        f"t{timestamp_sec:07.2f}_p{pothole_probability:.3f}_"
        f"lat_{lat:.6f}_lon_{lon:.6f}.jpg"
    )
    output_path = os.path.join(POTHOLE_FRAMES_DIR, output_name)

    if not cv2.imwrite(output_path, frame):
        raise RuntimeError(f"Failed to save detected frame to {output_path}")

    return output_path


# ── Video Endpoint ──────────────────────────────────────────────────────────

@app.post("/upload-video/", response_model=List[ImageLocationResult])
async def upload_video(file: UploadFile = File(..., description="Upload a video file.")):
    """
    Accept a single video upload.

    - Run pothole model inference on sampled frames.
    - Save only frames where pothole is predicted and GPS exists.
    - Upload saved frames to Cloudinary and return remote URLs.
    """
    # Save the uploaded video to a temp file so OpenCV can read it
    suffix = os.path.splitext(file.filename or "video.mp4")[1]
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    tmp_path = tmp.name
    try:
        try:
            tmp.write(await file.read())
            tmp.flush()
        finally:
            tmp.close()

        try:
            load_pothole_model()
        except Exception as exc:
            raise HTTPException(
                status_code=500,
                detail=f"Could not load pothole model from '{MODEL_PATH}': {exc}",
            ) from exc

        video_name_for_output = file.filename or "video.mp4"
        if CLEAN_OLD_SAVED_FRAMES:
            clear_saved_frames_for_video(video_name_for_output)

        # Extract GPS from the video's metadata
        start_lat, start_lon = extract_video_gps(tmp_path)
        if start_lat is None or start_lon is None:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Video does not contain readable GPS metadata. "
                    "Inject GPSLatitude/GPSLongitude tags before upload."
                ),
            )

        cap = cv2.VideoCapture(tmp_path)
        if not cap.isOpened():
            raise HTTPException(status_code=400, detail="Could not open the video file.")

        results: List[ImageLocationResult] = []
        frame_idx = 0

        try:
            fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
            frame_interval = VIDEO_FRAME_STRIDE

            while True:
                ret, frame = cap.read()
                if not ret:
                    break

                # Only process every Nth frame.
                if frame_idx % frame_interval != 0:
                    frame_idx += 1
                    continue

                timestamp_sec = frame_idx / fps

                pothole_probability = predict_pothole_probability(frame)
                if pothole_probability < POTHOLE_THRESHOLD:
                    frame_idx += 1
                    continue

                lat, lon = get_video_gps_at_time(
                    tmp_path, timestamp_sec, start_lat, start_lon
                )
                if lat is None or lon is None:
                    frame_idx += 1
                    continue

                try:
                    saved_frame_path = save_pothole_frame(
                        frame=frame,
                        video_filename=video_name_for_output,
                        frame_idx=frame_idx,
                        timestamp_sec=timestamp_sec,
                        lat=lat,
                        lon=lon,
                        pothole_probability=pothole_probability,
                    )
                except RuntimeError as exc:
                    raise HTTPException(status_code=500, detail=str(exc)) from exc

                try:
                    stored_frame_reference = upload_frame_to_cloudinary(
                        frame_path=saved_frame_path,
                        lat=lat,
                        lon=lon,
                    )
                except RuntimeError as exc:
                    raise HTTPException(status_code=500, detail=str(exc)) from exc

                if (
                    UPLOAD_TO_CLOUDINARY
                    and DELETE_LOCAL_FRAME_AFTER_UPLOAD
                    and os.path.exists(saved_frame_path)
                ):
                    try:
                        os.remove(saved_frame_path)
                    except OSError:
                        pass

                results.append(
                    ImageLocationResult(
                        filename=stored_frame_reference,
                        latitude=lat,
                        longitude=lon,
                        description="pothole detected",
                    )
                )

                frame_idx += 1
        finally:
            cap.release()

    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)

    return results


# ── Run directly ────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("location:app", host="0.0.0.0", port=8000, reload=True)
