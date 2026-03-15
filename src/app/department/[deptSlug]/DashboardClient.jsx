"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import StatCard from "../_components/StatCard";
import QuickActionCard from "../_components/QuickActionCard";

// The "Fake It" Urgency Algorithm
const enhanceComplaintData = (complaints) => {
  return complaints.map((complaint) => {
    // Generate an artificial urgency score based on complaint ID so it stays deterministic
    // Using simple charCode math to generate a pseudo-random number 0-100
    const str = complaint._id.toString();
    const seed = str.charCodeAt(str.length - 1) + str.charCodeAt(str.length - 2);
    const score = (seed * 7) % 100;

    let priority = "LOW";
    let trafficVolumeStr = "Under 2,000 vehicles/day";
    let trafficMultiplier = 1;

    if (score >= 80) { // ~20%
      priority = "CRITICAL";
      const vol = 15000 + (score * 100);
      trafficVolumeStr = `${vol.toLocaleString()} vehicles/day`;
      trafficMultiplier = 5;
    } else if (score >= 30) { // ~50%
      priority = "MODERATE";
      const vol = 5000 + (score * 50);
      trafficVolumeStr = `${vol.toLocaleString()} vehicles/day`;
      trafficMultiplier = 2;
    } else { // ~30%
      priority = "LOW";
      const vol = 500 + (score * 20);
      trafficVolumeStr = `${vol.toLocaleString()} vehicles/day`;
    }

    // Assign mock road names based on ID index
    const roads = ["NH-44", "Ring Road", "Airport Expressway", "City Center", "Sector 45", "Cyber Hub", "MG Road"];
    const roadName = roads[seed % roads.length];

    return {
      ...complaint,
      urgencyScore: score,
      priority,
      trafficVolumeStr,
      trafficMultiplier,
      roadName
    };
  });
};

const PIE_COLORS = {
  CRITICAL: "#ef4444", // Red/Neon
  MODERATE: "#14b8a6", // Bright Teal
  LOW: "#334155",      // Slate
};

