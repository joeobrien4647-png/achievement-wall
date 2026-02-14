import { useState, lazy, Suspense } from "react";
import { Route, TrendingUp, Trophy, Mountain, Flame, Zap, Award, Globe, Map } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  AreaChart, Area, LineChart, Line,
} from "recharts";
import { useStats } from "../hooks/useStats";
import { useEvents } from "../hooks/useEvents";
import { useData } from "../context/DataContext";
import StatCard from "../components/StatCard";
import ChartCard from "../components/ChartCard";
import EventMap from "../components/EventMap";
import { generateHeatmapData, computeStreaks } from "../lib/streaks";

const LeafletMap = lazy(() => import("../components/LeafletMap"));

const PIE_COLORS = ["#8b5cf6", "#ef4444", "#f59e0b"];

const tooltipStyle = {
  backgroundColor: "#1f2937",
  border: "1px solid #374151",
  borderRadius: "12px",
  color: "#fff",
  fontSize: 12,
};

export default function StatsPage() {
  const {
    totalDistance, totalEvents, totalElevation, highestPeak,
    distanceData, cumulativeData, typeBreakdown,
    personalRecords, funFacts, yoyComparison, difficultyProgression, prTimeline,
  } = useStats();
  const { state } = useData();
  const { completed, upcoming } = useEvents();
  const [mapMode, setMapMode] = useState("svg");

  return (
    <div className="px-4 pb-24 sm:pb-8 pt-4 space-y-5">
      <div>
        <h2 className="text-2xl font-black text-white mb-1">Stats & Analytics</h2>
        <p className="text-gray-500 text-sm">Your endurance journey in numbers</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={Route} value={`${totalDistance}km`} label="Total Distance"
          sub={`≈ ${(totalDistance * 0.621).toFixed(0)} miles`} color="#10b981"
        />
        <StatCard
          icon={TrendingUp} value={`${totalElevation.toLocaleString()}m`} label="Total Elevation"
          sub={`≈ ${(totalElevation / 8849 * 100).toFixed(1)}% of Everest`} color="#f59e0b"
        />
        <StatCard
          icon={Trophy} value={totalEvents} label="Events Done"
          sub={`${state.events.filter(e => e.status === "completed").length} unique challenges`} color="#8b5cf6"
        />
        <StatCard
          icon={Mountain} value={`${highestPeak}m`} label="Highest Peak"
          sub="Ben Nevis 🏴󠁧󠁢󠁳󠁣󠁴󠁿" color="#ef4444"
        />
      </div>

      {/* Personal Records */}
      <ChartCard title="Personal Records">
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Longest", value: personalRecords.longestDistance ? `${personalRecords.longestDistance.value}km` : "—", name: personalRecords.longestDistance?.name, icon: "🏅", color: "#10b981" },
            { label: "Most Elevation", value: personalRecords.mostElevation ? `${personalRecords.mostElevation.value}m` : "—", name: personalRecords.mostElevation?.name, icon: "⛰️", color: "#f59e0b" },
            { label: "Hardest Rated", value: personalRecords.hardestEvent ? `${personalRecords.hardestEvent.value}/5` : "—", name: personalRecords.hardestEvent?.name, icon: "🔥", color: "#ef4444" },
            { label: "Most Repeats", value: personalRecords.mostCompletions ? `×${personalRecords.mostCompletions.value}` : "—", name: personalRecords.mostCompletions?.name, icon: "🔁", color: "#8b5cf6" },
            ...(personalRecords.fastestPace ? [{ label: "Fastest Pace", value: personalRecords.fastestPace.value, name: personalRecords.fastestPace.name, icon: "⚡", color: "#06b6d4" }] : []),
          ].map((pr, i) => (
            <div key={i} className="bg-gray-900/60 rounded-xl p-3 border border-gray-700/30">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{pr.icon}</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">{pr.label}</span>
              </div>
              <div className="text-white font-black text-lg" style={{ color: pr.color }}>{pr.value}</div>
              {pr.name && <div className="text-gray-400 text-[11px] truncate">{pr.name}</div>}
            </div>
          ))}
        </div>
      </ChartCard>

      {/* PR Timeline */}
      {prTimeline.length > 1 && (
        <ChartCard title="Records Timeline">
          <div className="relative pl-6">
            <div className="absolute left-2.5 top-1 bottom-1 w-px bg-gray-700" />
            {prTimeline.map((pr, i) => (
              <div key={i} className="relative flex items-start gap-3 pb-4 last:pb-0">
                <div
                  className="absolute left-[-18px] top-1 w-3 h-3 rounded-full border-2 border-gray-900 flex-shrink-0"
                  style={{ backgroundColor: pr.color }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{pr.icon}</span>
                    <span className="text-white font-bold text-sm" style={{ color: pr.color }}>{pr.value}</span>
                    <span className="text-gray-500 text-[10px] uppercase tracking-wider">{pr.category} PR</span>
                  </div>
                  <div className="text-gray-400 text-xs truncate">{pr.name}</div>
                  {pr.date && (
                    <div className="text-gray-600 text-[10px] mt-0.5">
                      {new Date(pr.date).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      )}

      {/* Year-over-Year Comparison */}
      {yoyComparison.hasData && (
        <ChartCard title={`${yoyComparison.current.year} vs ${yoyComparison.previous.year}`}>
          <div className="space-y-3">
            {[
              { label: "Distance", curr: yoyComparison.current.distance, prev: yoyComparison.previous.distance, unit: "km", color: "#10b981" },
              { label: "Elevation", curr: yoyComparison.current.elevation, prev: yoyComparison.previous.elevation, unit: "m", color: "#8b5cf6" },
              { label: "Events", curr: yoyComparison.current.events, prev: yoyComparison.previous.events, unit: "", color: "#f59e0b" },
            ].map((row) => {
              const diff = row.prev > 0 ? Math.round(((row.curr - row.prev) / row.prev) * 100) : null;
              return (
                <div key={row.label} className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm w-20">{row.label}</span>
                  <div className="flex-1 mx-3">
                    <div className="flex gap-1 items-end h-6">
                      <div
                        className="rounded-sm h-full opacity-40"
                        style={{
                          backgroundColor: row.color,
                          width: `${Math.max(4, row.prev > 0 ? (row.prev / Math.max(row.curr, row.prev)) * 100 : 0)}%`,
                        }}
                      />
                      <div
                        className="rounded-sm h-full"
                        style={{
                          backgroundColor: row.color,
                          width: `${Math.max(4, row.curr > 0 ? (row.curr / Math.max(row.curr, row.prev, 1)) * 100 : 0)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-right w-24">
                    <span className="text-white font-bold text-sm">{row.curr}{row.unit}</span>
                    {diff !== null && (
                      <span className={`text-xs ml-1.5 ${diff >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {diff >= 0 ? "↑" : "↓"}{Math.abs(diff)}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-3 text-[10px] text-gray-500">
            <div className="flex items-center gap-1.5"><div className="w-3 h-2 rounded-sm bg-gray-500 opacity-40" />{yoyComparison.previous.year}</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-2 rounded-sm bg-gray-400" />{yoyComparison.current.year}</div>
          </div>
        </ChartCard>
      )}

      {/* Difficulty Progression */}
      {difficultyProgression.length >= 2 && (
        <ChartCard title="Difficulty Progression">
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={difficultyProgression}>
              <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} angle={-15} textAnchor="end" height={45} />
              <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}/5`, "Difficulty"]} />
              <Line type="monotone" dataKey="difficulty" stroke="#f59e0b" strokeWidth={2.5} dot={{ fill: "#f59e0b", r: 4, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-gray-500 text-[10px] text-center mt-1">
            {difficultyProgression[difficultyProgression.length - 1]?.difficulty > difficultyProgression[0]?.difficulty
              ? "You're taking on harder challenges over time 🔥"
              : "Consistent challenge levels across your journey"}
          </p>
        </ChartCard>
      )}

      {/* Difficulty Curve */}
      {difficultyProgression.length > 1 && (
        <ChartCard title="Your Difficulty Curve">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={difficultyProgression}>
              <defs>
                <linearGradient id="diffGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 9 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}/5`, "Difficulty"]} />
              <Area type="monotone" dataKey="difficulty" stroke="#ef4444" strokeWidth={2} fill="url(#diffGrad)" dot={{ fill: "#ef4444", r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
          <p className="text-center text-gray-500 text-xs mt-1">
            How your challenge difficulty has evolved over time
          </p>
        </ChartCard>
      )}

      {/* Challenge Chains */}
      <ChartCard title="Challenge Chains">
        <div className="space-y-3">
          {(() => {
            const completedIds = new Set(
              state.events.filter((e) => e.status === "completed").map((e) => e.id)
            );
            const tubeIds = [
              "wish-piccl", "wish-centl", "wish-bakrl", "wish-jubll",
              "wish-nrthl", "wish-victo", "wish-distr", "wish-metrl",
              "wish-circl", "wish-hammr",
            ];
            const chains = [
              {
                name: "Three Peaks Master",
                icon: "🏔️",
                ids: ["y3p-001", "n3p-004", "wish-w3pk0"],
                labels: ["Yorkshire 3P", "National 3P", "Welsh 3P"],
              },
              {
                name: "Bob Graham Trilogy",
                icon: "👑",
                ids: ["wish-bgr00", "wish-paddy", "wish-ramsy"],
                labels: ["Bob Graham", "Paddy Buckley", "Ramsay"],
              },
              {
                name: "London Underground",
                icon: "🚇",
                ids: tubeIds,
                labels: tubeIds.map((id) => id.replace("wish-", "").toUpperCase()),
                threshold: 3,
              },
              {
                name: "Coast to Coast",
                icon: "🌊",
                ids: ["wish-hadri", "wish-c2c00"],
                labels: ["Hadrian's Wall", "Coast to Coast"],
              },
              {
                name: "Lake District Legend",
                icon: "⛰️",
                ids: ["wish-helve", "wish-grgab", "wish-skidd", "wish-shrpe"],
                labels: ["Helvellyn", "Great Gable", "Skiddaw", "Blencathra"],
              },
              {
                name: "Scottish Explorer",
                icon: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
                ids: ["wish-whw00", "wish-rroyw", "wish-speyw"],
                labels: ["West Highland", "Rob Roy", "Speyside"],
              },
            ];

            return chains.map((chain) => {
              const done = chain.ids.filter((id) => completedIds.has(id)).length;
              const target = chain.threshold || chain.ids.length;
              const pct = Math.round((done / target) * 100);
              const isComplete = done >= target;

              return (
                <div key={chain.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{chain.icon}</span>
                      <span className={`text-xs font-bold ${isComplete ? "text-emerald-400" : "text-white"}`}>
                        {chain.name}
                      </span>
                    </div>
                    <span className={`text-[11px] font-mono ${isComplete ? "text-emerald-400" : "text-gray-500"}`}>
                      {done}/{target}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-700/60 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: isComplete ? "#10b981" : "#8b5cf6",
                      }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {chain.ids.map((id, i) => (
                      <span
                        key={id}
                        className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                          completedIds.has(id)
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-gray-700/40 text-gray-500"
                        }`}
                      >
                        {chain.labels[i]}
                      </span>
                    ))}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </ChartCard>

      {/* Distance Chart */}
      <ChartCard title="Distance by Event">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={distanceData} margin={{ bottom: 5 }}>
            <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} angle={-15} textAnchor="end" height={45} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} unit="km" />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}km`, "Distance"]} />
            <Bar dataKey="distance" radius={[8, 8, 0, 0]}>
              {distanceData.map((e, i) => <Cell key={i} fill={e.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Cumulative */}
      <ChartCard title="Cumulative Distance">
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={cumulativeData}>
            <defs>
              <linearGradient id="statsCG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} angle={-15} textAnchor="end" height={45} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} unit="km" />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}km`, "Total"]} />
            <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} fill="url(#statsCG)" dot={{ fill: "#10b981", r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Type + Radar Row */}
      <div className="grid grid-cols-2 gap-3">
        <ChartCard title="Event Types">
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie data={typeBreakdown} cx="50%" cy="50%" innerRadius={28} outerRadius={48} dataKey="value" stroke="none">
                {typeBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-1">
            {typeBreakdown.map((t, i) => (
              <div key={t.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                <span className="text-gray-400">{t.name}</span>
                <span className="text-white font-bold ml-auto">{t.value}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Ability Radar">
          <ResponsiveContainer width="100%" height={150}>
            <RadarChart data={state.radarData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="attr" tick={{ fill: "#6b7280", fontSize: 9 }} />
              <Radar dataKey="val" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Event Map */}
      <ChartCard title="Event Map" action={
        <button
          onClick={() => setMapMode((m) => m === "svg" ? "leaflet" : "svg")}
          className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
        >
          {mapMode === "svg" ? <><Globe size={13} /> Interactive</> : <><Map size={13} /> Simple</>}
        </button>
      }>
        {mapMode === "svg" ? (
          <>
            <EventMap events={completed} upcoming={upcoming} />
            <p className="text-center text-gray-500 text-[10px] mt-2">
              Tap dots for details · Pulsing dot = next target
            </p>
          </>
        ) : (
          <Suspense fallback={<div className="flex items-center justify-center h-[360px]"><div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>}>
            <LeafletMap events={state.events} />
            <p className="text-center text-gray-500 text-[10px] mt-2">
              Scroll to zoom · Tap markers for details
            </p>
          </Suspense>
        )}
      </ChartCard>

      {/* Activity Heatmap */}
      {(() => {
        const checkins = state.preferences?.weeklyCheckins ?? [];
        const heatmap = generateHeatmapData(checkins, state.events);
        const { current, longest } = computeStreaks(checkins);
        const totalWeeks = checkins.length;
        return (
          <ChartCard title="Activity Heatmap">
            <div className="flex items-center gap-3 mb-3 text-xs">
              <span className="text-gray-400">{totalWeeks} weeks trained</span>
              {current > 0 && <span className="text-amber-400 font-bold">{current}w streak</span>}
              {longest > current && <span className="text-gray-500">Best: {longest}w</span>}
            </div>
            <div className="grid gap-[3px]" style={{ gridTemplateColumns: "repeat(13, 1fr)" }}>
              {heatmap.map((w) => (
                <div
                  key={w.weekMonday}
                  className="aspect-square rounded-[3px]"
                  style={{
                    backgroundColor: w.hasEvent ? "#8b5cf6" : w.checkedIn ? "#10b981" : "#1f2937",
                  }}
                  title={`${w.weekMonday}${w.checkedIn ? " - Trained" : ""}${w.hasEvent ? " - Event" : ""}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-4 mt-3 text-[10px] text-gray-500">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-2 rounded-sm" style={{ backgroundColor: "#1f2937" }} /> No activity
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-2 rounded-sm" style={{ backgroundColor: "#10b981" }} /> Trained
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-2 rounded-sm" style={{ backgroundColor: "#8b5cf6" }} /> Event
              </div>
            </div>
          </ChartCard>
        );
      })()}

      {/* Fun Facts */}
      <ChartCard title="Fun Facts">
        <div className="space-y-3">
          {funFacts.map((f, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-lg">{f.icon}</span>
              <span className="text-gray-300 text-sm">{f.text}</span>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}
