import { Route, TrendingUp, Calendar, Zap, Flame, Check, X } from "lucide-react";
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

  const toggleWeek = (index) => {
    const weeks = [...(upcoming.trainingWeeks || [])];
    const cycle = { null: "done", done: "skipped", skipped: null };
    weeks[index] = cycle[weeks[index]] ?? "done";

    // Auto-calculate progress from weeks
    const doneCount = weeks.filter((w) => w === "done").length;
    const progress = Math.round((doneCount / weeks.length) * 100);

    updateEvent(upcoming.id, { trainingWeeks: weeks, progress });
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
