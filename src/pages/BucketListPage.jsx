import { useState } from "react";
import { Plus, ArrowUpRight, Trash2, ChevronDown, Sparkles } from "lucide-react";
import { useEvents } from "../hooks/useEvents";
import { useStats } from "../hooks/useStats";
import { TYPE_COLORS } from "../data/schema";
import ConfirmDialog from "../components/ConfirmDialog";

function getRecommendations(stats, completed, wishlist) {
  const recs = [];
  const maxDist = stats.personalRecords?.longestDistance?.value || 0;
  const types = new Set(completed.map((e) => e.type));
  const wishNames = new Set(wishlist.map((e) => e.name.toLowerCase()));

  // Distance progression
  if (maxDist > 0 && maxDist < 160) {
    const next = maxDist <= 50 ? 100 : 160;
    const name = `${next}km Ultra Challenge`;
    if (!wishNames.has(name.toLowerCase())) {
      recs.push({ name, type: "Ultra", distance: next, reason: `You've conquered ${maxDist}km — the next frontier is ${next}km` });
    }
  }

  // Type diversity
  if (!types.has("Urban") && !wishNames.has("urban endurance walk")) {
    recs.push({ name: "Urban Endurance Walk", type: "Urban", distance: 50, reason: "You haven't done an urban challenge yet — try the concrete jungle" });
  }
  if (!types.has("Mountain") && !wishNames.has("mountain summit challenge")) {
    recs.push({ name: "Mountain Summit Challenge", type: "Mountain", distance: 30, reason: "No mountain events yet — time to go vertical" });
  }

  // International
  const hasInternational = completed.some((e) => e.location && !["uk", "england", "scotland", "wales", "london", "yorkshire", "lake district", "south downs", "brighton", "fort william"].some((loc) => e.location.toLowerCase().includes(loc)));
  if (!hasInternational && !wishNames.has("international ultra")) {
    recs.push({ name: "International Ultra", type: "Ultra", distance: 100, reason: "All your events are UK-based — take it abroad" });
  }

  // Multi-day
  const hasMultiDay = completed.some((e) => e.distance && e.distance >= 160);
  if (!hasMultiDay && maxDist >= 100 && !wishNames.has("multi-day stage race")) {
    recs.push({ name: "Multi-Day Stage Race", type: "Ultra", distance: 200, reason: "You've done 100km in one go — try spreading it over multiple days" });
  }

  return recs.slice(0, 3);
}

export default function BucketListPage({ onAddWishlist, onEditEvent }) {
  const { wishlist, upcoming, updateEvent, deleteEvent } = useEvents();
  const stats = useStats();
  const { completed } = useEvents();
  const [expandedId, setExpandedId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const recommendations = getRecommendations(stats, completed, wishlist);

  const promoteToUpcoming = (event) => {
    // If there's already an upcoming event, swap it to wishlist
    if (upcoming) {
      updateEvent(upcoming.id, { status: "wishlist" });
    }
    updateEvent(event.id, {
      status: "upcoming",
      trainingWeeks: Array(12).fill(null),
      phase: "Build Phase",
      week: "Week 1 of 12",
      progress: 0,
    });
  };

  if (wishlist.length === 0 && recommendations.length === 0) {
    return (
      <div className="px-4 pb-24 sm:pb-8 pt-16 text-center">
        <div className="text-5xl mb-4">🧭</div>
        <h2 className="text-xl font-bold text-white mb-2">What's on your horizon?</h2>
        <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">
          Add the challenges you dream about. The ones that keep you training when it's dark and cold.
        </p>
        <button
          onClick={onAddWishlist}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors"
        >
          Add your first dream challenge
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 pb-24 sm:pb-8 pt-4 relative">
      <div className="mb-5">
        <h2 className="text-2xl font-black text-white mb-1">Bucket List</h2>
        <p className="text-gray-500 text-sm">
          {wishlist.length} challenge{wishlist.length !== 1 ? "s" : ""} on the horizon
        </p>
      </div>

      {/* Wishlist cards */}
      <div className="space-y-3 mb-6">
        {wishlist.map((event) => {
          const expanded = expandedId === event.id;
          return (
            <div
              key={event.id}
              className="bg-gray-800/60 rounded-2xl overflow-hidden border border-gray-700/50"
            >
              <button
                onClick={() => setExpandedId(expanded ? null : event.id)}
                className="w-full text-left"
              >
                <div className="flex">
                  <div
                    className="w-20 h-24 flex items-center justify-center text-3xl flex-shrink-0"
                    style={{ background: event.heroImage }}
                  >
                    {event.badge}
                  </div>
                  <div className="p-3.5 flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-white font-bold text-base truncate">{event.name}</div>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                          <span style={{ color: TYPE_COLORS[event.type] }}>{event.type}</span>
                          {event.distance && <span>{event.distance}km</span>}
                          {event.elevation && <span>↑{event.elevation}m</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {event.targetYear && (
                          <span className="bg-indigo-500/15 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded">
                            {event.targetYear}
                          </span>
                        )}
                        <ChevronDown
                          size={16}
                          className={`text-gray-500 transition-transform ${expanded ? "rotate-180" : ""}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </button>

              {/* Expanded detail */}
              {expanded && (
                <div className="border-t border-gray-700/50 p-4 space-y-3">
                  {event.appeal && (
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold mb-1">
                        Why this appeals
                      </div>
                      <p className="text-gray-300 text-sm">{event.appeal}</p>
                    </div>
                  )}
                  {event.location && (
                    <div className="text-gray-400 text-sm">📍 {event.location}</div>
                  )}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => promoteToUpcoming(event)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600/20 border border-emerald-600/40 text-emerald-400 font-medium text-xs py-2.5 rounded-xl hover:bg-emerald-600/30 transition-colors"
                    >
                      <ArrowUpRight size={14} /> Make Next Target
                    </button>
                    <button
                      onClick={() => onEditEvent(event.id)}
                      className="px-4 bg-gray-700/50 border border-gray-600/50 text-gray-300 text-xs py-2.5 rounded-xl hover:bg-gray-700 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(event)}
                      className="px-3 bg-gray-700/50 border border-gray-600/50 text-gray-400 text-xs py-2.5 rounded-xl hover:text-red-400 hover:border-red-700/50 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-amber-400" />
            <h3 className="text-white font-bold text-sm">Suggested Challenges</h3>
          </div>
          <div className="space-y-2">
            {recommendations.map((rec, i) => (
              <button
                key={i}
                onClick={() => onAddWishlist(rec)}
                className="w-full text-left bg-gray-800/30 border border-dashed border-gray-700/50 rounded-xl p-3.5 hover:border-amber-600/40 hover:bg-amber-900/10 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium text-sm group-hover:text-amber-200 transition-colors">
                      {rec.name}
                    </div>
                    <div className="text-gray-500 text-xs mt-0.5">{rec.reason}</div>
                  </div>
                  <Plus size={16} className="text-gray-600 group-hover:text-amber-400 transition-colors flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add button */}
      <button
        onClick={() => onAddWishlist()}
        className="fixed bottom-20 sm:bottom-6 right-4 sm:right-auto sm:left-1/2 sm:translate-x-[calc(min(50vw,320px)-2rem)] z-40 w-14 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg shadow-indigo-600/30 flex items-center justify-center transition-all active:scale-90"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      {/* Delete confirm */}
      {deleteTarget && (
        <ConfirmDialog
          title={`Remove ${deleteTarget.name}?`}
          message="This will remove it from your bucket list."
          onConfirm={() => {
            deleteEvent(deleteTarget.id);
            setDeleteTarget(null);
            setExpandedId(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
