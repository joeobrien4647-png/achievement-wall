export default function ChartCard({ title, children, className = "" }) {
  return (
    <div className={`bg-gray-800/60 rounded-2xl p-4 border border-gray-700/50 ${className}`}>
      {title && <h3 className="text-sm font-bold text-white mb-3">{title}</h3>}
      {children}
    </div>
  );
}
