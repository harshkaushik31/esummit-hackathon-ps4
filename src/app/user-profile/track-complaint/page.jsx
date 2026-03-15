"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { Search, AlertCircle, CheckCircle, Clock, FileText, Calendar, MapPin, User } from "lucide-react";

export default function Page() {
  const [trackingId, setTrackingId] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const getDataFromBackend = async (complaintId) => {
    if (!complaintId.trim()) {
      setError("Please enter a valid tracking ID");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);
      
      const res = await axios.post("/api/users/track-complaint", {
        complaintId: complaintId.trim(),
      });
      
      console.log(res.data.complaint);
      setData(res.data.complaint);
    } catch (error) {
      console.log(error);
      setError(
        error.response?.data?.message || 
        "Complaint not found or invalid tracking ID"
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    getDataFromBackend(trackingId);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'closed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-900/50 text-cyan-200 border-cyan-500/30';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden p-4 md:p-6 text-cyan-50 font-mono">
      {/* Holographic Background Grid */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-cyan-400 mb-2 uppercase tracking-widest drop-shadow-[0_0_8px_currentColor]">
            Track Your Complaint
          </h1>
          <p className="text-cyan-50 text-lg">
            Enter your tracking ID to view the latest telemetry
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-gray-950/80 backdrop-blur-md border border-cyan-500/30 rounded-2xl shadow-[0_0_15px_rgba(6,182,212,0.1)] p-6 md:p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="trackingId" className="block text-sm font-bold text-cyan-400 mb-2 tracking-widest uppercase">
                Complaint Tracking ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="trackingId"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="e.g., 68d616b8b55c022990f0dbfa"
                  className="w-full px-4 py-3 pl-12 bg-black border border-cyan-500/50 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-cyan-50 placeholder-cyan-800 transition-colors"
                  disabled={loading}
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-600" size={20} />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading || !trackingId.trim()}
              className="w-full bg-cyan-500/10 border border-cyan-400 text-cyan-300 font-bold py-3 px-6 rounded-xl hover:bg-cyan-400 hover:text-black hover:shadow-[0_0_20px_rgba(6,182,212,0.8)] disabled:bg-gray-800 disabled:border-gray-600 disabled:text-gray-500 transition-all duration-300 flex items-center justify-center space-x-2 uppercase tracking-widest text-sm"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Tracking...</span>
                </>
              ) : (
                <>
                  <Search size={20} />
                  <span>Track Complaint</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center space-x-3">
              <AlertCircle className="text-red-500 flex-shrink-0" size={24} />
              <div>
                <h3 className="text-red-800 font-semibold">Error</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* No Results */}
        {hasSearched && !data && !loading && !error && (
          <div className="bg-black border border-cyan-500/30 rounded-2xl p-8 text-center">
            <FileText className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-cyan-300 font-semibold text-lg mb-2">No Complaint Found</h3>
            <p className="text-cyan-500">Please check your tracking ID and try again.</p>
          </div>
        )}

        {/* Complaint Details */}
        {data && (
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-gray-950/80 backdrop-blur-md border border-cyan-500/30 rounded-2xl shadow-[0_0_15px_rgba(6,182,212,0.1)] overflow-hidden">
              <div className="bg-gray-900 border-b border-cyan-500/30 p-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-cyan-300 tracking-widest uppercase">System Status</h2>
                <div className="flex items-center space-x-2">
                  <span className={`px-4 py-2 rounded-sm text-xs tracking-widest uppercase font-bold border ${getStatusColor(data.status)}`}>
                    {data.status || 'Unknown'}
                  </span>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 bg-black/40 p-3 rounded-lg border border-cyan-900/50">
                    <Calendar className="text-cyan-500" size={20} />
                    <div>
                      <p className="text-[10px] font-bold tracking-widest uppercase text-cyan-600">Timestamp Initial</p>
                      <p className="text-cyan-100">{formatDate(data.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 bg-black/40 p-3 rounded-lg border border-cyan-900/50">
                    <Clock className="text-cyan-500" size={20} />
                    <div>
                      <p className="text-[10px] font-bold tracking-widest uppercase text-cyan-600">Last Mod Scan</p>
                      <p className="text-cyan-100">{formatDate(data.updatedAt)}</p>
                    </div>
                  </div>
                </div>
                
                {data.escalationCount !== undefined && (
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="text-orange-500" size={20} />
                    <div>
                      <p className="text-sm font-medium text-cyan-500">Escalation Count</p>
                      <p className="text-cyan-100">{data.escalationCount}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Complaint Details */}
            <div className="bg-gray-950/80 backdrop-blur-md border border-cyan-500/30 rounded-2xl shadow-[0_0_15px_rgba(6,182,212,0.1)] p-6">
              <h3 className="text-xl font-bold text-cyan-300 tracking-widest uppercase mb-4">Log Details</h3>
              
              <div className="space-y-4">
                {data.issueType && (
                  <div>
                    <p className="text-[10px] font-bold tracking-widest uppercase text-cyan-600 mb-1">Issue Category</p>
                    <span className="inline-block bg-cyan-900/40 text-cyan-100 border border-cyan-500/50 px-3 py-1 rounded-sm text-sm font-bold uppercase tracking-wider">
                      {data.issueType}
                    </span>
                  </div>
                )}
                
                {data.description && (
                  <div>
                    <p className="text-[10px] font-bold tracking-widest uppercase text-cyan-600 mb-1">Description</p>
                    <p className="text-cyan-50 leading-relaxed bg-black/40 p-4 rounded-lg border border-cyan-900/50">{data.description}</p>
                  </div>
                )}
                
                {data.assignedDepartment && (
                  <div>
                    <p className="text-[10px] font-bold tracking-widest uppercase text-cyan-600 mb-1">Sector Routing</p>
                    <span className="inline-block bg-teal-900/40 text-teal-300 border border-teal-500/50 px-3 py-1 rounded-sm text-sm font-bold uppercase tracking-wider">
                      {data.assignedDepartment}
                    </span>
                  </div>
                )}
                
                {data.location && (
                  <div className="flex items-start space-x-3 bg-black/40 p-4 rounded-lg border border-cyan-900/50">
                    <MapPin className="text-cyan-500 flex-shrink-0 mt-1" size={16} />
                    <div>
                      <p className="text-[10px] font-bold tracking-widest uppercase text-cyan-600 mb-1">Vector Coordinates</p>
                      <p className="text-cyan-100">{data.location.address || 'Address not provided'}</p>
                      {data.location.latitude && data.location.longitude && (
                        <p className="text-xs font-mono text-cyan-500 mt-1">
                          LAT: {data.location.latitude.toFixed(6)} | LNG: {data.location.longitude.toFixed(6)}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Image */}
            {data.imageUrl && (
              <div className="bg-gray-950/80 backdrop-blur-md border border-cyan-500/30 rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-cyan-100 mb-4">Attached Image</h3>
                <div className="rounded-xl overflow-hidden">
                  <img 
                    src={data.imageUrl} 
                    alt="Complaint evidence" 
                    className="w-full h-auto max-h-96 object-cover"
                  />
                </div>
              </div>
            )}

            {/* Raw Data (Debug) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-gray-950/80 backdrop-blur-md border border-cyan-500/30 rounded-2xl shadow-xl p-6">
                <details>
                  <summary className="text-lg font-bold text-cyan-100 cursor-pointer hover:text-blue-600 mb-4">
                    Raw Data (Debug)
                  </summary>
                  <pre className="bg-black p-4 rounded-xl text-sm overflow-auto border">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}