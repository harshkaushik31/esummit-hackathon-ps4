"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Upload, Loader2, CheckCircle, AlertCircle, Video } from "lucide-react";

export default function RegisterComplaintPage() {
  const router = useRouter();

  const [videoFile, setVideoFile] = useState(null);
  const [detectedPotholes, setDetectedPotholes] = useState([]);

  const [processingVideo, setProcessingVideo] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const issueType = "pothole";
  const department = "PWD";
  const description = "Pothole detected using AI video analysis.";

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setError("INVALID FORMAT: Video file required.");
      return;
    }

    setVideoFile(file);
    setProcessingVideo(true);
    setError("");
    setDetectedPotholes([]);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        "http://localhost:8000/upload-video/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setDetectedPotholes(response.data);
      console.log(response.data);
    } catch (err) {
      console.error(err);
      setError("ANALYSIS FAILED: Unable to process telemetry.");
    }

    setProcessingVideo(false);
  };

  const handleSubmit = async () => {
    if (detectedPotholes.length === 0) {
      setError("NO DATA: Process a video to detect anomalies first.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const submissions = detectedPotholes.map((pothole) => {
        const submitData = new FormData();
        submitData.append("frame_url", pothole.filename);
        submitData.append("issue-type", issueType);
        submitData.append("description", description);
        submitData.append("assigned-dept", department);
        submitData.append("latitude", pothole.latitude || 0);
        submitData.append("longitude", pothole.longitude || 0);

        return axios.post("/api/users/register-complaint", submitData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      });

      await Promise.all(submissions);

      setSuccess(true);
      setTimeout(() => {
        router.push("/user-profile/track-complaint");
      }, 3000);
    } catch (err) {
      console.error(err);
      setError("UPLINK ERROR: Failed to register anomalies.");
    }

    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden font-mono z-10 w-full">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />
        <div className="bg-gray-950/80 backdrop-blur-md p-10 rounded-2xl border border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.2)] text-center relative z-10 max-w-lg w-full">
          <CheckCircle className="mx-auto text-cyan-400 mb-6 drop-shadow-[0_0_8px_currentColor]" size={64} />
          <h2 className="text-2xl font-bold mb-4 text-cyan-300 tracking-widest uppercase">
            Data Transmitted
          </h2>
          <p className="text-cyan-500/70 tracking-widest text-sm animate-pulse">
            Rerouting to tracking matrix...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 relative overflow-hidden font-mono z-10 w-full pt-10">
      {/* Holographic Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />
      <div className="absolute top-0 left-0 w-full h-[30vh] bg-gradient-to-b from-cyan-900/10 to-transparent pointer-events-none z-0" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-4 text-cyan-400 drop-shadow-[0_0_8px_currentColor] tracking-widest uppercase">
          <span className="w-3 h-8 bg-cyan-400 animate-pulse block"></span>
          Auto_Detect // Anomalies
        </h1>

        {error && (
          <div className="bg-red-950/40 border border-red-500/50 p-4 rounded-lg flex items-center gap-3 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <AlertCircle className="text-red-500 shrink-0" size={20} />
            <span className="text-red-400 tracking-wide text-sm">{error}</span>
          </div>
        )}

        {/* Video Upload Section */}
        <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-8 shadow-[0_0_20px_rgba(6,182,212,0.05)] border border-cyan-500/30 group isolate relative">
          {/* Corner decor */}
          <div className="absolute -top-px -left-px w-4 h-4 border-t-2 border-l-2 border-cyan-400/50"></div>
          <div className="absolute -bottom-px -right-px w-4 h-4 border-b-2 border-r-2 border-cyan-400/50"></div>

          <h2 className="text-xl font-semibold mb-6 flex items-center gap-3 text-cyan-300 tracking-widest uppercase">
            <Video className="text-cyan-400" size={20} />
            Input_Feed
          </h2>

          <div className="relative">
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="block w-full text-sm text-cyan-500/70 border border-cyan-500/30 rounded-lg p-3 bg-black/50 hover:border-cyan-400 transition-colors cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-cyan-500/10 file:text-cyan-400 hover:file:bg-cyan-500 hover:file:text-black file:uppercase file:tracking-widest file:transition-all"
            />
          </div>

          {processingVideo && (
            <div className="flex items-center gap-3 mt-6 text-cyan-400 text-sm tracking-widest uppercase bg-cyan-950/30 p-4 border border-cyan-500/30 rounded-lg">
              <Loader2 className="animate-spin text-cyan-300" size={18} />
              <span className="animate-pulse">Analyzing frame sequence...</span>
            </div>
          )}

          {videoFile && !processingVideo && (
            <p className="mt-4 text-emerald-400 text-sm tracking-widest uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_5px_currentColor]"></span>
              Feed uploaded. Awaiting classification.
            </p>
          )}
        </div>

        {/* Dynamic Grid of Detected Potholes */}
        {detectedPotholes.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-sm font-semibold text-cyan-400 tracking-widest justify-between flex uppercase items-center border-b border-cyan-500/30 pb-2">
              <span>Threats_Detected: {detectedPotholes.length}</span>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_currentColor]"></span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {detectedPotholes.map((pothole, idx) => (
                <div key={idx} className="bg-gray-900/60 backdrop-blur-md rounded-xl p-4 shadow-[0_0_15px_rgba(6,182,212,0.1)] border border-cyan-500/30 hover:border-cyan-400 transition-all group relative overflow-hidden">
                  
                  {/* Holographic Accent Bar */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-600 via-teal-400 to-cyan-600 opacity-60 group-hover:opacity-100 transition-opacity" />

                  <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden border border-white/5 bg-gray-950">
                    {pothole.filename ? (
                      <img
                        src={pothole.filename}
                        alt="Detected anomaly"
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                        <Video size={30} className="mb-2 opacity-50" />
                        <span className="text-xs font-mono uppercase">Image Unavailable</span>
                      </div>
                    )}
                    {/* Targeting reticle overlay */}
                    <div className="absolute inset-0 bg-cyan-900/20 mix-blend-screen pointer-events-none"></div>
                    <div className="absolute inset-0 border border-cyan-500/30 m-2 pointer-events-none">
                       <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-cyan-400"></div>
                       <div className="absolute -top-1 -right-1 w-2 h-2 border-t border-r border-cyan-400"></div>
                       <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b border-l border-cyan-400"></div>
                       <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-cyan-400"></div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-400">
                    <div className="flex justify-between border-b border-slate-800 pb-1">
                      <span className="uppercase tracking-widest">ID</span>
                      <span className="text-cyan-300">#{idx + 1}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-1">
                      <span className="uppercase tracking-widest">LAT</span>
                      <span className="text-cyan-100">{pothole.latitude?.toFixed(5) || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-1">
                      <span className="uppercase tracking-widest">LNG</span>
                      <span className="text-cyan-100">{pothole.longitude?.toFixed(5) || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-1">
                      <span className="uppercase tracking-widest">Priority</span>
                      <span className="text-red-400 uppercase">High</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="mt-10 w-full bg-cyan-500/10 border border-cyan-400 hover:bg-cyan-400 hover:text-black hover:shadow-[0_0_20px_rgba(6,182,212,0.6)] text-cyan-300 disabled:opacity-50 disabled:hover:bg-cyan-500/10 disabled:hover:text-cyan-300 disabled:hover:shadow-none py-4 rounded-xl font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-300 overflow-hidden relative group isolate"
            >
              <span className="relative z-10 flex items-center gap-3">
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    TRANSMITTING DATA...
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    INITIALIZE UPLINK
                  </>
                )}
              </span>
              {!submitting && (
                <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

