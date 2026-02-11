export default function StatCard({ icon: Icon, value, label, sub, color }) {
  return (
    <div className="bg-gray-800/60 rounded-2xl p-4 border border-gray-700/50">
      {Icon && <Icon size={18} style={{ color }} className="mb-2" />}
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
}
