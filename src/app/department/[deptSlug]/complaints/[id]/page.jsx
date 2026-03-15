// app/department/[deptSlug]/complaints/[complaintId]/page.jsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import {
  getDepartmentBySlug,
  getAllDepartments,
} from "@/config/departments.config";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import { ChevronLeft, MapPin, Search, AlertTriangle, ShieldCheck } from "lucide-react";

const ComplaintMap = dynamic(() => import("@/components/ComplaintMap"), {
  ssr: false,
});

export default function ComplaintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { deptSlug } = params;
  const complaintId = params.id;

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);

  const department = getDepartmentBySlug(deptSlug);
  const allDepartments = getAllDepartments();

  useEffect(() => {
    fetchComplaint();
  }, [complaintId]);

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/complaint/${complaintId}`);
      setComplaint(response.data.complaint);
    } catch (error) {
      console.error("Error fetching complaint:", error);
      toast.error("Failed to load complaint details");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdating(true);
      const response = await axios.patch(
        `/api/complaint/${complaintId}/status`,
        {
          status: newStatus,
        }
      );
      toast.success(`Complaint status updated to ${newStatus}`);
      setShowStatusModal(false);
      fetchComplaint(); // Refresh data
    } catch (error) {
      console.error("Error updating status:", error);
      if (error.response?.status === 403) {
        toast.error(
          error.response.data.message ||
            "Cannot change status of a resolved complaint"
        );
      } else {
        toast.error(error.response?.data?.error || "Failed to update status");
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleDepartmentChange = async (newDepartment) => {
    try {
      setUpdating(true);
      const response = await axios.patch(
        `/api/complaint/${complaintId}/department`,
        {
          department: newDepartment,
        }
      );
      toast.success(response.data.message || "Department changed successfully");
      setShowDepartmentModal(false);
      // Redirect to the new department's complaint page
      router.push(`/department/${newDepartment}/complaints/${complaintId}`);
    } catch (error) {
      console.error("Error changing department:", error);
      if (error.response?.status === 403) {
        toast.error(
          error.response.data.message ||
            "Cannot change department of a resolved complaint"
        );
      } else {
        toast.error(
          error.response?.data?.error || "Failed to change department"
        );
      }
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]";
      case "in_progress":
        return "bg-blue-500/20 text-blue-400 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]";
      case "resolved":
        return "bg-green-500/20 text-green-400 border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.2)]";
      case "rejected":
        return "bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/50";
    }
  };

  const getStatusLabel = (status) => {
    if (status === "in_progress") return "In Progress";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-mono">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4 drop-shadow-[0_0_8px_currentColor]"></div>
          <p className="text-cyan-500 tracking-widest uppercase animate-pulse">Scanning Grid...</p>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-mono">
        <div className="text-center bg-gray-950/80 backdrop-blur-md p-10 rounded-2xl border border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
          <AlertTriangle className="mx-auto text-red-500 mb-4 drop-shadow-[0_0_8px_currentColor]" size={64} />
          <h2 className="text-2xl font-bold text-red-400 mb-2 uppercase tracking-widest">
            Log Not Found
          </h2>
          <p className="text-red-500/70 mb-6">
            The target anomaly record does not exist or has been expunged.
          </p>
          <Link
            href={`/department/${deptSlug}/complaints`}
            className="text-cyan-400 hover:text-cyan-300 hover:shadow-[0_0_10px_currentColor] transition duration-300 border border-cyan-500/30 px-6 py-2 rounded-lg bg-cyan-950/30 uppercase tracking-widest text-sm inline-block"
          >
            ← Return to Intel Base
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono relative overflow-hidden pb-12">
      {/* Holographic Background Grid */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />
      <div className="fixed top-0 left-0 w-full h-[30vh] bg-gradient-to-b from-cyan-900/10 to-transparent pointer-events-none z-0" />

      {/* Header */}
      <div className="bg-gray-950/80 backdrop-blur-md border-b border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                href={`/department/${deptSlug}/complaints`}
                className="p-2 border border-cyan-500/30 bg-gray-900 rounded-lg text-cyan-400 hover:bg-cyan-950 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all"
              >
                <ChevronLeft size={24} />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-cyan-300 tracking-widest uppercase drop-shadow-[0_0_8px_currentColor] flex items-center gap-3">
                  <span className="w-2 h-6 bg-cyan-400 block"></span>
                  Log // Details
                </h1>
                <p className="text-sm text-cyan-600 tracking-wider uppercase">{department?.name} Sector</p>
              </div>
            </div>
            <button
              onClick={() => setShowStatusModal(true)}
              disabled={complaint.status === "resolved"}
              className={`px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-sm transition-all relative ${
                complaint.status === "resolved"
                  ? "bg-gray-800 text-cyan-500 border border-gray-700 cursor-not-allowed"
                  : "bg-cyan-500/10 text-cyan-300 border border-cyan-400 hover:bg-cyan-400 hover:text-black hover:shadow-[0_0_20px_rgba(6,182,212,0.6)]"
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
              {complaint.status === "resolved" ? "Status Locked" : "Update Status"}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Complaint Info Card */}
            <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.05)] p-8 relative overflow-hidden group">
              {/* Corner Decor */}
              <div className="absolute -top-px -left-px w-6 h-6 border-t-2 border-l-2 border-cyan-400/50"></div>
              <div className="absolute -top-px -right-px w-6 h-6 border-t-2 border-r-2 border-cyan-400/50"></div>
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

              <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-8 gap-4 border-b border-cyan-500/20 pb-6">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-cyan-100 mb-3 tracking-wide flex items-center gap-3">
                     <Search size={24} className="text-cyan-500" />
                    {complaint.issueType}
                  </h2>
                  <span
                    className={`inline-block px-4 py-1.5 text-xs tracking-widest uppercase font-bold rounded-sm border ${getStatusColor(
                      complaint.status
                    )}`}
                  >
                    STATUS // {getStatusLabel(complaint.status)}
                  </span>
                </div>
                {complaint.priority && (
                  <span
                    className={`px-4 py-1.5 text-xs tracking-widest font-bold uppercase rounded-sm border ${
                      complaint.priority === "high"
                        ? "bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                        : complaint.priority === "medium"
                        ? "bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                        : "bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                    }`}
                  >
                    Priority // {complaint.priority}
                  </span>
                )}
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-xs tracking-widest uppercase text-cyan-600 mb-3 font-semibold flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-cyan-600"></span> User_Description
                  </h3>
                  <p className="text-gray-300 leading-relaxed bg-black/40 p-4 rounded-lg border border-cyan-900/50">
                    {complaint.description || "No description provided."}
                  </p>
                </div>

                <div className="border border-cyan-500/30 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(6,182,212,0.1)] relative z-0">
                  <div className="bg-cyan-950/50 px-4 py-3 border-b border-cyan-500/30 flex items-center justify-between">
                     <h2 className="text-sm font-bold text-cyan-300 tracking-widest uppercase flex items-center gap-2">
                        <MapPin size={16} className="text-cyan-400" /> Geolocation Data
                     </h2>
                  </div>
                  {/* Keep the map behind modals context by ensuring it's lower z-index than mod */}
                  <div className="isolate z-0 relative">
                     <ComplaintMap
                        latitude={complaint.location.latitude}
                        longitude={complaint.location.longitude}
                     />
                  </div>
                </div>

                {complaint.location?.address && (
                  <div>
                    <h3 className="text-xs tracking-widest uppercase text-cyan-600 mb-3 font-semibold flex items-center gap-2">
                       <span className="w-1.5 h-1.5 bg-cyan-600"></span> Area_Vector
                    </h3>
                    <div className="flex items-start gap-3 bg-black/40 p-4 rounded-lg border border-cyan-900/50">
                      <MapPin className="text-cyan-500 shrink-0 mt-0.5" size={20} />
                      <div>
                        <p className="text-gray-300 text-sm">
                          {complaint.location.address}
                        </p>
                        {complaint.location.latitude &&
                          complaint.location.longitude && (
                            <a
                              href={`https://www.google.com/maps?q=${complaint.location.latitude},${complaint.location.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline hover:drop-shadow-[0_0_5px_currentColor] mt-2 inline-block uppercase tracking-wider transition"
                            >
                              Initialize Map Uplink →
                            </a>
                          )}
                      </div>
                    </div>
                  </div>
                )}

                {complaint.images && complaint.images.length > 0 && (
                  <div>
                    <h3 className="text-xs tracking-widest uppercase text-cyan-600 mb-3 font-semibold flex items-center gap-2">
                       <span className="w-1.5 h-1.5 bg-cyan-600"></span> Visual_Telemetry
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {complaint.images.map((image, index) => (
                        <div key={index} className="relative group overflow-hidden rounded-lg border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.1)] cursor-pointer" onClick={() => window.open(image, "_blank")}>
                           <div className="absolute inset-0 bg-cyan-500/20 mix-blend-screen opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none"></div>
                           <img
                             src={image}
                             alt={`Complaint image ${index + 1}`}
                             className="w-full h-48 object-cover filter brightness-90 group-hover:brightness-110 transition duration-300"
                           />
                           {/* Targeting reticle overlay */}
                           <div className="absolute inset-0 border border-cyan-400/30 m-2 opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none">
                              <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-cyan-400"></div>
                              <div className="absolute -top-1 -right-1 w-2 h-2 border-t border-r border-cyan-400"></div>
                              <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b border-l border-cyan-400"></div>
                              <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-cyan-400"></div>
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Metadata Card */}
            <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.05)] p-6 relative">
              <h3 className="text-sm font-bold text-cyan-300 mb-6 tracking-widest uppercase flex items-center justify-between border-b border-cyan-500/20 pb-2">
                Log_Data
                <span className="w-1.5 h-1.5 bg-cyan-400 animate-pulse rounded-full shadow-[0_0_5px_currentColor]"></span>
              </h3>
              <div className="space-y-5 text-sm">
                <div className="flex flex-col border-b border-gray-800 pb-2">
                  <span className="text-[10px] text-cyan-600 tracking-widest uppercase mb-1 drop-shadow-[0_0_8px_currentColor]">Anomaly ID</span>
                  <span className="font-mono text-cyan-100 break-all">{complaint._id}</span>
                </div>
                <div className="flex flex-col border-b border-gray-800 pb-2">
                  <span className="text-[10px] text-cyan-600 tracking-widest uppercase mb-1 drop-shadow-[0_0_8px_currentColor]">Sector Routing</span>
                  <span className="text-cyan-100 uppercase tracking-widest">{complaint.assignedDepartment}</span>
                </div>
                <div className="flex flex-col border-b border-gray-800 pb-2">
                  <span className="text-[10px] text-cyan-600 tracking-widest uppercase mb-1 drop-shadow-[0_0_8px_currentColor]">Timestamp Initial</span>
                  <span className="text-cyan-100 font-mono">
                    {new Date(complaint.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                </div>
                {complaint.updatedAt && (
                  <div className="flex flex-col">
                    <span className="text-[10px] text-cyan-600 tracking-widest uppercase mb-1 drop-shadow-[0_0_8px_currentColor]">Last Mod Scan</span>
                    <span className="text-cyan-100 font-mono">
                      {new Date(complaint.updatedAt).toLocaleDateString(
                        "en-IN",
                        { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", }
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Card */}
            <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.05)] p-6 relative">
              <h3 className="text-sm font-bold text-cyan-300 mb-6 tracking-widest uppercase border-b border-cyan-500/20 pb-2">
                Command_Directives
              </h3>

              {complaint.status === "resolved" && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="text-green-400 shrink-0" size={20} />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-green-400 mb-1 drop-shadow-[0_0_5px_currentColor]">
                        Resolved Protocol Active
                      </p>
                      <p className="text-[11px] text-green-500/70">
                        Object cleared. Edits locked due to clearance levels.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <button
                  onClick={() => setShowStatusModal(true)}
                  disabled={complaint.status === "resolved"}
                  className={`w-full px-4 py-3 rounded-lg font-bold uppercase tracking-widest text-xs transition-all relative ${
                    complaint.status === "resolved"
                      ? "bg-gray-800 text-cyan-500 border border-gray-700 cursor-not-allowed"
                      : "bg-cyan-500/10 text-cyan-300 border border-cyan-400 hover:bg-cyan-400 hover:text-black hover:shadow-[0_0_20px_rgba(6,182,212,0.6)]"
                  }`}
                >
                  {complaint.status === "resolved"
                    ? "Status Locked"
                    : "Override Status"}
                </button>
                <button className="w-full px-4 py-3 bg-black text-cyan-400 border border-cyan-800 rounded-lg hover:bg-cyan-950/50 hover:border-cyan-500/50 transition-colors uppercase tracking-widest text-xs font-bold">
                  Attach Notes
                </button>
                <button className="w-full px-4 py-3 bg-black text-cyan-400 border border-cyan-800 rounded-lg hover:bg-cyan-950/50 hover:border-cyan-500/50 transition-colors uppercase tracking-widest text-xs font-bold">
                  Ping Operator
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal (Z-INDEX FIX: z-[9999]) */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-gray-950 border border-cyan-500/50 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.2)] max-w-md w-full p-6 relative">
             {/* Corner decor */}
             <div className="absolute -top-px -left-px w-4 h-4 border-t-2 border-l-2 border-cyan-400"></div>
             <div className="absolute -top-px -right-px w-4 h-4 border-t-2 border-r-2 border-cyan-400"></div>
             <div className="absolute -bottom-px -left-px w-4 h-4 border-b-2 border-l-2 border-cyan-400"></div>
             <div className="absolute -bottom-px -right-px w-4 h-4 border-b-2 border-r-2 border-cyan-400"></div>

            <h3 className="text-xl font-bold text-cyan-300 mb-6 tracking-widest uppercase flex items-center gap-2">
               <ShieldCheck className="text-cyan-500" /> System_Override
            </h3>

            {complaint.status === "resolved" ? (
              <div className="mb-6">
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg mb-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-6 h-6 text-green-400 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-green-400 mb-1 uppercase tracking-widest text-sm">
                        Lock Engaged
                      </p>
                      <p className="text-xs text-green-500/70">
                        This complaint has been marked as resolved.
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="w-full px-4 py-3 bg-black text-white rounded-lg border border-gray-700 hover:bg-gray-900 uppercase tracking-widest text-xs font-bold"
                >
                  Exit Interface
                </button>
              </div>
            ) : (
              <>
                <p className="text-xs text-cyan-600 mb-6 tracking-widest uppercase">
                  Select new operational state:
                </p>
                <div className="space-y-3">
                  {["pending", "in_progress", "resolved", "rejected"].map(
                    (status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusUpdate(status)}
                        disabled={updating || complaint.status === status}
                        className={`w-full px-4 py-3 rounded-lg text-left font-bold uppercase tracking-widest text-xs transition-all border ${
                          complaint.status === status
                            ? "bg-gray-900 border-cyan-800 text-cyan-600 cursor-not-allowed"
                            : "bg-black text-cyan-300 border-cyan-500/30 hover:bg-cyan-900/40 hover:border-cyan-400"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{getStatusLabel(status)}</span>
                          {complaint.status === status && (
                            <span className="text-[10px] bg-cyan-900 text-cyan-400 px-2 py-1 rounded shadow-[0_0_5px_rgba(6,182,212,0.3)] border border-cyan-500/50">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        {status === "resolved" && (
                          <p className="text-[10px] text-amber-500/70 mt-2 normal-case tracking-normal font-normal">
                            ⚠️ System lock will engage upon selection.
                          </p>
                        )}
                      </button>
                    )
                  )}
                </div>
                <button
                  onClick={() => setShowStatusModal(false)}
                  disabled={updating}
                  className="w-full mt-6 px-4 py-3 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg uppercase tracking-widest text-xs font-bold transition-colors"
                >
                  Abort
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
