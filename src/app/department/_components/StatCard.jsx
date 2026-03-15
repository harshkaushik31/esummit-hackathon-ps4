// Stat Card Component
export default function StatCard({ title, value, color, icon, isTime = false }) {
  return (
    <div className="bg-gray-950/80 backdrop-blur-md border border-cyan-500/30 rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <div className="text-3xl font-bold text-cyan-100 mb-1">{value}</div>
      <div className="text-sm text-cyan-400">{title}</div>
    </div>
  );
}