import { useState, useRef, useEffect } from "react";
import { Trophy, Route, TrendingUp, Flame, ArrowRight, ChevronRight, Settings, Download, Upload, RotateCcw, Share2, Moon, Link2, Printer, Sparkles } from "lucide-react";
import { daysUntil, countdownLabel } from "../lib/countdown";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { useEvents } from "../hooks/useEvents";
import { useStats } from "../hooks/useStats";
import { useMilestones } from "../hooks/useMilestones";
import { useData } from "../context/DataContext";
import { TYPE_COLORS } from "../data/schema";
import { exportToJSON, importFromJSON } from "../lib/export";
import { getStorageSize } from "../lib/storage";
import ConfirmDialog from "../components/ConfirmDialog";
import GoalRing from "../components/GoalRing";
import ShareCard from "../components/ShareCard";
import { hasCheckedInThisWeek, addCheckin, computeStreaks } from "../lib/streaks";
import MotivationCard from "../components/MotivationCard";
import { checkAchievements } from "../lib/achievements";
import AchievementToast from "../components/AchievementToast";
import AnimatedNumber from "../components/AnimatedNumber";
import HeatmapCalendar from "../components/HeatmapCalendar";
import ShareProfileModal from "../components/ShareProfileModal";

const tooltipStyle = {
  backgroundColor: "#1f2937",
  border: "1px solid #374151",
  borderRadius: "12px",
  color: "#fff",
  fontSize: 12,
};

