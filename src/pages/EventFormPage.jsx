import { useState } from "react";
import { ChevronLeft, X, Plus, Star, Camera, ChevronDown, Package, PoundSterling } from "lucide-react";
import { useEvents } from "../hooks/useEvents";
import { EVENT_TYPES, TYPE_COLORS, GRADIENT_PRESETS, createEvent } from "../data/schema";
import { compressImage } from "../lib/photos";
import GradientPicker from "../components/GradientPicker";
import EmojiPicker from "../components/EmojiPicker";
import GpxImport from "../components/GpxImport";
import KitListEditor from "../components/KitListEditor";
import { COST_CATEGORIES } from "../components/CostBreakdown";

function Field({ label, children }) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1.5 block">
        {label}
      </label>
      {children}
    </div>
  );
}

function DifficultyInput({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="p-1"
        >
          <Star
            size={24}
            className={`transition-colors ${
              n <= value ? "text-amber-400 fill-amber-400" : "text-gray-600"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function TagInput({ tags, onChange, placeholder }) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput("");
  };

  return (
    <div>
      <div className="flex gap-2 flex-wrap mb-2">
        {tags.map((tag, i) => (
          <span
            key={i}
            className="bg-indigo-500/10 text-indigo-300 text-xs font-medium px-2.5 py-1 rounded-lg border border-indigo-500/20 flex items-center gap-1.5"
          >
            {tag}
            <button type="button" onClick={() => onChange(tags.filter((_, j) => j !== i))}>
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
          placeholder={placeholder}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="button"
          onClick={addTag}
          className="bg-gray-800 border border-gray-700 rounded-xl px-3 hover:border-gray-500 transition-colors"
        >
          <Plus size={16} className="text-gray-400" />
        </button>
      </div>
    </div>
  );
}

function CollapsibleSection({ icon: Icon, title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-700/50 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2.5 px-3.5 py-3 bg-gray-800/40 hover:bg-gray-800/70 transition-colors"
      >
        {Icon && <Icon size={16} className="text-gray-400" />}
        <span className="text-sm font-bold text-white flex-1 text-left">{title}</span>
        <ChevronDown
          size={16}
          className={`text-gray-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="px-3.5 py-3 border-t border-gray-700/50">{children}</div>}
    </div>
  );
}

