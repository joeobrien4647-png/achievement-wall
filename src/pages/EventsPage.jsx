import { useState, useMemo } from "react";
import {
  MapPin, Route, TrendingUp, Star, Camera, Calendar, Clock,
  ChevronDown, Plus, Pencil, Trash2, LayoutList, GitBranch, Search, X, Share2
} from "lucide-react";
import { useEvents } from "../hooks/useEvents";
import { useStats } from "../hooks/useStats";
import { TYPE_COLORS, EVENT_TYPES } from "../data/schema";
import DifficultyStars from "../components/DifficultyStars";
import TypeBadge from "../components/TypeBadge";
import ConfirmDialog from "../components/ConfirmDialog";
import PhotoGallery from "../components/PhotoGallery";
import EventCompare from "../components/EventCompare";
import EventShareCard from "../components/EventShareCard";
import ElevationProfile from "../components/ElevationProfile";
import { compressImage } from "../lib/photos";
import { parseTime, formatDuration, calcPace, formatPace } from "../lib/pace";
import { relativeDate } from "../lib/relativeDate";
import { useToast } from "../context/ToastContext";
import { useUndoDelete } from "../hooks/useUndoDelete";

function EventDetail({ event, onBack, onEdit, onDelete, onUpdatePhotos, onUpdate }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const [kitInput, setKitInput] = useState("");
  const photos = event.photos || [];
  const kitList = event.kitList || [];
  const maxPhotos = 6;

  return (
    <div className="pb-24 sm:pb-8">
      <div
        className="h-48 flex items-center justify-center text-6xl relative"
        style={{ background: event.heroImage }}
      >
        <button
          onClick={onBack}
          className="absolute top-4 left-4 bg-black/40 backdrop-blur rounded-full p-2 text-white hover:bg-black/60 transition-colors"
        >
          <ChevronDown size={18} className="rotate-90" />
        </button>
        <span>{event.badge}</span>
        {event.completions > 1 && (
          <span className="absolute top-4 right-4 bg-indigo-500 text-white text-sm font-bold px-2.5 py-1 rounded-full">
            ×{event.completions}
          </span>
        )}
      </div>

      <div className="px-5 -mt-6 relative">
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: TYPE_COLORS[event.type] }}
                >
                  {event.type}
                </span>
                <h2 className="text-2xl font-black text-white mt-1">{event.name}</h2>
                <div className="flex items-center gap-1.5 text-gray-400 text-sm mt-1">
                  <MapPin size={13} /> {event.location}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => setShowShareCard(true)}
                  className="bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-gray-400 hover:text-indigo-400 hover:border-indigo-500 transition-colors"
                >
                  <Share2 size={16} />
                </button>
                <button
                  onClick={() => onEdit(event.id)}
                  className="bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => setShowConfirm(true)}
                  className="bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-gray-400 hover:text-red-400 hover:border-red-700 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-5">
              {event.distance && (
                <div className="bg-gray-800 rounded-xl p-3 text-center">
                  <Route size={16} className="text-emerald-400 mx-auto mb-1" />
                  <div className="text-white font-bold">{event.distance}km</div>
                  <div className="text-[10px] text-gray-500 uppercase">Distance</div>
                </div>
              )}
              {event.elevation && (
                <div className="bg-gray-800 rounded-xl p-3 text-center">
                  <TrendingUp size={16} className="text-orange-400 mx-auto mb-1" />
                  <div className="text-white font-bold">{event.elevation.toLocaleString()}m</div>
                  <div className="text-[10px] text-gray-500 uppercase">Elevation</div>
                </div>
              )}
              <div className="bg-gray-800 rounded-xl p-3 text-center">
                <Star size={16} className="text-amber-400 mx-auto mb-1" />
                <div className="text-white font-bold">{event.difficulty}/5</div>
                <div className="text-[10px] text-gray-500 uppercase">Difficulty</div>
              </div>
            </div>

            {/* Finish time & pace */}
            {parseTime(event.time) && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="bg-gray-800 rounded-xl p-3 text-center">
                  <Clock size={16} className="text-cyan-400 mx-auto mb-1" />
                  <div className="text-white font-bold">{formatDuration(parseTime(event.time))}</div>
                  <div className="text-[10px] text-gray-500 uppercase">Finish Time</div>
                </div>
                {calcPace(event.time, event.distance) && (
                  <div className="bg-gray-800 rounded-xl p-3 text-center">
                    <Clock size={16} className="text-indigo-400 mx-auto mb-1" />
                    <div className="text-white font-bold">{formatPace(calcPace(event.time, event.distance))}</div>
                    <div className="text-[10px] text-gray-500 uppercase">Pace</div>
                  </div>
                )}
              </div>
            )}

            {!event.date && !event.time && (
              <div className="flex gap-2 mt-4 flex-wrap">
                {[
                  { icon: Calendar, text: "Add date" },
                  { icon: Clock, text: "Add finish time" },
                  { icon: Camera, text: "Add photos" },
                ].map((p, i) => (
                  <button
                    key={i}
                    onClick={() => onEdit(event.id)}
                    className="text-xs bg-gray-800 text-gray-400 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-gray-700 border-dashed hover:border-gray-500 transition-colors"
                  >
                    <p.icon size={12} /> {p.text}
                  </button>
                ))}
              </div>
            )}
          </div>

          {event.peaks?.length > 0 && (
            <div className="px-5 pb-4">
              <div className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold mb-2">
                Peaks Summited
              </div>
              <div className="flex gap-2 flex-wrap">
                {event.peaks.map((p, i) => (
                  <span
                    key={i}
                    className="bg-indigo-500/10 text-indigo-300 text-xs font-medium px-2.5 py-1 rounded-lg border border-indigo-500/20"
                  >
                    ⛰️ {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {event.story && (
            <div className="border-t border-gray-800 p-5">
              <div className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold mb-2">
                The Story
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{event.story}</p>
            </div>
          )}

          {event.lessons && (
            <div className="border-t border-gray-800 p-5">
              <div className="text-[10px] uppercase tracking-widest text-amber-400 font-bold mb-2">
                Lessons Learned
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{event.lessons}</p>
            </div>
          )}

          {/* Kit Checklist */}
          <div className="border-t border-gray-800 p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold">
                Kit List {kitList.length > 0 && `(${kitList.filter((k) => k.checked).length}/${kitList.length})`}
              </div>
            </div>
            {kitList.length > 0 && (
              <div className="space-y-1.5 mb-3">
                {kitList.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const updated = kitList.map((k, j) => j === i ? { ...k, checked: !k.checked } : k);
                      onUpdate({ kitList: updated });
                    }}
                    className="w-full flex items-center gap-2.5 text-left group"
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      item.checked ? "bg-cyan-500/20 border-cyan-500" : "border-gray-600 group-hover:border-gray-400"
                    }`}>
                      {item.checked && <span className="text-cyan-400 text-xs">✓</span>}
                    </div>
                    <span className={`text-sm ${item.checked ? "text-gray-500 line-through" : "text-gray-300"}`}>
                      {item.item}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdate({ kitList: kitList.filter((_, j) => j !== i) });
                      }}
                      className="ml-auto text-gray-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={kitInput}
                onChange={(e) => setKitInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && kitInput.trim()) {
                    onUpdate({ kitList: [...kitList, { item: kitInput.trim(), checked: false }] });
                    setKitInput("");
                  }
                }}
                placeholder="Add kit item..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={() => {
                  if (kitInput.trim()) {
                    onUpdate({ kitList: [...kitList, { item: kitInput.trim(), checked: false }] });
                    setKitInput("");
                  }
                }}
                className="bg-gray-800 border border-gray-700 rounded-lg px-2.5 hover:border-gray-500 transition-colors"
              >
                <Plus size={14} className="text-gray-400" />
              </button>
            </div>
          </div>

          {/* Nutrition Plan */}
          <div className="border-t border-gray-800 p-5">
            <div className="text-[10px] uppercase tracking-widest text-rose-400 font-bold mb-2">
              Nutrition Plan
            </div>
            <textarea
              value={event.nutritionPlan || ""}
              onChange={(e) => onUpdate({ nutritionPlan: e.target.value })}
              placeholder={event.status === "completed" ? "What worked? What didn't?" : "Plan your race-day nutrition..."}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-rose-500 resize-y min-h-[60px]"
              rows={2}
            />
          </div>

          {/* Photos */}
          <div className="border-t border-gray-800 p-5">
            <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-3">
              Photos {photos.length > 0 && `(${photos.length}/${maxPhotos})`}
            </div>

            {photos.length > 0 && (
              <div className="mb-3">
                <PhotoGallery photos={photos} />
              </div>
            )}

            <div className="flex gap-2 flex-wrap">
              {photos.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onUpdatePhotos(photos.filter((__, j) => j !== i))}
                  className="text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-1"
                >
                  <X size={10} /> Photo {i + 1}
                </button>
              ))}
            </div>

            {photos.length < maxPhotos && (
              <label className="mt-2 inline-flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 cursor-pointer hover:border-gray-500 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const dataUrl = await compressImage(file);
                      onUpdatePhotos([...photos, dataUrl]);
                    } catch { /* ignore */ }
                    e.target.value = "";
                  }}
                />
                <Camera size={16} className="text-gray-500" />
                <span className="text-xs text-gray-400 font-medium">Add photo</span>
              </label>
            )}
          </div>

          {/* Elevation Profile */}
          {(event.distance || event.elevation) && (
            <div className="border-t border-gray-800 p-5">
              <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-3">
                Elevation Profile
              </div>
              <ElevationProfile
                distance={event.distance}
                elevation={event.elevation}
                type={event.type}
              />
            </div>
          )}
        </div>
      </div>

      {showConfirm && (
        <ConfirmDialog
          title={`Delete ${event.name}?`}
          message="This cannot be undone. All data for this event will be permanently removed."
          onConfirm={() => {
            onDelete(event.id);
            onBack();
          }}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {showShareCard && (
        <EventShareCard event={event} onClose={() => setShowShareCard(false)} />
      )}
    </div>
  );
}

function TimelineView({ events, upcoming, onSelect }) {
  // Sort: dated events by date, undated cluster at start
  const dated = events.filter((e) => e.date).sort((a, b) => a.date.localeCompare(b.date));
  const undated = events.filter((e) => !e.date);
  const sorted = [...undated, ...dated];

  return (
    <div className="relative pl-8">
      {/* Vertical line */}
      <div className="absolute left-[15px] top-2 bottom-0 w-0.5 bg-gray-800" />

      {sorted.map((event, i) => (
        <button
          key={event.id}
          onClick={() => onSelect(event.id)}
          className="relative mb-4 w-full text-left group"
        >
          {/* Dot */}
          <div
            className="absolute left-[-25px] top-3 w-3.5 h-3.5 rounded-full border-2 border-gray-900 z-10"
            style={{ backgroundColor: event.color || "#6366f1" }}
          />

          {/* Card */}
          <div className="bg-gray-800/60 rounded-xl p-3 border border-gray-700/50 group-hover:border-gray-600 transition-all active:scale-[0.98]">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: event.heroImage }}
              >
                {event.badge}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-bold text-sm truncate">{event.name}</div>
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                  <span style={{ color: TYPE_COLORS[event.type] }}>{event.type}</span>
                  {event.distance && <span>{event.distance}km</span>}
                  {event.elevation && <span>↑{event.elevation}m</span>}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-gray-500 text-[10px]">
                  {event.date ? relativeDate(event.date) : "Date TBC"}
                </div>
              </div>
            </div>
          </div>
        </button>
      ))}

      {/* Upcoming event at the bottom */}
      {upcoming && (
        <div className="relative mb-4">
          {/* Pulsing dot */}
          <div className="absolute left-[-25px] top-3 w-3.5 h-3.5 rounded-full border-2 border-gray-900 bg-red-500 z-10 animate-pulse" />

          <div className="bg-red-900/20 rounded-xl p-3 border border-red-700/30 border-dashed">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: upcoming.heroImage || "linear-gradient(135deg, #dc2626, #ea580c)" }}
              >
                {upcoming.badge || "🎯"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-widest text-red-400 font-bold">
                  Next Target
                </div>
                <div className="text-white font-bold text-sm truncate">{upcoming.name}</div>
                <div className="text-gray-400 text-xs mt-0.5">
                  {upcoming.distance}km · {upcoming.date}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const SORT_OPTIONS = [
  { key: "newest", label: "Newest" },
  { key: "oldest", label: "Oldest" },
  { key: "dist-desc", label: "Distance ↓" },
  { key: "dist-asc", label: "Distance ↑" },
  { key: "diff-desc", label: "Difficulty ↓" },
];

export default function EventsPage({ onAddEvent, onEditEvent }) {
  const [selectedId, setSelectedId] = useState(null);
  const [view, setView] = useState("cards");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [sort, setSort] = useState("newest");
  const [compareIds, setCompareIds] = useState([]);
  const { completed, upcoming, deleteEvent, updateEvent } = useEvents();
  const { totalEvents, totalDistance } = useStats();
  const toast = useToast();
  const softDelete = useUndoDelete(deleteEvent, toast.show);

  const filtered = useMemo(() => {
    let list = completed;

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((e) =>
        e.name.toLowerCase().includes(q) ||
        (e.location && e.location.toLowerCase().includes(q)) ||
        (e.peaks && e.peaks.some((p) => p.toLowerCase().includes(q)))
      );
    }

    // Type filter
    if (typeFilter !== "All") {
      list = list.filter((e) => e.type === typeFilter);
    }

    // Sort
    list = [...list];
    switch (sort) {
      case "newest": list.reverse(); break;
      case "oldest": break;
      case "dist-desc": list.sort((a, b) => (b.distance || 0) - (a.distance || 0)); break;
      case "dist-asc": list.sort((a, b) => (a.distance || 0) - (b.distance || 0)); break;
      case "diff-desc": list.sort((a, b) => (b.difficulty || 0) - (a.difficulty || 0)); break;
    }

    return list;
  }, [completed, search, typeFilter, sort]);

  const hasFilters = search.trim() || typeFilter !== "All";
  const selected = selectedId ? completed.find((e) => e.id === selectedId) : null;

  if (selected) {
    return (
      <EventDetail
        event={selected}
        onBack={() => setSelectedId(null)}
        onEdit={onEditEvent}
        onDelete={(id) => {
          const evt = completed.find((e) => e.id === id);
          softDelete(id, evt?.name || "Event");
          setSelectedId(null);
        }}
        onUpdatePhotos={(photos) => updateEvent(selected.id, { photos })}
        onUpdate={(updates) => updateEvent(selected.id, updates)}
      />
    );
  }

  return (
    <div className="px-4 pb-24 sm:pb-8 pt-4 relative">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-2xl font-black text-white mb-1">All Challenges</h2>
          <p className="text-gray-500 text-sm">
            {hasFilters ? `${filtered.length} of ${totalEvents}` : totalEvents} events · {totalDistance}km total
          </p>
        </div>
        {/* View toggle */}
        <div className="flex bg-gray-800 rounded-lg border border-gray-700 p-0.5">
          <button
            onClick={() => setView("cards")}
            className={`p-2 rounded-md transition-colors ${view === "cards" ? "bg-gray-700 text-white" : "text-gray-500 hover:text-gray-300"}`}
          >
            <LayoutList size={16} />
          </button>
          <button
            onClick={() => setView("timeline")}
            className={`p-2 rounded-md transition-colors ${view === "timeline" ? "bg-gray-700 text-white" : "text-gray-500 hover:text-gray-300"}`}
          >
            <GitBranch size={16} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search events, locations, peaks..."
          className="w-full bg-gray-800/60 border border-gray-700/50 rounded-xl pl-9 pr-9 py-2.5 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Type pills + Sort */}
      <div className="flex items-center justify-between mb-4 gap-2">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {["All", ...EVENT_TYPES].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                typeFilter === t
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-white border border-gray-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-300 px-2 py-1.5 focus:outline-none flex-shrink-0"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.key} value={o.key}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Clear filters + Compare toggle */}
      <div className="flex items-center justify-between mb-3">
        {hasFilters ? (
          <button
            onClick={() => { setSearch(""); setTypeFilter("All"); }}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <X size={12} /> Clear filters
          </button>
        ) : <span />}
        {completed.length >= 2 && (
          <button
            onClick={() => setCompareIds(compareIds.length > 0 ? [] : ["selecting"])}
            className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
              compareIds.length > 0
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {compareIds.length > 0 ? "Cancel Compare" : "Compare"}
          </button>
        )}
      </div>

      {/* Compare instructions */}
      {compareIds.includes("selecting") && (
        <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl px-4 py-2.5 mb-3 text-center">
          <p className="text-amber-300 text-xs font-medium">Tap two events to compare them</p>
        </div>
      )}

      {view === "timeline" ? (
        <TimelineView
          events={filtered}
          upcoming={upcoming}
          onSelect={setSelectedId}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((event) => {
            const isCompareSelected = compareIds.includes(event.id);
            return (
            <button
              key={event.id}
              onClick={() => {
                if (compareIds.length > 0 && compareIds[0] === "selecting") {
                  setCompareIds([event.id]);
                } else if (compareIds.length === 1 && compareIds[0] !== event.id) {
                  setCompareIds([compareIds[0], event.id]);
                } else {
                  setSelectedId(event.id);
                }
              }}
              className={`w-full text-left bg-gray-800/60 rounded-2xl overflow-hidden border transition-all active:scale-[0.98] ${
                isCompareSelected ? "border-amber-500/60 ring-1 ring-amber-500/30" : "border-gray-700/50 hover:border-gray-600"
              }`}
            >
              <div className="flex">
                <div
                  className="w-24 h-28 flex items-center justify-center text-3xl flex-shrink-0"
                  style={{ background: event.heroImage }}
                >
                  {event.badge}
                </div>
                <div className="p-3.5 flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-white font-bold text-base truncate">{event.name}</div>
                      <div className="flex items-center gap-1 text-gray-400 text-xs mt-0.5">
                        <MapPin size={11} /> {event.location}
                      </div>
                    </div>
                    {event.completions > 1 && (
                      <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0">
                        ×{event.completions}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2.5">
                    <TypeBadge type={event.type} />
                    {event.distance && (
                      <span className="text-gray-400 text-xs">{event.distance}km</span>
                    )}
                    {event.elevation && (
                      <span className="text-gray-400 text-xs">↑{event.elevation}m</span>
                    )}
                    {event.photos?.length > 0 && (
                      <span className="text-gray-500 text-xs flex items-center gap-1">
                        <Camera size={11} /> {event.photos.length}
                      </span>
                    )}
                    <div className="ml-auto">
                      <DifficultyStars rating={event.difficulty} />
                    </div>
                  </div>
                </div>
              </div>
            </button>
            );
          })}
        </div>
      )}

      {/* Floating Add Button */}
      <button
        onClick={onAddEvent}
        className="fixed bottom-20 sm:bottom-6 right-4 sm:right-auto sm:left-1/2 sm:translate-x-[calc(min(50vw,320px)-2rem)] z-40 w-14 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg shadow-indigo-600/30 flex items-center justify-center transition-all active:scale-90"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      {/* Compare Overlay */}
      {compareIds.length === 2 && (() => {
        const a = completed.find((e) => e.id === compareIds[0]);
        const b = completed.find((e) => e.id === compareIds[1]);
        return a && b ? (
          <EventCompare eventA={a} eventB={b} onClose={() => setCompareIds([])} />
        ) : null;
      })()}
    </div>
  );
}
