import { useState, useMemo, useCallback } from "react";
import { Plus, ArrowUpRight, Trash2, ChevronDown, Sparkles, Search, ArrowUpDown, GripVertical } from "lucide-react";
import { useEvents } from "../hooks/useEvents";
import { useStats } from "../hooks/useStats";
import { TYPE_COLORS } from "../data/schema";
import { generateTrainingPlan } from "../lib/trainingPlan";
import ConfirmDialog from "../components/ConfirmDialog";

const CATEGORIES = [
  { key: "all", label: "All", icon: "🧭" },
  { key: "Mountains", label: "Mountains", icon: "⛰️" },
  { key: "Endurance", label: "Endurance", icon: "🥾" },
  { key: "Multi-Day", label: "Multi-Day", icon: "🏕️" },
  { key: "Urban", label: "Urban", icon: "🏙️" },
  { key: "International", label: "International", icon: "🌍" },
  { key: "Running", label: "Running", icon: "🏃" },
  { key: "Extreme", label: "Extreme", icon: "🔥" },
];

const SORT_OPTIONS = [
  { key: "default", label: "Default" },
  { key: "distance-asc", label: "Distance ↑" },
  { key: "distance-desc", label: "Distance ↓" },
  { key: "difficulty-asc", label: "Easiest first" },
  { key: "difficulty-desc", label: "Hardest first" },
  { key: "name", label: "A → Z" },
];

function DifficultyDots({ level }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <div
          key={n}
          className={`w-1.5 h-1.5 rounded-full ${
            n <= level ? "bg-amber-400" : "bg-gray-700"
          }`}
        />
      ))}
    </div>
  );
}

function getRecommendations(stats, completed, wishlist) {
  const recs = [];
  const maxDist = stats.personalRecords?.longestDistance?.value || 0;
  const types = new Set(completed.map((e) => e.type));
  const wishNames = new Set(wishlist.map((e) => e.name.toLowerCase()));

  if (maxDist > 0 && maxDist < 160) {
    const next = maxDist <= 50 ? 100 : 160;
    const name = `${next}km Ultra Challenge`;
    if (!wishNames.has(name.toLowerCase())) {
      recs.push({ name, type: "Ultra", distance: next, reason: `You've conquered ${maxDist}km — the next frontier is ${next}km` });
    }
  }
  if (!types.has("Urban") && !wishNames.has("urban endurance walk")) {
    recs.push({ name: "Urban Endurance Walk", type: "Urban", distance: 50, reason: "You haven't done an urban challenge yet — try the concrete jungle" });
  }
  if (!types.has("Mountain") && !wishNames.has("mountain summit challenge")) {
    recs.push({ name: "Mountain Summit Challenge", type: "Mountain", distance: 30, reason: "No mountain events yet — time to go vertical" });
  }
  const hasInternational = completed.some((e) => e.location && !["uk", "england", "scotland", "wales", "london", "yorkshire", "lake district", "south downs", "brighton", "fort william"].some((loc) => e.location.toLowerCase().includes(loc)));
  if (!hasInternational && !wishNames.has("international ultra")) {
    recs.push({ name: "International Ultra", type: "Ultra", distance: 100, reason: "All your events are UK-based — take it abroad" });
  }
  const hasMultiDay = completed.some((e) => e.distance && e.distance >= 160);
  if (!hasMultiDay && maxDist >= 100 && !wishNames.has("multi-day stage race")) {
    recs.push({ name: "Multi-Day Stage Race", type: "Ultra", distance: 200, reason: "You've done 100km in one go — try spreading it over multiple days" });
  }
  return recs.slice(0, 3);
}

function groupByCategory(events) {
  const groups = {};
  for (const e of events) {
    const cat = e.category || "Custom";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(e);
  }
  return groups;
}

function sortEvents(events, sortKey) {
  if (sortKey === "default") return events;
  const sorted = [...events];
  switch (sortKey) {
    case "distance-asc": return sorted.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    case "distance-desc": return sorted.sort((a, b) => (b.distance || 0) - (a.distance || 0));
    case "difficulty-asc": return sorted.sort((a, b) => (a.difficulty || 0) - (b.difficulty || 0));
    case "difficulty-desc": return sorted.sort((a, b) => (b.difficulty || 0) - (a.difficulty || 0));
    case "name": return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default: return events;
  }
}