export default function EventFormPage({ eventId, onBack }) {
  const { getEventById, addEvent, updateEvent } = useEvents();
  const existing = eventId ? getEventById(eventId) : null;
  const isEdit = !!existing;

  const [form, setForm] = useState(() => {
    if (existing) return { ...existing };
    // Check for prefill (e.g. from wishlist recommendations)
    let prefill = {};
    try {
      const raw = sessionStorage.getItem("formPrefill");
      if (raw) prefill = JSON.parse(raw);
    } catch { /* ignore */ }
    return {
      ...createEvent(),
      name: "",
      type: "Mountain",
      status: "completed",
      distance: "",
      elevation: "",
      location: "",
      date: "",
      time: "",
      difficulty: 3,
      peaks: [],
      story: "",
      lessons: "",
      badge: "🏔️",
      heroImage: GRADIENT_PRESETS[0],
      completions: 1,
      // Upcoming fields
      phase: "",
      week: "",
      progress: 0,
      route: "",
      reasons: [],
      watchOuts: [],
      ...prefill,
    };
  });

  const [errors, setErrors] = useState([]);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name?.trim()) {
      setErrors(["Name is required"]);
      return;
    }

    const payload = {
      ...form,
      distance: form.distance ? Number(form.distance) : null,
      elevation: form.elevation ? Number(form.elevation) : null,
      date: form.date || null,
      time: form.time || null,
      completions: Math.max(1, Number(form.completions) || 1),
      color: TYPE_COLORS[form.type] || "#8b5cf6",
    };

    if (isEdit) {
      updateEvent(eventId, payload);
    } else {
      const result = addEvent(payload);
      if (!result.success) {
        setErrors(result.errors);
        return;
      }
    }
    onBack();
  };

  const inputClass =
    "w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors";

  return (
    <div className="pb-24 sm:pb-8">
      {/* Header */}
      <div
        className="h-32 flex items-center justify-center text-5xl relative"
        style={{ background: form.heroImage }}
      >
        <button
          onClick={onBack}
          className="absolute top-4 left-4 bg-black/40 backdrop-blur rounded-full p-2 text-white hover:bg-black/60"
        >
          <ChevronLeft size={18} />
        </button>
        <span>{form.badge}</span>
      </div>

      <div className="px-4 -mt-4 relative">
        <form onSubmit={handleSubmit} className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="p-5 space-y-5">
            <h2 className="text-xl font-black text-white">
              {isEdit ? "Edit Event" : "New Event"}
            </h2>

            {errors.length > 0 && (
              <div className="bg-red-900/30 border border-red-700/40 rounded-xl p-3">
                {errors.map((err, i) => (
                  <p key={i} className="text-red-300 text-sm">{err}</p>
                ))}
              </div>
            )}

            {/* Name */}
            <Field label="Event Name">
              <input
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Yorkshire 3 Peaks"
                className={inputClass}
                maxLength={80}
              />
            </Field>

            {/* Type */}
            <Field label="Type">
              <div className="flex gap-2">
                {EVENT_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set("type", t)}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                      form.type === t
                        ? "text-white border-2"
                        : "text-gray-400 bg-gray-800 border-2 border-gray-700 hover:border-gray-500"
                    }`}
                    style={
                      form.type === t
                        ? { backgroundColor: TYPE_COLORS[t] + "30", borderColor: TYPE_COLORS[t] }
                        : {}
                    }
                  >
                    {t}
                  </button>
                ))}
              </div>
            </Field>

            {/* Status */}
            <Field label="Status">
              <div className="flex gap-2">
                {["completed", "upcoming", "wishlist"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => set("status", s)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-all border-2 ${
                      form.status === s
                        ? "bg-indigo-500/20 border-indigo-500 text-white"
                        : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </Field>

            {/* Distance + Elevation */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Distance (km)">
                <input
                  type="number"
                  value={form.distance}
                  onChange={(e) => set("distance", e.target.value)}
                  placeholder="38"
                  className={inputClass}
                  min="0"
                  step="0.1"
                />
              </Field>
              <Field label="Elevation (m)">
                <input
                  type="number"
                  value={form.elevation}
                  onChange={(e) => set("elevation", e.target.value)}
                  placeholder="1585"
                  className={inputClass}
                  min="0"
                />
              </Field>
            </div>

            {/* GPX Import */}
            <Field label="Import GPX Route">
              <GpxImport
                onImport={({ distance, elevationGain }) => {
                  if (distance) set("distance", Math.round(distance * 10) / 10);
                  if (elevationGain) set("elevation", Math.round(elevationGain));
                }}
              />
            </Field>

            {/* Location */}
            <Field label="Location">
              <input
                type="text"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="Yorkshire Dales"
                className={inputClass}
              />
            </Field>

            {/* Date + Time */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date">
                <input
                  type="date"
                  value={form.date || ""}
                  onChange={(e) => set("date", e.target.value)}
                  className={inputClass}
                />
              </Field>
              {form.status === "completed" && (
                <Field label="Finish Time (HH:MM:SS)">
                  <input
                    type="text"
                    value={form.time || ""}
                    onChange={(e) => set("time", e.target.value)}
                    placeholder="12:34:56"
                    className={inputClass}
                  />
                </Field>
              )}
            </div>

            {/* Difficulty */}
            <Field label="Difficulty">
              <DifficultyInput value={form.difficulty} onChange={(v) => set("difficulty", v)} />
            </Field>

            {/* Completions */}
            {form.status === "completed" && (
              <Field label="Completions">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => set("completions", Math.max(1, (form.completions || 1) - 1))}
                    className="w-10 h-10 rounded-xl bg-gray-800 border border-gray-700 text-white font-bold text-lg hover:border-gray-500"
                  >
                    −
                  </button>
                  <span className="text-white font-bold text-xl w-8 text-center">
                    {form.completions || 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => set("completions", (form.completions || 1) + 1)}
                    className="w-10 h-10 rounded-xl bg-gray-800 border border-gray-700 text-white font-bold text-lg hover:border-gray-500"
                  >
                    +
                  </button>
                </div>
              </Field>
            )}

            {/* Peaks */}
            <Field label="Peaks Summited">
              <TagInput
                tags={form.peaks || []}
                onChange={(v) => set("peaks", v)}
                placeholder="Pen-y-ghent (694m)"
              />
            </Field>

            {/* Story */}
            <Field label="The Story">
              <textarea
                value={form.story}
                onChange={(e) => set("story", e.target.value)}
                placeholder="Tell the story of this event..."
                className={`${inputClass} min-h-[100px] resize-y`}
              />
            </Field>

            {/* Lessons */}
            <Field label="Lessons Learned">
              <textarea
                value={form.lessons}
                onChange={(e) => set("lessons", e.target.value)}
                placeholder="What did you learn?"
                className={`${inputClass} min-h-[80px] resize-y`}
              />
            </Field>

            {/* Photos */}
            <Field label={`Photos${(form.photos?.length || 0) > 0 ? ` (${form.photos.length}/5)` : ""}`}>
              <div className="grid grid-cols-3 gap-2">
                {(form.photos || []).map((src, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden relative group">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => set("photos", form.photos.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 bg-black/60 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity text-white"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {(form.photos?.length || 0) < 5 && (
                  <label className="aspect-square bg-gray-800 rounded-xl border-2 border-dashed border-gray-700 flex items-center justify-center cursor-pointer hover:border-gray-500 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const dataUrl = await compressImage(file);
                          set("photos", [...(form.photos || []), dataUrl]);
                        } catch { /* ignore */ }
                        e.target.value = "";
                      }}
                    />
                    <div className="text-center">
                      <Camera size={18} className="text-gray-600 mx-auto" />
                      <span className="text-[10px] text-gray-600 mt-1 block">Add</span>
                    </div>
                  </label>
                )}
              </div>
            </Field>

            {/* Kit List */}
            <CollapsibleSection icon={Package} title={`Kit List${(form.kitList?.length || 0) > 0 ? ` (${form.kitList.length})` : ""}`}>
              <KitListEditor
                items={form.kitList || []}
                onChange={(v) => set("kitList", v)}
                eventType={form.type}
              />
            </CollapsibleSection>

            {/* Costs */}
            <CollapsibleSection icon={PoundSterling} title="Costs">
              <div className="grid grid-cols-2 gap-3">
                {COST_CATEGORIES.map((cat) => (
                  <Field key={cat.key} label={cat.label}>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">£</span>
                      <input
                        type="number"
                        value={form.costs?.[cat.key] || ""}
                        onChange={(e) =>
                          set("costs", {
                            ...(form.costs || {}),
                            [cat.key]: e.target.value === "" ? 0 : Number(e.target.value),
                          })
                        }
                        placeholder="0"
                        className={inputClass + " pl-7"}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </Field>
                ))}
              </div>
              {(() => {
                const total = Object.values(form.costs || {}).reduce(
                  (sum, v) => sum + (Number(v) || 0),
                  0
                );
                return total > 0 ? (
                  <div className="mt-3 flex items-center justify-between pt-3 border-t border-gray-700/50">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total</span>
                    <span className="text-white font-black text-lg">£{total.toLocaleString()}</span>
                  </div>
                ) : null;
              })()}
            </CollapsibleSection>

            {/* Upcoming-specific fields */}
            {form.status === "upcoming" && (
              <>
                <Field label="Route Description">
                  <textarea
                    value={form.route || ""}
                    onChange={(e) => set("route", e.target.value)}
                    placeholder="Describe the route..."
                    className={`${inputClass} min-h-[80px] resize-y`}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Training Phase">
                    <input
                      type="text"
                      value={form.phase || ""}
                      onChange={(e) => set("phase", e.target.value)}
                      placeholder="Build Phase"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Current Week">
                    <input
                      type="text"
                      value={form.week || ""}
                      onChange={(e) => set("week", e.target.value)}
                      placeholder="Week 1 of 12"
                      className={inputClass}
                    />
                  </Field>
                </div>
                <Field label={`Training Progress (${form.progress || 0}%)`}>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={form.progress || 0}
                    onChange={(e) => set("progress", Number(e.target.value))}
                    className="w-full accent-red-500"
                  />
                </Field>
                <Field label="Why You'll Finish">
                  <TagInput
                    tags={form.reasons || []}
                    onChange={(v) => set("reasons", v)}
                    placeholder="Add a reason..."
                  />
                </Field>
                <Field label="Watch-Outs">
                  <TagInput
                    tags={form.watchOuts || []}
                    onChange={(v) => set("watchOuts", v)}
                    placeholder="Add a watch-out..."
                  />
                </Field>
              </>
            )}

            {/* Wishlist-specific fields */}
            {form.status === "wishlist" && (
              <>
                <Field label="Why does this appeal to you?">
                  <textarea
                    value={form.appeal || ""}
                    onChange={(e) => set("appeal", e.target.value)}
                    placeholder="What draws you to this challenge..."
                    className={`${inputClass} min-h-[80px] resize-y`}
                  />
                </Field>
                <Field label="Target Year">
                  <input
                    type="number"
                    value={form.targetYear || ""}
                    onChange={(e) => set("targetYear", e.target.value ? Number(e.target.value) : null)}
                    placeholder={`${new Date().getFullYear() + 1}`}
                    className={inputClass}
                    min="2024"
                    max="2040"
                  />
                </Field>
              </>
            )}

            {/* Badge */}
            <Field label="Badge">
              <EmojiPicker value={form.badge} onChange={(v) => set("badge", v)} />
            </Field>

            {/* Gradient */}
            <Field label="Banner Gradient">
              <GradientPicker value={form.heroImage} onChange={(v) => set("heroImage", v)} />
            </Field>
          </div>

          {/* Submit */}
          <div className="border-t border-gray-800 p-5">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-500 transition-colors active:scale-[0.98]"
            >
              {isEdit ? "Save Changes" : "Add Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
