import { notFound } from "next/navigation";
import Link from "next/link";
import { getDepartmentBySlug, getDepartmentSlugs } from "@/config/departments.config";
import complaintModel from "@/models/complaint.model";
import { connectDB } from "@/utils/connectDB";
import DashboardClient from "./DashboardClient";

// For static generation
export function generateStaticParams() {
  return getDepartmentSlugs().map((slug) => ({
    deptSlug: slug,
  }));
}

export async function generateMetadata({ params }) {
  const { deptSlug } = await params;
  const department = getDepartmentBySlug(deptSlug);
  
  if (!department) {
    return {
      title: "Department Not Found",
    };
  }

  return {
    title: `${department.name} Dashboard - Civic Buddy`,
    description: `Manage complaints for ${department.name}`,
  };
}

async function getDepartmentStats(deptSlug) {
  try {
    await connectDB();

    const stats = await complaintModel.aggregate([
      { $match: { assignedDepartment: deptSlug } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const formattedStats = {
      total: 0,
      pending: 0,
      inProgress: 0,
      resolved: 0,
      rejected: 0,
    };

    stats.forEach((stat) => {
      formattedStats.total += stat.count;
      if (stat._id === "pending") formattedStats.pending = stat.count;
      if (stat._id === "in_progress") formattedStats.inProgress = stat.count;
      if (stat._id === "resolved") formattedStats.resolved = stat.count;
      if (stat._id === "rejected") formattedStats.rejected = stat.count;
    });

    return formattedStats;
  } catch (error) {
    console.log('Error fetching department stats: ', error);
    return {
      total: 0,
      pending: 0,
      inProgress: 0,
      resolved: 0,
      rejected: 0
    };
  }
}

async function getRecentComplaints(deptSlug) {
  try {
    await connectDB();
    const recentComplaints = await complaintModel
      .find({ assignedDepartment: deptSlug })
      .sort({ createdAt: -1 })
      .limit(30) // Fetch more to populate the kanban properly
      .select('_id issueType status location createdAt description')
      .lean();
    
    // Serialize IDs for client component
    return recentComplaints.map(c => ({
      ...c,
      _id: c._id.toString(),
      createdAt: c.createdAt.toISOString(),
    }));
  } catch (error) {
    console.log('Error fetching recent complaints: ', error);
    return [];
  }
}

export default async function DepartmentDashboard({ params }) {
  const { deptSlug } = await params;
  const department = getDepartmentBySlug(deptSlug);

  if (!department) {
    notFound();
  }

  const stats = await getDepartmentStats(deptSlug);
  const recentComplaints = await getRecentComplaints(deptSlug);

  return (
    <div className="min-h-screen bg-black text-cyan-50 font-mono">
      {/* Holographic Background Grid */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />
      
      {/* Header */}
      <div className="relative z-10 bg-gray-950/80 backdrop-blur-md border border-cyan-500/30 shadow-[0_4px_20px_rgba(6,182,212,0.15)] border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/department"
                className="text-cyan-600 hover:text-cyan-400 hover:shadow-[0_0_8px_rgba(6,182,212,0.8)] transition-all"
              >
                <svg
                  className="w-8 h-8 drop-shadow-[0_0_5px_currentColor]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">{department.icon}</span>
                  <div>
                    <h1 className="text-2xl font-bold text-cyan-300 uppercase tracking-widest drop-shadow-[0_0_8px_currentColor]">
                      {department.shortName} COMMAND
                    </h1>
                    <p className="text-xs font-bold text-cyan-600 uppercase tracking-widest">{department.name}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area (Client Component) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <DashboardClient 
          stats={stats} 
          initialRecentComplaints={recentComplaints} 
          department={department} 
          deptSlug={deptSlug} 
        />
      </div>
    </div>
  );
}