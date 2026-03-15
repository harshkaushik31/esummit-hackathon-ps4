"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { 
  Trash2, 
  AlertTriangle, 
  Search, 
  FileText, 
  Calendar, 
  MapPin, 
  User,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  Eye,
  Clock,
  Filter
} from "lucide-react";

export default function Page() {
  const router = useRouter();
  
  // State management
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Fetch user's complaints
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await axios.get("/api/users/your-complaints");
      
      if (response.data.success) {
        setComplaints(response.data.complaints || []);
      } else {
        setError("Failed to fetch complaints");
      }
    } catch (error) {
      console.error("Error fetching complaints:", error);
      setError(error.response?.data?.message || "Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  };

  // Delete complaint
  const deleteComplaint = async (complaintId) => {
    try {
      setDeleteLoading(complaintId);
      
      const response = await axios.delete("/api/users/delete-complaint", {
        data: { complaintId }
      });
      
      if (response.data.success) {
        // Remove complaint from local state
        setComplaints(prev => prev.filter(complaint => complaint._id !== complaintId));
        setShowConfirmModal(false);
        setSelectedComplaint(null);
      } else {
        setError("Failed to delete complaint");
      }
    } catch (error) {
      console.error("Error deleting complaint:", error);
      setError(error.response?.data?.message || "Failed to delete complaint");
    } finally {
      setDeleteLoading(null);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in progress':
      case 'investigating':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved':
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-900/50 text-cyan-200 border-cyan-500/30';
    }
  };

  // Can delete complaint (only pending complaints)
  const canDeleteComplaint = (complaint) => {
    return complaint.status?.toLowerCase() === 'pending';
  };

  // Filter complaints
  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.issueType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.location?.address?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || complaint.status?.toLowerCase() === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  // Handle confirm delete
  const handleConfirmDelete = (complaint) => {
    setSelectedComplaint(complaint);
    setShowConfirmModal(true);
  };

  // Load complaints on component mount
  useEffect(() => {
    fetchComplaints();
  }, []);

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden p-4 md:p-6 text-cyan-50 font-mono">
        {/* Holographic Background Grid */}
        <div className="fixed inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-cyan-400 mb-2 uppercase tracking-widest drop-shadow-[0_0_8px_currentColor]">
              Remove Records
            </h1>
            <p className="text-cyan-50 text-lg tracking-widest uppercase text-xs">Loading Log Data...</p>
          </div>
          
          <div className="bg-gray-950/80 backdrop-blur-md border border-cyan-500/30 rounded-2xl shadow-xl p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-4 bg-gray-300 rounded w-1/3"></div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="border rounded-xl p-4">
                    <div className="h-6 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-800/50 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-800/50 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden p-4 md:p-6 text-cyan-50 font-mono">
      {/* Holographic Background Grid */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Trash2 className="text-red-500 mr-3" size={40} />
            <h1 className="text-3xl md:text-4xl font-bold text-cyan-400 uppercase tracking-widest drop-shadow-[0_0_8px_currentColor]">
              Remove Records
            </h1>
          </div>
          <p className="text-cyan-50 text-lg">
            Manage and remove pending telemetry logs
          </p>

        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center space-x-3">
              <XCircle className="text-red-500 flex-shrink-0" size={24} />
              <div className="flex-1">
                <h3 className="text-red-800 font-semibold">Error</h3>
                <p className="text-red-600">{error}</p>
              </div>
              <button 
                onClick={() => setError("")}
                className="text-red-400 hover:text-red-600 transition-colors"
              >
                <XCircle size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-gray-950/80 backdrop-blur-md border border-cyan-500/30 rounded-2xl shadow-[0_0_15px_rgba(6,182,212,0.1)] p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-600" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search logs by description, type, or vector..."
                className="w-full pl-12 pr-4 py-3 bg-black border border-cyan-500/50 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-cyan-50 placeholder-cyan-800 transition-colors"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-600" size={20} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-12 pr-8 py-3 bg-black border border-cyan-500/50 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-cyan-50 transition-colors uppercase tracking-widest text-xs font-bold"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* No Complaints */}
        {filteredComplaints.length === 0 && !loading && (
          <div className="bg-gray-950/80 backdrop-blur-md border border-cyan-500/30 rounded-2xl shadow-xl p-12 text-center">
            <FileText className="mx-auto text-gray-400 mb-6" size={64} />
            <h3 className="text-cyan-300 font-semibold text-xl mb-3">
              {searchTerm || filterStatus !== 'all' ? 'No Matching Complaints' : 'No Complaints Found'}
            </h3>
            <p className="text-cyan-500 mb-6">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'You haven\'t submitted any complaints yet.'
              }
            </p>
            <button
              onClick={() => router.push("/user-profile/register-complaint")}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              Register New Complaint
            </button>
          </div>
        )}

        {/* Complaints List */}
        <div className="space-y-6">
          {filteredComplaints.map((complaint) => (
            <div key={complaint._id} className="bg-gray-950/80 backdrop-blur-md border border-cyan-500/30 rounded-2xl shadow-[0_0_15px_rgba(6,182,212,0.1)] overflow-hidden">
              {/* Status Header */}
              <div className="bg-gray-900 border-b border-cyan-500/30 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-cyan-300">
                    <FileText size={20} />
                    <span className="font-bold tracking-widest uppercase text-sm">
                      {complaint.issueType?.replace('-', ' ') || 'Issue'}
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded-sm text-[10px] tracking-widest uppercase font-bold border ${getStatusColor(complaint.status)}`}>
                    {complaint.status || 'Unknown'}
                  </span>
                </div>
              </div>

              <div className="p-6">
                {/* Complaint Details */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-black/40 p-4 rounded-lg border border-cyan-900/50">
                    <h3 className="text-sm font-bold tracking-widest uppercase text-cyan-500 mb-3 border-b border-cyan-900/50 pb-2">Log Details</h3>
                    <div className="space-y-2">
                      <p className="text-cyan-50 leading-relaxed text-sm">{complaint.description}</p>
                      
                      {complaint.assignedDepartment && (
                        <div className="flex items-center text-[10px] font-bold tracking-widest text-teal-400 mt-4 uppercase">
                          <User size={14} className="mr-2" />
                          <span>Sector: {complaint.assignedDepartment}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-black/40 p-4 rounded-lg border border-cyan-900/50">
                    <h3 className="text-sm font-bold tracking-widest uppercase text-cyan-500 mb-3 border-b border-cyan-900/50 pb-2">Telemetry</h3>
                    <div className="space-y-4">
                      <div className="flex items-center text-xs text-cyan-100">
                        <Calendar size={16} className="mr-3 text-cyan-500" />
                        <div>
                          <p className="font-bold text-[10px] text-cyan-600 uppercase tracking-widest">Initial Sequence</p>
                          <p>{formatDate(complaint.createdAt)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-xs text-cyan-100">
                        <Clock size={16} className="mr-3 text-cyan-500" />
                        <div>
                          <p className="font-bold text-[10px] text-cyan-600 uppercase tracking-widest">Last Mod Scan</p>
                          <p>{formatDate(complaint.updatedAt)}</p>
                        </div>
                      </div>

                      {complaint.location?.address && (
                        <div className="flex items-start text-xs text-cyan-100 pt-2 border-t border-cyan-900/50">
                          <MapPin size={16} className="mr-3 text-red-400 flex-shrink-0 mt-0.5" />
                          <span>{complaint.location.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Image Preview */}
                {complaint.imageUrl && (
                  <div className="mb-6 bg-black/40 p-4 rounded-lg border border-cyan-900/50">
                    <h3 className="text-sm font-bold tracking-widest uppercase text-cyan-500 mb-3">Evidence Scan</h3>
                    <div className="rounded-xl overflow-hidden border border-cyan-500/30">
                      <img
                        src={complaint.imageUrl}
                        alt="Evidence Scan"
                        className="w-full h-48 object-cover opacity-80 hover:opacity-100 transition-opacity"
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-cyan-500/30">
                  <button
                    onClick={() => router.push(`/user-profile/track-complaint?id=${complaint._id}`)}
                    className="flex items-center justify-center space-x-2 bg-cyan-500/10 border border-cyan-400 text-cyan-300 font-bold uppercase tracking-widest text-xs px-4 py-2 rounded-lg hover:bg-cyan-400 hover:text-black transition-colors"
                  >
                    <Eye size={16} />
                    <span>View Telemetry</span>
                  </button>

                  {canDeleteComplaint(complaint) ? (
                    <button
                      onClick={() => handleConfirmDelete(complaint)}
                      disabled={deleteLoading === complaint._id}
                      className="flex items-center justify-center space-x-2 bg-red-500/10 border border-red-500 text-red-400 font-bold uppercase tracking-widest text-xs px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white disabled:opacity-50 transition-colors"
                    >
                      {deleteLoading === complaint._id ? (
                        <>
                          <Loader2 className="animate-spin" size={16} />
                          <span>Purging...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 size={16} />
                          <span>Purge Data</span>
                        </>
                      )}
                    </button>
                  ) : (
                     <div className="flex items-center justify-center space-x-2 bg-gray-900 border border-gray-700 text-gray-400 font-bold uppercase tracking-widest text-xs px-4 py-2 rounded-lg">
                      <AlertTriangle size={16} />
                      <span className="text-[10px]">Lock Active</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Confirm Delete Modal */}
        {showConfirmModal && selectedComplaint && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-950/80 backdrop-blur-md border border-cyan-500/30 rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="text-red-600" size={24} />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-cyan-100 text-center mb-2">
                  Delete Complaint?
                </h3>
                
                <p className="text-cyan-400 text-center mb-6">
                  Are you sure you want to delete this complaint? This action cannot be undone.
                </p>
                
                <div className="bg-black rounded-xl p-4 mb-6">
                  <p className="text-sm font-medium text-cyan-300 mb-1">
                    Issue: {selectedComplaint.issueType?.replace('-', ' ')}
                  </p>
                  <p className="text-sm text-cyan-400 truncate">
                    {selectedComplaint.description}
                  </p>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 bg-gray-800/50 text-cyan-200 px-4 py-3 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => deleteComplaint(selectedComplaint._id)}
                    disabled={deleteLoading === selectedComplaint._id}
                    className="flex-1 bg-red-600 text-white px-4 py-3 rounded-xl hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
                  >
                    {deleteLoading === selectedComplaint._id ? (
                      <Loader2 className="animate-spin mr-2" size={16} />
                    ) : (
                      <Trash2 className="mr-2" size={16} />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}