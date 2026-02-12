export default function ChartCard({ title, action, children, className = "" }) {
  return (
    <div className={`bg-gray-800/60 rounded-2xl p-4 border border-gray-700/50 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-3">
          {title && <h3 className="text-sm font-bold text-white">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
