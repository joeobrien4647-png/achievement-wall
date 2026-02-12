import { Route, TrendingUp, Calendar, Zap, Flame, Check, X, ChevronDown } from "lucide-react";
import { useState } from "react";
import { daysUntil, countdownLabel } from "../lib/countdown";
import { useEvents } from "../hooks/useEvents";

function TrainingWeeks({ weeks, onToggle }) {
  const doneCount = weeks.filter((w) => w === "done").length;
  const totalWeeks = weeks.length;

  // Calculate current streak
  let streak = 0;
  for (let i = weeks.length - 1; i >= 0; i--) {
    if (weeks[i] === "done") streak++;
    else if (weeks[i] === "skipped" || weeks[i] === null) break;
  }

  return (
    <div className="bg-gray-800 rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] uppercase tracking-widest text-purple-400 font-bold">
          Training Weeks
        </div>
        <div className="text-xs text-gray-400">
          {doneCount}/{totalWeeks} completed
          {streak > 1 && <span className="text-amber-400 ml-2">🔥 {streak} week streak</span>}
        </div>
      </div>

      <div className="grid grid-cols-6 gap-2">
        {weeks.map((status, i) => (
          <button
            key={i}
            onClick={() => onToggle(i)}
            className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all active:scale-90 border-2 ${
              status === "done"
                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                : status === "skipped"
                ? "bg-red-500/10 border-red-500/30 text-red-400"
                : "bg-gray-900/60 border-gray-700 text-gray-600 hover:border-gray-500"
            }`}
          >
            {status === "done" ? (
              <Check size={14} />
            ) : status === "skipped" ? (
              <X size={14} />
            ) : (
              <span className="text-[10px]">W{i + 1}</span>
            )}
          </button>
        ))}
      </div>

      <p className="text-gray-500 text-[10px] mt-2 text-center">
        Tap to cycle: empty → done → skipped → empty
      </p>
    </div>
  );
}

// ── Derive current week from training weeks (first null = current) ────
function getCurrentWeekIndex(trainingWeeks) {
  if (!trainingWeeks) return 0;
  const idx = trainingWeeks.findIndex((w) => w === null);
  return idx === -1 ? trainingWeeks.length - 1 : idx;
}

// ── Phase colour palette ─────────────────────────────────────────────
const PHASE_COLORS = {
  "Base Phase":  { bg: "bg-blue-500/20",   border: "border-blue-500/40",  text: "text-blue-400",   bar: "from-blue-600 to-blue-400"   },
  "Build Phase": { bg: "bg-amber-500/20",  border: "border-amber-500/40", text: "text-amber-400",  bar: "from-amber-600 to-amber-400" },
  "Peak Phase":  { bg: "bg-red-500/20",    border: "border-red-500/40",   text: "text-red-400",    bar: "from-red-600 to-red-400"     },
  "Taper":       { bg: "bg-emerald-500/20", border: "border-emerald-500/40", text: "text-emerald-400", bar: "from-emerald-600 to-emerald-400" },
};

function TrainingPlanSection({ plan, trainingWeeks }) {
  const [expandedPhase, setExpandedPhase] = useState(null);
  const currentWeekIdx = getCurrentWeekIndex(trainingWeeks);

  // Build a running offset so we know which trainingWeeks indices belong to each phase
  let weekOffset = 0;
  const phaseBlocks = plan.phases.map((phase) => {
    const start = weekOffset;
    const end = weekOffset + phase.weeks;
    weekOffset = end;

    // Count done/skipped within this phase's slice of trainingWeeks
    const slice = (trainingWeeks || []).slice(start, end);
    const done = slice.filter((w) => w === "done").length;
    const total = phase.weeks;
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;

    // Is the current week inside this phase?
    const isCurrent = currentWeekIdx >= start && currentWeekIdx < end;

    // Weekly plan rows for this phase
    const weekRows = plan.weeklyPlan.slice(start, end);

    return { ...phase, start, end, done, total, progress, isCurrent, weekRows };
  });

  return (
    <div className="bg-gray-800 rounded-xl p-4 mb-4">
      <div className="text-[10px] uppercase tracking-widest text-purple-400 font-bold mb-3">
        Training Plan
      </div>

      <div className="space-y-2">
        {phaseBlocks.map((phase) => {
          const colors = PHASE_COLORS[phase.name] || PHASE_COLORS["Build Phase"];
          const isExpanded = expandedPhase === phase.name;

          return (
            <div key={phase.name}>
              {/* Phase header — clickable */}
              <button
                onClick={() => setExpandedPhase(isExpanded ? null : phase.name)}
                className={`w-full text-left rounded-xl p-3 border transition-all ${
                  phase.isCurrent
                    ? `${colors.bg} ${colors.border}`
                    : "bg-gray-900/40 border-gray-700/40 hover:border-gray-600"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${phase.isCurrent ? colors.text : "text-gray-300"}`}>
                      {phase.name}
                    </span>
                    {phase.isCurrent && (
                      <span className={`text-[9px] font-bold uppercase tracking-wider ${colors.text} opacity-70`}>
                        Current
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500">
                      {phase.done}/{phase.total} weeks
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-gray-500 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </div>
                </div>

                {/* Phase progress bar */}
                <div className="w-full bg-gray-900/60 rounded-full h-1.5">
                  <div
                    className={`bg-gradient-to-r ${colors.bar} h-1.5 rounded-full transition-all duration-700`}
                    style={{ width: `${phase.progress}%` }}
                  />
                </div>

                {/* Description */}
                <p className="text-gray-500 text-[11px] mt-1.5 leading-snug">{phase.description}</p>
              </button>

              {/* Expanded: week-by-week breakdown */}
              {isExpanded && (
                <div className="mt-1 ml-2 border-l-2 border-gray-700/50 pl-3 space-y-1.5 py-1">
                  {phase.weekRows.map((w) => {
                    const weekIdx = w.week - 1;
                    const status = (trainingWeeks || [])[weekIdx];
                    const isCurrentWeek = weekIdx === currentWeekIdx;

                    return (
                      <div
                        key={w.week}
                        className={`rounded-lg p-2.5 text-xs transition-all ${
                          isCurrentWeek
                            ? `${colors.bg} ${colors.border} border`
                            : status === "done"
                              ? "bg-emerald-900/15 border border-emerald-800/30"
                              : status === "skipped"
                                ? "bg-red-900/10 border border-red-800/20"
                                : "bg-gray-900/30"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className={`font-bold ${isCurrentWeek ? colors.text : "text-gray-300"}`}>
                            Week {w.week}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">{w.targetKm}km target</span>
                            {status === "done" && <Check size={12} className="text-emerald-400" />}
                            {status === "skipped" && <X size={12} className="text-red-400" />}
                          </div>
                        </div>
                        <div className="text-gray-400">{w.focus}</div>
                        {w.notes && (
                          <div className="text-gray-600 text-[10px] mt-1 leading-snug">{w.notes}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function NextPage() {
  const { upcoming, updateEvent } = useEvents();

  if (!upcoming) {
    return (
      <div className="px-4 pb-24 sm:pb-8 pt-16 text-center">
        <div className="text-5xl mb-4">🎯</div>
        <h2 className="text-xl font-bold text-white mb-2">No Upcoming Event</h2>
        <p className="text-gray-400 text-sm">
          Add an event with status "upcoming" to see it here.
        </p>
      </div>
    );
  }

  const plan = upcoming.trainingPlan || null;

  const toggleWeek = (index) => {
    const weeks = [...(upcoming.trainingWeeks || [])];
    const cycle = { null: "done", done: "skipped", skipped: null };
    weeks[index] = cycle[weeks[index]] ?? "done";

    // Auto-calculate progress from weeks
    const doneCount = weeks.filter((w) => w === "done").length;
    const progress = Math.round((doneCount / weeks.length) * 100);

    // Derive current phase & week label from the plan if available
    const updates = { trainingWeeks: weeks, progress };
    if (plan) {
      const currentIdx = weeks.findIndex((w) => w === null);
      const activeWeek = currentIdx === -1 ? weeks.length : currentIdx;

      // Find which phase this week belongs to
      let offset = 0;
      for (const phase of plan.phases) {
        if (activeWeek < offset + phase.weeks) {
          updates.phase = phase.name;
          updates.week = `Week ${activeWeek + 1} of ${plan.totalWeeks}`;
          break;
        }
        offset += phase.weeks;
      }
      // If all weeks are done, show last phase as complete
      if (currentIdx === -1) {
        updates.phase = plan.phases[plan.phases.length - 1].name;
        updates.week = `Week ${plan.totalWeeks} of ${plan.totalWeeks}`;
      }
    }

    updateEvent(upcoming.id, updates);
  };

  return (
    <div className="pb-24 sm:pb-8">
      <div
        className="h-44 flex items-center justify-center relative"
        style={{
          background:
            upcoming.heroImage ||
            "linear-gradient(135deg, #dc2626 0%, #ea580c 100%)",
        }}
      >
        <div className="text-center">
          <div className="text-5xl mb-2">{upcoming.badge || "🎯"}</div>
          <h2 className="text-2xl font-black text-white">{upcoming.name}</h2>
          {countdownLabel(daysUntil(upcoming.date)) && (
            <div className="mt-2 inline-block bg-black/40 backdrop-blur rounded-full px-4 py-1">
              <span className="text-orange-400 font-black text-sm tracking-wide">
                {countdownLabel(daysUntil(upcoming.date))}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 -mt-6 relative">
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="p-5">
            <div className="grid grid-cols-3 gap-3 mb-5">
              {upcoming.distance && (
                <div className="bg-gray-800 rounded-xl p-3 text-center">
                  <Route size={16} className="text-emerald-400 mx-auto mb-1" />
                  <div className="text-white font-bold">{upcoming.distance}km</div>
                  <div className="text-[10px] text-gray-500 uppercase">Distance</div>
                </div>
              )}
              {upcoming.elevation && (
                <div className="bg-gray-800 rounded-xl p-3 text-center">
                  <TrendingUp size={16} className="text-orange-400 mx-auto mb-1" />
                  <div className="text-white font-bold">{upcoming.elevation}m</div>
                  <div className="text-[10px] text-gray-500 uppercase">Elevation</div>
                </div>
              )}
              {upcoming.date && (
                <div className="bg-gray-800 rounded-xl p-3 text-center">
                  <Calendar size={16} className="text-purple-400 mx-auto mb-1" />
                  <div className="text-white font-bold">{upcoming.date}</div>
                  <div className="text-[10px] text-gray-500 uppercase">Date</div>
                </div>
              )}
            </div>

            {/* Training Progress Bar */}
            {upcoming.phase && (
              <div className="mb-5">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-gray-400 font-medium">
                    {upcoming.phase} · {upcoming.week}
                  </span>
                  <span className="text-amber-400 font-bold">{upcoming.progress}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-red-500 to-orange-500 h-3 rounded-full transition-all duration-700"
                    style={{ width: `${upcoming.progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Training Weeks Grid */}
            {upcoming.trainingWeeks?.length > 0 && (
              <TrainingWeeks weeks={upcoming.trainingWeeks} onToggle={toggleWeek} />
            )}

            {/* Training Plan Phases */}
            {plan && (
              <TrainingPlanSection plan={plan} trainingWeeks={upcoming.trainingWeeks} />
            )}

            {/* Route */}
            {upcoming.route && (
              <div className="bg-gray-800 rounded-xl p-4 mb-4">
                <div className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold mb-2">
                  Route
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{upcoming.route}</p>
              </div>
            )}

            {/* Why You'll Finish */}
            {upcoming.reasons?.length > 0 && (
              <div className="bg-gray-800 rounded-xl p-4 mb-4">
                <div className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold mb-2">
                  Why You'll Finish This
                </div>
                <div className="space-y-2">
                  {upcoming.reasons.map((r, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Zap size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm">{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Watch-Outs */}
            {upcoming.watchOuts?.length > 0 && (
              <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-4">
                <div className="text-[10px] uppercase tracking-widest text-amber-400 font-bold mb-2">
                  Watch-Outs
                </div>
                <div className="space-y-2">
                  {upcoming.watchOuts.map((r, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Flame size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm">{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