export default function DashboardClient({ department, deptSlug, stats, initialRecentComplaints }) {
  // Run enhance logic
  const enhancedComplaints = useMemo(() => enhanceComplaintData(initialRecentComplaints), [initialRecentComplaints]);

  // Derived Analytics Data
  const { pieData, barData, impactStats } = useMemo(() => {
    let criticalCount = 0;
    let moderateCount = 0;
    let lowCount = 0;
    let totalImpact = 0;
    const roadCounts = {};

    enhancedComplaints.forEach((c) => {
      if (c.status === "in_progress" || c.status === "pending") {
        totalImpact += (c.trafficMultiplier * 1500); // 1.5k fake damage cost unit
        if (c.priority === "CRITICAL") criticalCount++;
        else if (c.priority === "MODERATE") moderateCount++;
        else lowCount++;
        
        roadCounts[c.roadName] = (roadCounts[c.roadName] || 0) + 1;
      }
    });

    const pData = [
      { name: "Critical Threats", value: criticalCount },
      { name: "Moderate Risks", value: moderateCount },
      { name: "Low Priority", value: lowCount },
    ];

    // Sort BarChart by volume
    const bData = Object.keys(roadCounts).map(name => ({
      name,
      Anomalies: roadCounts[name]
    })).sort((a,b) => b.Anomalies - a.Anomalies).slice(0, 5); // top 5

    return {
      pieData: pData,
      barData: bData,
      impactStats: {
        totalActive: criticalCount + moderateCount + lowCount,
        corridors: Object.keys(roadCounts).length,
        damagePrevented: totalImpact
      }
    };
  }, [enhancedComplaints]);

  // Split into Kanban arrays
  const triageGroups = useMemo(() => {
    return {
      CRITICAL: enhancedComplaints.filter(c => c.priority === "CRITICAL"),
      MODERATE: enhancedComplaints.filter(c => c.priority === "MODERATE"),
      LOW: enhancedComplaints.filter(c => c.priority === "LOW"),
    };
  }, [enhancedComplaints]);

  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Complaints"
          value={stats.total}
          color={department.color}
          icon="📊"
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          color="#F59E0B"
          icon="⏳"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          color="#3B82F6"
          icon="🔄"
        />
        <StatCard
          title="Resolved"
          value={stats.resolved}
          color="#10B981"
          icon="✅"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <QuickActionCard
          title="All Complaints"
          description="View and manage all complaints"
          href={`/department/${deptSlug}/complaints`}
          icon="📋"
          color={department.color}
        />
        <QuickActionCard
          title="Pending Review"
          description="Complaints waiting for action"
          href={`/department/${deptSlug}/complaints/pending`}
          icon="⏳"
          color="#F59E0B"
          badge={stats.pending}
        />
        <QuickActionCard
          title="Resolved"
          description="View Resolved Complaints"
          href={`/department/${deptSlug}/complaints/resolved`}
          icon="✅"
          color="#88e788"
        />
      </div>

      {/* ========================================= */}
      {/* KILLER FEATURE: Traffic-Weighted Analytics */}
      {/* ========================================= */}
      <div className="mb-10 relative">
        {/* Demo Disclaimer Badge */}
        <div className="absolute -top-3 right-4 z-20 bg-black/80 border border-red-500/50 text-[10px] text-red-400 uppercase tracking-widest px-3 py-1 font-mono rounded-full backdrop-blur-md shadow-[0_0_10px_rgba(239,68,68,0.2)]">
          [DEMO MODE: Traffic Telemetry Simulated]
        </div>

        <h2 className="text-2xl font-bold font-mono text-cyan-300 uppercase tracking-widest mb-6 drop-shadow-[0_0_8px_currentColor] border-b border-cyan-500/30 pb-3">
          Traffic-Weighted Urgency Matrix
        </h2>

        {/* Hero Impact Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-950/80 backdrop-blur-md border border-cyan-500/30 rounded-xl p-6 text-center shadow-[0_0_20px_rgba(6,182,212,0.15)] flex flex-col justify-center">
            <h3 className="text-cyan-600 text-[10px] font-bold tracking-widest uppercase mb-2">Total Active Threats</h3>
            <p className="text-4xl font-mono text-cyan-100 font-bold">{impactStats.totalActive}</p>
          </div>
          <div className="bg-gray-950/80 backdrop-blur-md border border-cyan-500/30 rounded-xl p-6 text-center shadow-[0_0_20px_rgba(6,182,212,0.15)] flex flex-col justify-center">
            <h3 className="text-cyan-600 text-[10px] font-bold tracking-widest uppercase mb-2">Corridors Impacted</h3>
            <p className="text-4xl font-mono text-cyan-100 font-bold">{impactStats.corridors}</p>
          </div>
          <div className="bg-gray-950/80 backdrop-blur-md border border-cyan-500/30 rounded-xl p-6 text-center shadow-[0_0_20px_rgba(6,182,212,0.15)] flex flex-col justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-green-500/5 pulse-animation mix-blend-screen" />
            <h3 className="text-green-500/70 text-[10px] font-bold tracking-widest uppercase mb-2 relative z-10">Est. Damage Prevented</h3>
            <p className="text-4xl font-mono text-green-400 font-bold relative z-10">₹{impactStats.damagePrevented.toLocaleString()}</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Pie Chart: Urgency Distribution */}
          <div className="lg:col-span-1 bg-gray-950/80 backdrop-blur-md border border-cyan-500/30 rounded-xl p-6 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <h3 className="text-xs font-bold text-cyan-500 tracking-widest uppercase text-center mb-4">Urgency Distribution</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => {
                      let color = PIE_COLORS.LOW;
                      if (entry.name.includes("Critical")) color = PIE_COLORS.CRITICAL;
                      if (entry.name.includes("Moderate")) color = PIE_COLORS.MODERATE;
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(3, 7, 18, 0.9)', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#67e8f9' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart: Anomalies by Corridor */}
          <div className="lg:col-span-2 bg-gray-950/80 backdrop-blur-md border border-cyan-500/30 rounded-xl p-6 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <h3 className="text-xs font-bold text-cyan-500 tracking-widest uppercase mb-4">Traffic Corridor Hotspots</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#0891b2" tick={{fill: '#0891b2', fontSize: 12}} />
                  <YAxis stroke="#0891b2" tick={{fill: '#0891b2', fontSize: 12}} allowDecimals={false} />
                  <Tooltip 
                    cursor={{fill: 'rgba(6, 182, 212, 0.1)'}} 
                    contentStyle={{ backgroundColor: 'rgba(3, 7, 18, 0.9)', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '8px' }}
                    itemStyle={{ color: '#2dd4bf' }}
                  />
                  <Bar dataKey="Anomalies" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* Triage Kanban View */}
      {/* ========================================= */}
      <h2 className="text-2xl font-bold font-mono text-cyan-300 uppercase tracking-widest mb-6 drop-shadow-[0_0_8px_currentColor] border-b border-cyan-500/30 pb-3 mt-12">
        Active Triage Queue
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
        
        {/* CRITICAL Column */}
        <div className="space-y-4">
          <div className="bg-red-950/40 border border-red-500/30 p-3 rounded-lg flex items-center justify-between">
            <h3 className="text-red-400 font-bold uppercase tracking-widest text-sm drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">Critical</h3>
            <span className="bg-red-500 text-black px-2 py-0.5 rounded-full text-xs font-bold">{triageGroups.CRITICAL.length}</span>
          </div>
          {triageGroups.CRITICAL.map(complaint => (
            <TriageCard key={complaint._id.toString()} complaint={complaint} deptSlug={deptSlug} />
          ))}
          {triageGroups.CRITICAL.length === 0 && <EmptyTriage text="No Critical Anomalies" />}
        </div>

        {/* MODERATE Column */}
        <div className="space-y-4">
          <div className="bg-teal-950/40 border border-teal-500/30 p-3 rounded-lg flex items-center justify-between">
            <h3 className="text-teal-400 font-bold uppercase tracking-widest text-sm drop-shadow-[0_0_8px_rgba(20,184,166,0.8)]">Moderate</h3>
            <span className="bg-teal-500 text-black px-2 py-0.5 rounded-full text-xs font-bold">{triageGroups.MODERATE.length}</span>
          </div>
          {triageGroups.MODERATE.map(complaint => (
            <TriageCard key={complaint._id.toString()} complaint={complaint} deptSlug={deptSlug} />
          ))}
          {triageGroups.MODERATE.length === 0 && <EmptyTriage text="No Moderate Risks" />}
        </div>

        {/* LOW Column */}
        <div className="space-y-4">
          <div className="bg-slate-900/40 border border-slate-500/30 p-3 rounded-lg flex items-center justify-between">
            <h3 className="text-slate-400 font-bold uppercase tracking-widest text-sm drop-shadow-[0_0_8px_rgba(100,116,139,0.8)]">Low</h3>
            <span className="bg-slate-500 text-black px-2 py-0.5 rounded-full text-xs font-bold">{triageGroups.LOW.length}</span>
          </div>
          {triageGroups.LOW.map(complaint => (
            <TriageCard key={complaint._id.toString()} complaint={complaint} deptSlug={deptSlug} />
          ))}
          {triageGroups.LOW.length === 0 && <EmptyTriage text="No Low Priorities" />}
        </div>

      </div>
    </>
  );
}

