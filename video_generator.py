import argparse
import os
import random
import shutil
import subprocess

import cv2


DATASET_PATH = "dataset"
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}


def list_images(folder_path: str) -> list[str]:
    if not os.path.isdir(folder_path):
        raise FileNotFoundError(f"Image folder not found: {folder_path}")

    images = []
    for name in os.listdir(folder_path):
        path = os.path.join(folder_path, name)
        ext = os.path.splitext(name)[1].lower()
        if os.path.isfile(path) and ext in IMAGE_EXTENSIONS:
            images.append(path)

    if not images:
        raise RuntimeError(f"No image files found in: {folder_path}")

    return images


def build_iso6709(lat: float, lon: float) -> str:
    return f"{lat:+.6f}{lon:+.6f}/"


def embed_gps_metadata(video_path: str, lat: float, lon: float) -> None:
    if shutil.which("exiftool") is None:
        raise RuntimeError(
            "exiftool is required to write GPS metadata. Install it and rerun."
        )

    iso6709 = build_iso6709(lat, lon)
    command = [
        "exiftool",
        "-overwrite_original",
        f"-GPSLatitude={lat}",
        f"-GPSLongitude={lon}",
        f"-QuickTime:GPSCoordinates={iso6709}",
        video_path,
    ]
    subprocess.run(command, check=True, capture_output=True, text=True)


def generate_video(
    output_path: str,
    fps: int,
    total_frames: int,
    pothole_ratio: float,
    lat: float,
    lon: float,
    seed: int | None,
) -> None:
    if seed is not None:
        random.seed(seed)

    normal_path = os.path.join(DATASET_PATH, "normal")
    pothole_path = os.path.join(DATASET_PATH, "potholes")

    normal_images = list_images(normal_path)
    pothole_images = list_images(pothole_path)

    sample = cv2.imread(random.choice(normal_images))
    if sample is None:
        raise RuntimeError("Failed to read a sample image from dataset/normal")

    height, width, _ = sample.shape
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    video = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    if not video.isOpened():
        raise RuntimeError(f"Could not open video writer for: {output_path}")

    try:
        for i in range(total_frames):
            if random.random() < pothole_ratio:
                img_path = random.choice(pothole_images)
                label = "POTHOLE"
            else:
                img_path = random.choice(normal_images)
                label = "NORMAL"

            frame = cv2.imread(img_path)
            if frame is None:
                continue

            frame = cv2.resize(frame, (width, height))
            cv2.putText(
                frame,
                label,
                (20, 40),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                (0, 255, 255),
                2,
            )
            video.write(frame)
    finally:
        video.release()

    embed_gps_metadata(output_path, lat, lon)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate a synthetic pothole video with GPS metadata."
    )
    parser.add_argument("--output", default="demo_video.mp4", help="Output video path")
    parser.add_argument("--fps", type=int, default=2, help="Frames per second")
    parser.add_argument(
        "--total-frames", type=int, default=60, help="Number of frames to generate"
    )
    parser.add_argument(
        "--pothole-ratio",
        type=float,
        default=0.3,
        help="Probability of selecting a pothole frame (0 to 1)",
    )
    parser.add_argument("--lat", type=float, default=12.9716, help="GPS latitude")
    parser.add_argument("--lon", type=float, default=77.5946, help="GPS longitude")
    parser.add_argument("--seed", type=int, default=None, help="Random seed")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()

    generate_video(
        output_path=args.output,
        fps=args.fps,
        total_frames=args.total_frames,
        pothole_ratio=args.pothole_ratio,
        lat=args.lat,
        lon=args.lon,
        seed=args.seed,
    )

    print(f"Video generated with GPS metadata: {args.output}")
    print(f"Latitude: {args.lat}, Longitude: {args.lon}")
    print(f"ISO6709: {build_iso6709(args.lat, args.lon)}")