// app/department/page.jsx
import Link from "next/link";
import { getAllDepartments } from "@/config/departments.config";
import LogoutButton from "@/app/department/_components/LogoutButton";
import MapSection from "./MapSection/page";

export const metadata = {
  title: "COMMAND CENTER - Civic Buddy",
  description: "Secure routing to municipal intelligence nodes",
};

export default function DepartmentSelectionPage() {
  const departments = getAllDepartments();

  return (
    <div className="min-h-screen bg-black relative overflow-hidden z-10">
      {/* Background Holographic Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />
      
      {/* Header */}
      <div className="bg-gray-950/80 backdrop-blur-md shadow-[0_4px_30px_rgba(6,182,212,0.1)] border-b border-cyan-500/30 relative z-10 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-widest uppercase drop-shadow-[0_0_10px_rgba(6,182,212,0.8)] flex items-center gap-3">
              <span className="w-2 h-6 bg-cyan-400 animate-pulse block"></span>
              CENTRAL_COMMAND
            </h1>
          </div>
          <LogoutButton />
        </div>
      </div>

      {/* Department Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <h2 className="text-cyan-400 font-mono text-sm tracking-widest uppercase mb-6 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span> Active Intelligence Nodes
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <Link
              href={`/department/${dept.slug}`}
              key={dept.slug}
              className="group"
            >
              <div
                className="relative bg-gray-950 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.1)] group-hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all duration-300 overflow-hidden border border-cyan-500/30 group-hover:border-cyan-400 h-full backdrop-blur-md"
              >
                {/* Holographic Accent Bar */}
                <div
                  className="h-1 w-full opacity-60 group-hover:opacity-100 group-hover:h-1.5 transition-all shadow-[0_0_10px_currentColor]"
                  style={{ backgroundColor: dept.color }}
                />

                {/* Content */}
                <div className="p-6">
                  {/* Icon and Arrow */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="text-4xl p-3 rounded-lg border border-white/5 shadow-inner"
                      style={{ backgroundColor: `${dept.bgColor}40` }}
                    >
                      {dept.icon}
                    </div>
                    <svg
                      className="w-6 h-6 text-cyan-500/50 group-hover:text-cyan-300 transition-colors group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>

                  {/* Department Name */}
                  <h2 className="text-xl font-bold text-white tracking-wider uppercase mb-1 drop-shadow-[0_0_5px_currentColor]" style={{ color: dept.color }}>
                    {dept.shortName}
                  </h2>
                  <p className="text-xs font-mono text-cyan-400 mb-4 tracking-widest uppercase">{dept.name}</p>

                  {/* Description */}
                  <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                    {dept.description}
                  </p>

                  {/* Categories */}
                  <div className="flex flex-wrap gap-2">
                    {dept.categories.slice(0, 3).map((category, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-1 rounded bg-black border font-mono uppercase tracking-wider"
                        style={{
                          borderColor: `${dept.color}40`,
                          color: dept.color,
                        }}
                      >
                        {category}
                      </span>
                    ))}
                    {dept.categories.length > 3 && (
                      <span
                        className="text-[10px] px-2 py-1 rounded bg-black border font-mono uppercase tracking-wider text-cyan-500 border-cyan-500/40"
                      >
                        +{dept.categories.length - 3} MORE
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Decorative corner markers on hover */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t border-l opacity-0 group-hover:opacity-100 transition-opacity" style={{ borderColor: dept.color }}></div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b border-r opacity-0 group-hover:opacity-100 transition-opacity" style={{ borderColor: dept.color }}></div>

                {/* Hover Effect Overlay */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity pointer-events-none mix-blend-screen"
                  style={{ backgroundColor: dept.color }}
                />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 relative z-10">
        <div className="bg-gray-950 border border-cyan-500/40 rounded-lg p-6 shadow-[inset_0_0_20px_rgba(6,182,212,0.1)] overflow-hidden relative">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[50px] -z-10 rounded-full"></div>

          <div className="flex items-start z-10 relative">
            <div className="flex-shrink-0 mt-1">
              <svg
                className="h-5 w-5 text-cyan-400 drop-shadow-[0_0_5px_currentColor]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <div className="ml-3 font-mono">
              <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-1">
                Restricted Access // Level 4
              </h3>
              <p className="mt-1 text-xs text-slate-500 uppercase tracking-wider">
                This frequency is monitored. Unauthorized telemetry will be intercepted and logged by central oversight.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <MapSection/>
      </div>
    </div>
  );
}