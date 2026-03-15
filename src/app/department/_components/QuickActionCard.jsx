import Link from "next/link";

// Quick Action Card Component
export default function QuickActionCard({ title, description, href, icon, color, badge }) {
  return (
    <Link href={href} className="group">
      <div className="bg-gray-950/80 backdrop-blur-md border border-cyan-500/30 rounded-lg shadow-sm border p-6 hover:shadow-md transition-all hover:border-opacity-50"
        style={{ borderColor: `${color}30` }}>
        <div className="flex items-start justify-between mb-3">
          <div
            className="text-3xl p-2 rounded-lg"
            style={{ backgroundColor: `${color}15` }}
          >
            {icon}
          </div>
          {badge && (
            <span
              className="px-2 py-1 text-xs font-semibold rounded-full text-white"
              style={{ backgroundColor: color }}
            >
              {badge}
            </span>
          )}
        </div>
        <h3 className="text-lg font-semibold text-cyan-100 mb-1 group-hover:underline">
          {title}
        </h3>
        <p className="text-sm text-cyan-400">{description}</p>
      </div>
    </Link>
  );
}