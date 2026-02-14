const COST_CATEGORIES = [
  { key: "entry", label: "Entry", color: "#6366f1" },
  { key: "travel", label: "Travel", color: "#10b981" },
  { key: "accommodation", label: "Accomm.", color: "#f59e0b" },
  { key: "gear", label: "Gear", color: "#f43f5e" },
  { key: "food", label: "Food", color: "#f97316" },
  { key: "other", label: "Other", color: "#6b7280" },
];

export { COST_CATEGORIES };

export default function CostBreakdown({ costs = {} }) {
  const entries = COST_CATEGORIES.map((cat) => ({
    ...cat,
    value: Number(costs[cat.key]) || 0,
  }));

  const total = entries.reduce((sum, e) => sum + e.value, 0);

  if (total === 0) return null;

  return (
    <div className="space-y-2">
      {/* Total */}
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
          Total Cost
        </span>
        <span className="text-xl font-black text-white">
          £{total.toLocaleString()}
        </span>
      </div>

      {/* Stacked bar */}
      <div className="h-3 rounded-full overflow-hidden flex">
        {entries
          .filter((e) => e.value > 0)
          .map((e) => (
            <div
              key={e.key}
              className="h-full transition-all duration-300"
              style={{
                width: `${(e.value / total) * 100}%`,
                backgroundColor: e.color,
              }}
              title={`${e.label}: £${e.value}`}
            />
          ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {entries
          .filter((e) => e.value > 0)
          .map((e) => (
            <div key={e.key} className="flex items-center gap-1.5 text-xs">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: e.color }}
              />
              <span className="text-gray-400">{e.label}</span>
              <span className="text-white font-bold">£{e.value}</span>
            </div>
          ))}
      </div>
    </div>
  );
}
