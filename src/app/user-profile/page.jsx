'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function ProfilePage() {
  const router = useRouter();
  const [data, setData] = useState({});
  const [numberOfComplaints, setNumberOfComplaints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getUserDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post("/api/users/profile");
      const totalComplaints = await axios.get("api/users/your-complaint-count");
      setNumberOfComplaints(totalComplaints.data.complaintsCount);
      setData(response.data.data);
      
    } catch (error) {
      console.log("Error fetching user details:", error);
      setError(error.message || "Failed to fetch user data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getUserDetails();
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white relative z-10 overflow-hidden font-mono">
        <Navbar />
        <div className="max-w-4xl mx-auto p-6 pt-24 relative z-10">
          <h1 className="text-3xl font-bold mb-4 tracking-widest uppercase text-cyan-400 drop-shadow-[0_0_8px_currentColor]">Data_Log // Profile</h1>
          <div className="border-b border-cyan-500/30 mb-8" />
          <div className="flex items-center space-x-4 bg-gray-950 p-6 border border-cyan-500/30 rounded-lg">
            <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-cyan-300 tracking-widest uppercase text-sm animate-pulse">Establishing secure link...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white relative z-10 overflow-hidden font-mono">
        <Navbar />
        <div className="max-w-4xl mx-auto p-6 pt-24 relative z-10">
          <h1 className="text-3xl font-bold mb-4 tracking-widest uppercase text-cyan-400 drop-shadow-[0_0_8px_currentColor]">Data_Log // Profile</h1>
          <div className="border-b border-cyan-500/30 mb-8" />
          <div className="bg-red-950/50 border border-red-500/50 p-6 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <p className="text-red-400 tracking-wider">CRITICAL ERROR: {error}</p>
            <button 
              onClick={getUserDetails}
              className="mt-6 px-6 py-2 bg-red-500/20 border border-red-500 text-red-400 uppercase tracking-widest text-xs hover:bg-red-500 hover:text-white transition-all shadow-[0_0_10px_rgba(239,68,68,0.3)]"
            >
              Retry_Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative z-10 overflow-hidden font-mono">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <Navbar />
      
      <div className="max-w-4xl mx-auto p-6 pt-24 relative z-10">
        <h1 className="text-3xl font-bold mb-4 tracking-widest uppercase text-cyan-400 drop-shadow-[0_0_8px_currentColor] flex items-center gap-3">
          <span className="w-2 h-6 bg-cyan-400 animate-pulse block"></span>
          Data_Log // Profile
        </h1>
        <div className="border-b border-cyan-500/30 mb-8" />
        
        {Object.keys(data).length === 0 ? (
          <h2 className="text-lg text-slate-500 tracking-widest">NO TELEMETRY DATA FOUND.</h2>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center gap-2 mb-2">
               <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_currentColor]"></span>
               <h2 className="text-sm font-semibold tracking-widest uppercase text-emerald-400">Node_Identity_Verified:</h2>
            </div>
            
            <div className="bg-gray-950 p-8 border border-cyan-500/30 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.1)] relative group isolate">
              {/* Corner decor */}
              <div className="absolute -top-px -left-px w-4 h-4 border-t-2 border-l-2 border-cyan-400/50"></div>
              <div className="absolute -bottom-px -right-px w-4 h-4 border-b-2 border-r-2 border-cyan-400/50"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                <div className="border-b border-slate-800 pb-2">
                  <span className="text-xs text-slate-500 uppercase tracking-widest block mb-1">Assigned_ID</span>
                  <span className="text-cyan-100 font-bold">{data._id || 'N/A'}</span>
                </div>
                <div className="border-b border-slate-800 pb-2">
                  <span className="text-xs text-slate-500 uppercase tracking-widest block mb-1">Designation</span>
                  <span className="text-cyan-100 font-bold">{data.name || 'N/A'}</span>
                </div>
                <div className="border-b border-slate-800 pb-2">
                  <span className="text-xs text-slate-500 uppercase tracking-widest block mb-1">Comms_Link</span>
                  <span className="text-cyan-100 font-bold">{data.email || 'N/A'}</span>
                </div>
                <div className="border-b border-slate-800 pb-2">
                  <span className="text-xs text-slate-500 uppercase tracking-widest block mb-1">Access_Level</span>
                  <span className="text-cyan-100 font-bold uppercase">{data.role || 'N/A'}</span>
                </div>
                <div className="border-b border-slate-800 pb-2 bg-cyan-950/30 -mx-4 px-4 rounded-md">
                  <span className="text-xs text-cyan-500 uppercase tracking-widest block mb-1 font-bold">Total_Logged_Anomalies</span>
                  <span className="text-cyan-300 font-bold text-xl">{numberOfComplaints}</span>
                </div>
              </div>
            </div>
            
            {/* Debug section */}
            <details className="mt-12 bg-gray-950 border border-slate-800 rounded-lg overflow-hidden group">
              <summary className="cursor-pointer text-slate-500 hover:text-cyan-400 hover:bg-slate-900 transition-colors p-4 text-xs tracking-widest uppercase flex items-center justify-between outline-none">
                <span>Access Raw Hex Dump (Debug)</span>
                <span className="text-lg">+</span>
              </summary>
              <pre className="p-4 bg-black/80 overflow-auto text-xs text-teal-500 border-t border-slate-800">
                {JSON.stringify(data, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  )
}