function WishlistCard({ event, expanded, onToggle, onPromote, onEdit, onDelete, reorderMode, isOver, dragHandleProps }) {
  return (
    <div
      className={`bg-gray-800/60 rounded-2xl overflow-hidden border transition-colors ${
        reorderMode && isOver
          ? "border-t-2 border-t-indigo-500 border-gray-700/50"
          : "border-gray-700/50"
      }`}
    >
      <div className={reorderMode ? "w-full text-left" : undefined}>
        {!reorderMode ? (
          <button onClick={onToggle} className="w-full text-left">
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
                    <div className="mt-1">
                      <DifficultyDots level={event.difficulty || 0} />
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
        ) : (
          <div className="flex items-center">
            <div
              {...dragHandleProps}
              className="flex items-center justify-center w-10 h-24 cursor-grab active:cursor-grabbing flex-shrink-0"
            >
              <GripVertical size={18} className="text-gray-500" />
            </div>
            <div
              className="w-16 h-24 flex items-center justify-center text-3xl flex-shrink-0"
              style={{ background: event.heroImage }}
            >
              {event.badge}
            </div>
            <div className="p-3.5 flex-1 min-w-0">
              <div className="min-w-0">
                <div className="text-white font-bold text-base truncate">{event.name}</div>
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                  <span style={{ color: TYPE_COLORS[event.type] }}>{event.type}</span>
                  {event.distance && <span>{event.distance}km</span>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {!reorderMode && expanded && (
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
              onClick={onPromote}
              className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600/20 border border-emerald-600/40 text-emerald-400 font-medium text-xs py-2.5 rounded-xl hover:bg-emerald-600/30 transition-colors"
            >
              <ArrowUpRight size={14} /> Make Next Target
            </button>
            <button
              onClick={onEdit}
              className="px-4 bg-gray-700/50 border border-gray-600/50 text-gray-300 text-xs py-2.5 rounded-xl hover:bg-gray-700 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={onDelete}
              className="px-3 bg-gray-700/50 border border-gray-600/50 text-gray-400 text-xs py-2.5 rounded-xl hover:text-red-400 hover:border-red-700/50 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BucketListPage({ onAddWishlist, onEditEvent }) {
  const { wishlist, upcoming, updateEvent, deleteEvent, reorderWishlist } = useEvents();
  const stats = useStats();
  const { completed } = useEvents();
  const [expandedId, setExpandedId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState("default");
  const [showSort, setShowSort] = useState(false);
  const [reorderMode, setReorderMode] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);

  const toggleReorderMode = useCallback(() => {
    setReorderMode((prev) => {
      if (!prev) {
        // Entering reorder mode: collapse any expanded card
        setExpandedId(null);
      }
      return !prev;
    });
    setDraggedIndex(null);
    setOverIndex(null);
  }, []);

  const handleDragStart = useCallback((e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback((e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setOverIndex(index);
  }, []);

  const handleDragLeave = useCallback(() => {
    setOverIndex(null);
  }, []);

  const handleDrop = useCallback((e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex == null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setOverIndex(null);
      return;
    }
    const reordered = [...wishlist];
    const [moved] = reordered.splice(draggedIndex, 1);
    reordered.splice(dropIndex, 0, moved);
    reorderWishlist(reordered.map((ev) => ev.id));
    setDraggedIndex(null);
    setOverIndex(null);
  }, [draggedIndex, wishlist, reorderWishlist]);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setOverIndex(null);
  }, []);

  const recommendations = getRecommendations(stats, completed, wishlist);

  const promoteToUpcoming = (event) => {
    if (upcoming) {
      updateEvent(upcoming.id, { status: "wishlist", trainingPlan: null });
    }
    const plan = generateTrainingPlan(event);
    updateEvent(event.id, {
      status: "upcoming",
      trainingWeeks: Array(plan.totalWeeks).fill(null),
      trainingPlan: plan,
      phase: plan.phases[0].name,
      week: `Week 1 of ${plan.totalWeeks}`,
      progress: 0,
    });
  };

  // Count per category for the pills
  const categoryCounts = {};
  for (const e of wishlist) {
    const cat = e.category || "Custom";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  }

  // Filter by category, search, and sort
  const processedList = useMemo(() => {
    let list = activeCategory === "all"
      ? wishlist
      : wishlist.filter((e) => (e.category || "Custom") === activeCategory);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((e) =>
        e.name.toLowerCase().includes(q) ||
        (e.location && e.location.toLowerCase().includes(q)) ||
        (e.category && e.category.toLowerCase().includes(q))
      );
    }

    return sortEvents(list, sortKey);
  }, [wishlist, activeCategory, searchQuery, sortKey]);

  const groups = activeCategory === "all" && !searchQuery.trim() && sortKey === "default"
    ? groupByCategory(processedList)
    : null;

  // Category display order
  const categoryOrder = CATEGORIES.map((c) => c.key).filter((k) => k !== "all");
  categoryOrder.push("Custom");

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

  const renderCard = (event) => (
    <WishlistCard
      key={event.id}
      event={event}
      expanded={expandedId === event.id}
      onToggle={() => setExpandedId(expandedId === event.id ? null : event.id)}
      onPromote={() => promoteToUpcoming(event)}
      onEdit={() => onEditEvent(event.id)}
      onDelete={() => setDeleteTarget(event)}
      reorderMode={false}
    />
  );

  return (
    <div className="px-4 pb-24 sm:pb-8 pt-4 relative">
      <div className="mb-4">
        <h2 className="text-2xl font-black text-white mb-1">Bucket List</h2>
        <p className="text-gray-500 text-sm">
          {wishlist.length} challenge{wishlist.length !== 1 ? "s" : ""} on the horizon
        </p>
      </div>

      {/* Search & Sort bar */}
      <div className="flex gap-2 mb-3">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={reorderMode ? "" : searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={reorderMode ? "Reordering..." : "Search challenges..."}
            disabled={reorderMode}
            className={`w-full bg-gray-800/60 border border-gray-700/50 rounded-xl pl-8 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors ${
              reorderMode ? "opacity-50 cursor-not-allowed" : ""
            }`}
          />
        </div>
        <button
          onClick={toggleReorderMode}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
            reorderMode
              ? "bg-indigo-600 text-white"
              : "bg-gray-800/60 text-gray-400 border border-gray-700/50 hover:border-gray-600"
          }`}
        >
          <GripVertical size={14} />
          Reorder
        </button>
        {!reorderMode && (
          <div className="relative">
            <button
              onClick={() => setShowSort(!showSort)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                sortKey !== "default"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-800/60 text-gray-400 border border-gray-700/50 hover:border-gray-600"
              }`}
            >
              <ArrowUpDown size={14} />
              Sort
            </button>
            {showSort && (
              <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-xl z-50 min-w-[160px]">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => { setSortKey(opt.key); setShowSort(false); }}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                      sortKey === opt.key
                        ? "bg-indigo-600/20 text-indigo-300"
                        : "text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Category filter pills */}
      <div className={`flex gap-2 overflow-x-auto pb-3 mb-4 -mx-4 px-4 scrollbar-hide ${reorderMode ? "opacity-50 pointer-events-none" : ""}`}>
        {CATEGORIES.map((cat) => {
          const count = cat.key === "all" ? wishlist.length : (categoryCounts[cat.key] || 0);
          if (cat.key !== "all" && count === 0) return null;
          const active = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                active
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25"
                  : "bg-gray-800/60 text-gray-400 border border-gray-700/50 hover:border-gray-600"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              <span className={`text-[10px] ${active ? "text-indigo-200" : "text-gray-600"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Reorder mode: flat draggable list of all wishlist items */}
      {reorderMode && (
        <div className="space-y-2 mb-6">
          <div className="text-gray-500 text-xs mb-3">
            Drag to reorder your bucket list. Tap "Reorder" again when done.
          </div>
          {wishlist.map((event, index) => (
            <div
              key={event.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`transition-all ${draggedIndex === index ? "opacity-40" : "opacity-100"}`}
            >
              <WishlistCard
                event={event}
                expanded={false}
                onToggle={() => {}}
                onPromote={() => {}}
                onEdit={() => {}}
                onDelete={() => {}}
                reorderMode
                isOver={overIndex === index && draggedIndex !== index}
                dragHandleProps={{}}
              />
            </div>
          ))}
        </div>
      )}

      {/* Search results count */}
      {!reorderMode && searchQuery.trim() && (
        <div className="text-gray-500 text-xs mb-3">
          {processedList.length} result{processedList.length !== 1 ? "s" : ""} for "{searchQuery}"
        </div>
      )}

      {/* Grouped view (All selected, no search/sort active) */}
      {!reorderMode && groups && (
        <div className="space-y-6 mb-6">
          {categoryOrder.map((catKey) => {
            const items = groups[catKey];
            if (!items?.length) return null;
            const catDef = CATEGORIES.find((c) => c.key === catKey);
            return (
              <div key={catKey}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">{catDef?.icon || "📌"}</span>
                  <h3 className="text-white font-bold text-sm">{catDef?.label || catKey}</h3>
                  <span className="text-gray-600 text-xs">{items.length}</span>
                </div>
                <div className="space-y-3">
                  {items.map(renderCard)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Flat list view (filtered/sorted/searched) */}
      {!reorderMode && !groups && (
        <div className="space-y-3 mb-6">
          {processedList.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">🔍</div>
              <p className="text-gray-500 text-sm">No challenges match your search</p>
            </div>
          ) : (
            processedList.map(renderCard)
          )}
        </div>
      )}

      {/* Recommendations */}
      {!reorderMode && recommendations.length > 0 && activeCategory === "all" && !searchQuery.trim() && (
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
