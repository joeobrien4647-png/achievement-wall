import { COST_CATEGORIES } from "./CostBreakdown";

export default function CostSummary({ events = [] }) {
  // Only consider events that have cost data
  const eventsWithCosts = events.filter((e) => {
    if (!e.costs) return false;
    return Object.values(e.costs).some((v) => Number(v) > 0);
  });

  if (eventsWithCosts.length === 0) {
    return (
      <div className="bg-gray-800/60 rounded-2xl p-4 border border-gray-700/50">
        <h3 className="text-sm font-bold text-white mb-2">Cost Summary</h3>
        <p className="text-gray-500 text-sm">No cost data recorded yet.</p>
      </div>
    );
  }

  // Aggregate totals by category
  const categoryTotals = COST_CATEGORIES.map((cat) => ({
    ...cat,
    total: eventsWithCosts.reduce((sum, e) => sum + (Number(e.costs?.[cat.key]) || 0), 0),
  }));

  const grandTotal = categoryTotals.reduce((sum, c) => sum + c.total, 0);
  const avgCost = eventsWithCosts.length > 0 ? Math.round(grandTotal / eventsWithCosts.length) : 0;

  // Find highest cost event
  const eventTotals = eventsWithCosts.map((e) => ({
    name: e.name,
    total: Object.values(e.costs || {}).reduce((sum, v) => sum + (Number(v) || 0), 0),
  }));
  const highest = eventTotals.reduce(
    (max, e) => (e.total > max.total ? e : max),
    { name: "", total: 0 }
  );

  // Filter categories with spend for the pie chart
  const activeCats = categoryTotals.filter((c) => c.total > 0);

  // Build conic-gradient segments for the CSS pie chart
  let gradientStops = [];
  let cumulative = 0;
  for (const cat of activeCats) {
    const pct = (cat.total / grandTotal) * 100;
    gradientStops.push(`${cat.color} ${cumulative}% ${cumulative + pct}%`);
    cumulative += pct;
  }
  const pieGradient = `conic-gradient(${gradientStops.join(", ")})`;

  return (
    <div className="bg-gray-800/60 rounded-2xl p-4 border border-gray-700/50 space-y-4">
      <h3 className="text-sm font-bold text-white">Cost Summary</h3>

      {/* Headline stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gray-900/60 rounded-xl p-3 border border-gray-700/30">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-0.5">
            Total Spent
          </div>
          <div className="text-lg font-black text-white">£{grandTotal.toLocaleString()}</div>
        </div>
        <div className="bg-gray-900/60 rounded-xl p-3 border border-gray-700/30">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-0.5">
            Avg / Event
          </div>
          <div className="text-lg font-black text-white">£{avgCost.toLocaleString()}</div>
        </div>
        <div className="bg-gray-900/60 rounded-xl p-3 border border-gray-700/30">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-0.5">
            Highest
          </div>
          <div className="text-lg font-black text-white">£{highest.total.toLocaleString()}</div>
          <div className="text-[10px] text-gray-400 truncate">{highest.name}</div>
        </div>
      </div>

      {/* Pie chart + legend */}
      <div className="flex items-center gap-4">
        {/* CSS pie chart */}
        <div className="relative flex-shrink-0">
          <div
            className="w-24 h-24 rounded-full"
            style={{ background: pieGradient }}
          />
          {/* Center hole for donut effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-gray-800/90 flex items-center justify-center">
              <span className="text-xs font-bold text-white">
                {eventsWithCosts.length}
                <span className="text-[9px] text-gray-500 block text-center">events</span>
              </span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-1.5 flex-1">
          {activeCats.map((cat) => (
            <div key={cat.key} className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-xs text-gray-400 flex-1">{cat.label}</span>
              <span className="text-xs text-white font-bold">
                £{cat.total.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