export default function HomePage({ setPage }) {
  const { completed, upcoming } = useEvents();
  const stats = useStats();
  const { totalDistance, totalEvents, totalElevation, cumulativeData, yearStats } = stats;
  const { unlocked } = useMilestones();
  const { state, dispatch } = useData();
  const [showSettings, setShowSettings] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importStatus, setImportStatus] = useState(null);
  const [editingGoals, setEditingGoals] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const [showShareProfile, setShowShareProfile] = useState(false);
  const [newAchievements, setNewAchievements] = useState([]);
  const fileInputRef = useRef(null);

  // Ensure unlockedAchievements exists in preferences
  useEffect(() => {
    if (!state.preferences?.unlockedAchievements) {
      dispatch({ type: "UPDATE_PREFERENCES", payload: { unlockedAchievements: [] } });
    }
  }, [state.preferences?.unlockedAchievements, dispatch]);

  // Check for newly unlocked achievements whenever stats or events change
  useEffect(() => {
    if (!state.preferences?.unlockedAchievements) return;

    const freshlyUnlocked = checkAchievements(stats, state.events, state.preferences);
    if (freshlyUnlocked.length > 0) {
      setNewAchievements(freshlyUnlocked);
      dispatch({
        type: "UPDATE_PREFERENCES",
        payload: {
          unlockedAchievements: [
            ...state.preferences.unlockedAchievements,
            ...freshlyUnlocked,
          ],
        },
      });
    }
  }, [stats, state.events, state.preferences?.unlockedAchievements, dispatch]);

  const handleExport = () => exportToJSON(state);

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await importFromJSON(file);
      dispatch({ type: "IMPORT_DATA", payload: data });
      setImportStatus("success");
      setTimeout(() => setImportStatus(null), 2000);
    } catch (err) {
      setImportStatus(err.message);
      setTimeout(() => setImportStatus(null), 3000);
    }
    e.target.value = "";
  };

  const handleReset = () => {
    dispatch({ type: "RESET_TO_SEED" });
    setShowResetConfirm(false);
    setShowSettings(false);
  };

  const storageSizeKB = Math.round(getStorageSize() / 1024);

  return (
    <div className="pb-24 sm:pb-8">
      {/* Achievement Toast */}
      {newAchievements.length > 0 && (
        <AchievementToast
          achievements={newAchievements}
          onDismiss={() => setNewAchievements([])}
        />
      )}

      {/* Hero Banner */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, #8b5cf6 0%, transparent 50%), radial-gradient(circle at 80% 50%, #ef4444 0%, transparent 50%)",
          }}
        />
        <div className="relative px-6 pt-12 pb-10 text-center max-w-xl mx-auto">
          {/* Top-right actions */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={() => setShowShareCard(true)}
              className="p-2 rounded-full bg-white/10 text-gray-400 hover:text-white hover:bg-white/20 transition-colors"
            >
              <Share2 size={18} />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-full bg-white/10 text-gray-400 hover:text-white hover:bg-white/20 transition-colors"
            >
              <Settings size={18} />
            </button>
          </div>
          <div className="text-5xl mb-4">🏆</div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">
            JOE'S ENDURANCE CV
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            Every kilometre earned. Every peak conquered. Every wall broken through.
          </p>

          <div className="grid grid-cols-4 gap-3 mt-8">
            {[
              { num: totalEvents, suffix: "", label: "Events", color: "#f59e0b", icon: Trophy },
              { num: totalDistance, suffix: "km", label: "Distance", color: "#10b981", icon: Route },
              {
                num: parseFloat((totalElevation / 1000).toFixed(1)),
                suffix: "k",
                decimals: 1,
                label: "Elev (m)",
                color: "#8b5cf6",
                icon: TrendingUp,
              },
              { num: 100, suffix: "km", label: "Longest", color: "#ef4444", icon: Flame },
            ].map((s, i) => (
              <div
                key={i}
                className="bg-white/5 backdrop-blur rounded-xl p-3 border border-white/10"
              >
                <s.icon size={16} style={{ color: s.color }} className="mx-auto mb-1" />
                <div className="text-xl font-black text-white">
                  <AnimatedNumber value={s.num} suffix={s.suffix} decimals={s.decimals || 0} />
                </div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Motivation */}
      <div className="px-4 mt-6">
        <MotivationCard />
      </div>

      {/* Annual Goals */}
      {(() => {
        const goals = state.preferences?.goals ?? { distance: 500, elevation: 5000, events: 10 };
        const year = new Date().getFullYear();
        const updateGoal = (key, val) => {
          const num = Math.max(0, parseInt(val) || 0);
          dispatch({ type: "UPDATE_PREFERENCES", payload: { goals: { ...goals, [key]: num } } });
        };
        return (
          <div className="px-4 mt-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-bold text-lg">
                {yearStats.hasYearDates ? `${year} Goals` : "All-Time Goals"}
              </h2>
              <button
                onClick={() => setEditingGoals(!editingGoals)}
                className="text-indigo-400 text-sm font-medium hover:text-indigo-300"
              >
                {editingGoals ? "Done" : "Edit"}
              </button>
            </div>
            <div className="bg-gray-800/60 rounded-2xl p-5 border border-gray-700/50">
              <div className="grid grid-cols-3 gap-2">
                <GoalRing value={yearStats.yearDistance} target={goals.distance} label="Distance" unit="km" color="#10b981" />
                <GoalRing value={yearStats.yearElevation} target={goals.elevation} label="Elevation" unit="m" color="#8b5cf6" />
                <GoalRing value={yearStats.yearEvents} target={goals.events} label="Events" unit="" color="#f59e0b" />
              </div>
              {editingGoals && (
                <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-700/50">
                  {[
                    { key: "distance", label: "Distance (km)", val: goals.distance },
                    { key: "elevation", label: "Elevation (m)", val: goals.elevation },
                    { key: "events", label: "Events", val: goals.events },
                  ].map((g) => (
                    <div key={g.key} className="text-center">
                      <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">{g.label}</label>
                      <input
                        type="number"
                        value={g.val}
                        onChange={(e) => updateGoal(g.key, e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-center text-sm focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Training Streak */}
      {(() => {
        const checkins = state.preferences?.weeklyCheckins ?? [];
        const checked = hasCheckedInThisWeek(checkins);
        const { current, longest } = computeStreaks(checkins);
        return (
          <div className="px-4 mt-4">
            <div className="bg-gray-800/60 rounded-2xl p-4 border border-gray-700/50 flex items-center justify-between">
              <div>
                <div className="text-white font-bold text-sm">
                  {current > 0 ? `🔥 ${current} week streak` : "No active streak"}
                </div>
                <div className="text-gray-500 text-xs mt-0.5">
                  {longest > 0 ? `Best: ${longest} weeks` : "Check in weekly to build a streak"}
                </div>
              </div>
              <button
                onClick={() => {
                  if (!checked) {
                    dispatch({ type: "UPDATE_PREFERENCES", payload: { weeklyCheckins: addCheckin(checkins) } });
                  }
                }}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  checked
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95"
                }`}
              >
                {checked ? "✓ Done" : "I trained"}
              </button>
            </div>
          </div>
        );
      })()}

      {/* Next Target Teaser */}
      {upcoming && (
        <div className="px-4 mt-4">
          <button
            onClick={() => setPage("next")}
            className="w-full bg-gradient-to-r from-red-900/60 to-orange-900/60 border border-red-700/40 rounded-2xl p-4 text-left hover:border-red-600/60 transition-all active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-red-400 font-bold mb-1">
                  Next Target
                </div>
                <div className="text-white font-bold text-lg">
                  🎯 {upcoming.name}
                </div>
                <div className="text-gray-400 text-sm mt-0.5">
                  {upcoming.distance}km · {upcoming.date} · {upcoming.phase}
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-3">
                {countdownLabel(daysUntil(upcoming.date)) && (
                  <div className="text-orange-400 text-xs font-bold">
                    {countdownLabel(daysUntil(upcoming.date))}
                  </div>
                )}
                <ChevronRight size={20} className="text-red-400 ml-auto" />
              </div>
            </div>
            <div className="mt-3 w-full bg-gray-900/60 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-red-500 to-orange-500 h-1.5 rounded-full transition-all duration-700"
                style={{ width: `${upcoming.progress}%` }}
              />
            </div>
          </button>
        </div>
      )}

      {/* Recent Events Preview */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-bold text-lg">Completed Challenges</h2>
          <button
            onClick={() => setPage("events")}
            className="text-indigo-400 text-sm font-medium flex items-center gap-1 hover:text-indigo-300"
          >
            View all <ArrowRight size={14} />
          </button>
        </div>
        <div
          className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar"
        >
          {[...completed].reverse().map((event) => (
            <button
              key={event.id}
              onClick={() => setPage("events")}
              className="flex-shrink-0 w-44 rounded-2xl overflow-hidden border border-gray-800 hover:border-gray-600 transition-all text-left active:scale-[0.98]"
            >
              <div
                className="h-20 flex items-center justify-center text-4xl"
                style={{ background: event.heroImage }}
              >
                {event.badge}
              </div>
              <div className="p-3 bg-gray-800/80">
                <div className="text-white font-bold text-sm truncate">{event.name}</div>
                <div className="text-gray-400 text-xs mt-0.5 flex items-center gap-2">
                  {event.distance && <span>{event.distance}km</span>}
                  <span style={{ color: TYPE_COLORS[event.type] }}>{event.type}</span>
                </div>
                {event.completions > 1 && (
                  <span className="inline-block mt-1 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-1.5 py-0.5 rounded">
                    ×{event.completions}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats Preview */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-bold text-lg">Journey So Far</h2>
          <button
            onClick={() => setPage("stats")}
            className="text-indigo-400 text-sm font-medium flex items-center gap-1 hover:text-indigo-300"
          >
            Full stats <ArrowRight size={14} />
          </button>
        </div>
        <div className="bg-gray-800/60 rounded-2xl p-4 border border-gray-700/50">
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={cumulativeData}>
              <defs>
                <linearGradient id="homeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="name"
                tick={{ fill: "#6b7280", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#6b7280", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                unit="km"
              />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}km`, "Total"]} />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#homeGrad)"
                dot={{ fill: "#10b981", r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
          <p className="text-center text-gray-500 text-xs mt-1">
            Cumulative distance across all events
          </p>
        </div>
      </div>

      {/* Badges Preview */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-bold text-lg">Badges</h2>
          <button
            onClick={() => setPage("milestones")}
            className="text-indigo-400 text-sm font-medium flex items-center gap-1 hover:text-indigo-300"
          >
            All badges <ArrowRight size={14} />
          </button>
        </div>
        <div
          className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar"
        >
          {unlocked.map((m, i) => (
            <div
              key={i}
              className="flex-shrink-0 bg-gray-800/60 border border-gray-700/50 rounded-xl px-3 py-2.5 text-center min-w-[80px]"
            >
              <div className="text-2xl mb-1">{m.icon}</div>
              <div className="text-[10px] text-gray-300 font-medium leading-tight">{m.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Year in Review */}
      {completed.length >= 3 && (
        <div className="px-4 mt-6">
          <button
            onClick={() => setPage("wrapped")}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-4 border border-indigo-500/30 text-left hover:from-indigo-500 hover:to-purple-500 transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <Sparkles size={20} className="text-amber-300" />
              <div>
                <div className="text-white font-bold text-sm">Year in Review</div>
                <div className="text-indigo-200 text-xs">Your Wrapped-style journey recap</div>
              </div>
              <ArrowRight size={16} className="text-white/60 ml-auto" />
            </div>
          </button>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="px-4 mt-6">
          <div className="bg-gray-800/60 rounded-2xl p-5 border border-gray-700/50">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <Moon size={18} className="text-amber-400" />
                <div>
                  <div className="text-white text-sm font-medium">OLED Black Mode</div>
                  <div className="text-gray-500 text-xs">True black for AMOLED screens</div>
                </div>
              </div>
              <button
                onClick={() => dispatch({ type: "UPDATE_PREFERENCES", payload: { oledMode: !state.preferences?.oledMode } })}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  state.preferences?.oledMode ? "bg-amber-500" : "bg-gray-600"
                }`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  state.preferences?.oledMode ? "translate-x-5" : ""
                }`} />
              </button>
            </div>

            <h3 className="text-white font-bold text-sm mb-4">Data Management</h3>

            <div className="space-y-3">
              <button
                onClick={handleExport}
                className="w-full flex items-center gap-3 bg-gray-900/60 rounded-xl p-3 border border-gray-700/30 hover:border-gray-600 transition-colors text-left"
              >
                <Download size={18} className="text-emerald-400" />
                <div>
                  <div className="text-white text-sm font-medium">Export Data</div>
                  <div className="text-gray-500 text-xs">Download as JSON file</div>
                </div>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-3 bg-gray-900/60 rounded-xl p-3 border border-gray-700/30 hover:border-gray-600 transition-colors text-left"
              >
                <Upload size={18} className="text-indigo-400" />
                <div>
                  <div className="text-white text-sm font-medium">Import Data</div>
                  <div className="text-gray-500 text-xs">Replace with JSON file</div>
                </div>
              </button>

              <button
                onClick={() => window.print()}
                className="w-full flex items-center gap-3 bg-gray-900/60 rounded-xl p-3 border border-gray-700/30 hover:border-gray-600 transition-colors text-left"
              >
                <Printer size={18} className="text-cyan-400" />
                <div>
                  <div className="text-white text-sm font-medium">Print / PDF</div>
                  <div className="text-gray-500 text-xs">Print-friendly view of your CV</div>
                </div>
              </button>

              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full flex items-center gap-3 bg-gray-900/60 rounded-xl p-3 border border-red-900/30 hover:border-red-700/50 transition-colors text-left"
              >
                <RotateCcw size={18} className="text-red-400" />
                <div>
                  <div className="text-white text-sm font-medium">Reset to Defaults</div>
                  <div className="text-gray-500 text-xs">Restore original seed data</div>
                </div>
              </button>
            </div>

            {importStatus && (
              <div className={`mt-3 text-sm px-3 py-2 rounded-lg ${
                importStatus === "success"
                  ? "bg-emerald-900/30 text-emerald-300"
                  : "bg-red-900/30 text-red-300"
              }`}>
                {importStatus === "success" ? "Data imported successfully!" : importStatus}
              </div>
            )}

            <div className="mt-3 text-center text-gray-600 text-[10px]">
              Storage: {storageSizeKB}KB used
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />

      {/* Reset confirmation */}
      {showResetConfirm && (
        <ConfirmDialog
          title="Reset All Data?"
          message="This will replace all your events, milestones, and settings with the original defaults. This cannot be undone."
          onConfirm={handleReset}
          onCancel={() => setShowResetConfirm(false)}
        />
      )}

      {/* Share card overlay */}
      {showShareCard && (
        <ShareCard
          stats={{
            totalEvents,
            totalDistance,
            totalElevation,
            topEvents: completed.slice().reverse().slice(0, 5),
            badgesCount: unlocked.length,
          }}
          onClose={() => setShowShareCard(false)}
        />
      )}
    </div>
  );
}
