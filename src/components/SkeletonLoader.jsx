/**
 * Ghost skeleton loader — replaces the spinner while lazy pages load.
 * Shows placeholder cards that mimic the page structure.
 */
export function SkeletonPulse({ className = "" }) {
  return <div className={`animate-pulse bg-gray-800/60 rounded-xl ${className}`} />;
}

export default function SkeletonLoader() {
  return (
    <div className="px-4 pt-6 space-y-4">
      {/* Hero skeleton */}
      <SkeletonPulse className="h-48 rounded-2xl" />

      {/* Stat cards row */}
      <div className="grid grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <SkeletonPulse key={i} className="h-20 rounded-xl" />
        ))}
      </div>

      {/* Card skeletons */}
      <SkeletonPulse className="h-28 rounded-2xl" />
      <SkeletonPulse className="h-36 rounded-2xl" />
      <SkeletonPulse className="h-24 rounded-2xl" />
    </div>
  );
}
