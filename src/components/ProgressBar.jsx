export default function ProgressBar({ progress, from = "red-500", to = "orange-500", height = "h-1.5" }) {
  return (
    <div className={`w-full bg-gray-900/60 rounded-full ${height}`}>
      <div
        className={`bg-gradient-to-r from-${from} to-${to} ${height} rounded-full transition-all duration-700 ease-out`}
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
}