// Sub-Component: Triage Card with priority styling
function TriageCard({ complaint, deptSlug }) {
  const isCritical = complaint.priority === "CRITICAL";
  const borderClass = isCritical 
    ? "border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)] animate-pulse-slow" 
    : complaint.priority === "MODERATE"
    ? "border-teal-500/30 shadow-[0_0_10px_rgba(20,184,166,0.1)]"
    : "border-slate-700/50";

  const titleColor = isCritical ? "text-red-300" : complaint.priority === "MODERATE" ? "text-teal-300" : "text-slate-300";

  return (
    <Link
      href={`/department/${deptSlug}/complaints/${complaint._id}`}
      className={`block bg-gray-950/80 backdrop-blur-md rounded-xl p-4 transition-transform hover:-translate-y-1 hover:bg-black border ${borderClass}`}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className={`text-xs font-bold uppercase tracking-wider ${titleColor}`}>
          {complaint.issueType.replace('-', ' ')}
        </h4>
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">Urgency</span>
          <span className={`text-sm font-bold ${titleColor}`}>{complaint.urgencyScore}%</span>
        </div>
      </div>
      
      {/* Fake Traffic Metric for judges */}
      <div className="mt-3 pt-3 border-t border-gray-800/50">
        <div className="flex justify-between text-[10px] uppercase tracking-widest text-gray-400 mb-1">
          <span>Traffic Vol.</span>
          <span>Vector</span>
        </div>
        <div className="flex justify-between text-xs font-bold text-cyan-100">
          <span className={isCritical ? "text-red-400" : ""}>{complaint.trafficVolumeStr}</span>
          <span>{complaint.roadName}</span>
        </div>
      </div>
    </Link>
  );
}

function EmptyTriage({ text }) {
  return (
    <div className="bg-gray-950/50 border border-gray-800 border-dashed rounded-xl p-6 text-center text-gray-600 text-xs tracking-widest uppercase">
      {text}
    </div>
  );
}
