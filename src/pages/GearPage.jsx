import { useState } from "react";
import { Plus, X, AlertTriangle, CheckCircle, Footprints, Package, ChevronLeft } from "lucide-react";
import { useData } from "../context/DataContext";

const GEAR_TYPES = [
  { type: "shoes", label: "Shoes", icon: "\u{1F45F}", maxKm: 800 },
  { type: "pack", label: "Pack", icon: "\u{1F392}", maxKm: 3000 },
  { type: "jacket", label: "Jacket", icon: "\u{1F9E5}", maxKm: 5000 },
  { type: "poles", label: "Poles", icon: "\u{1F962}", maxKm: 2000 },
  { type: "other", label: "Other", icon: "\u2699\uFE0F", maxKm: 1000 },
];

export default function GearPage() {
  const { state, dispatch } = useData();
  const gear = state.preferences?.gear ?? [];
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", type: "shoes", currentKm: 0, maxKm: 800 });

  const setGear = (newGear) => dispatch({ type: "UPDATE_PREFERENCES", payload: { gear: newGear } });

  const addItem = () => {
    if (!form.name.trim()) return;
    const newItem = {
      id: Date.now().toString(36),
      name: form.name.trim(),
      type: form.type,
      currentKm: Number(form.currentKm) || 0,
      maxKm: Number(form.maxKm) || 800,
      retired: false,
      addedAt: new Date().toISOString(),
    };
    setGear([...gear, newItem]);
    setForm({ name: "", type: "shoes", currentKm: 0, maxKm: 800 });
    setAdding(false);
  };

  const updateKm = (id, km) => {
    setGear(gear.map((g) => g.id === id ? { ...g, currentKm: Math.max(0, Number(km) || 0) } : g));
  };

  const toggleRetire = (id) => {
    setGear(gear.map((g) => g.id === id ? { ...g, retired: !g.retired } : g));
  };

  const removeItem = (id) => {
    setGear(gear.filter((g) => g.id !== id));
  };

  const active = gear.filter((g) => !g.retired);
  const retired = gear.filter((g) => g.retired);

  return (
    <div className="px-4 pb-24 sm:pb-8 pt-4 space-y-5">
      <div>
        <h2 className="text-2xl font-black text-white mb-1">Gear Tracker</h2>
        <p className="text-gray-500 text-sm">Track wear on your kit — retire before it fails you</p>
      </div>

      {/* Active Gear */}
      <div className="space-y-3">
        {active.map((item) => {
          const pct = Math.min(100, (item.currentKm / item.maxKm) * 100);
          const isWarn = pct >= 75;
          const isDanger = pct >= 90;
          const typeInfo = GEAR_TYPES.find((t) => t.type === item.type) || GEAR_TYPES[4];

          return (
            <div key={item.id} className="bg-gray-800/60 rounded-2xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{typeInfo.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-bold text-sm truncate">{item.name}</div>
                  <div className="text-gray-500 text-xs capitalize">{typeInfo.label}</div>
                </div>
                {isDanger && (
                  <div className="flex items-center gap-1 text-red-400 text-xs font-bold">
                    <AlertTriangle size={14} /> Replace soon
                  </div>
                )}
                {isWarn && !isDanger && (
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                    <AlertTriangle size={14} /> Getting worn
                  </div>
                )}
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-gray-900/60 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: isDanger ? "#ef4444" : isWarn ? "#f59e0b" : "#10b981",
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={item.currentKm}
                    onChange={(e) => updateKm(item.id, e.target.value)}
                    className="w-20 bg-gray-900 border border-gray-700 rounded-lg px-2 py-1 text-white text-sm text-center focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-gray-500 text-xs">/ {item.maxKm}km</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleRetire(item.id)}
                    className="text-xs text-gray-500 hover:text-amber-400 transition-colors"
                  >
                    Retire
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-gray-600 hover:text-red-400 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add form */}
      {adding ? (
        <div className="bg-gray-800/60 rounded-2xl p-4 border border-gray-700/50 space-y-3">
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Item name (e.g. Salomon Speedcross 6)"
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-indigo-500"
          />
          <div className="flex gap-2 flex-wrap">
            {GEAR_TYPES.map((t) => (
              <button
                key={t.type}
                onClick={() => setForm({ ...form, type: t.type, maxKm: t.maxKm })}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  form.type === t.type
                    ? "bg-indigo-500/20 border-indigo-500 text-white border"
                    : "bg-gray-900 border border-gray-700 text-gray-400 hover:border-gray-500"
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1 block">Current km</label>
              <input type="number" value={form.currentKm} onChange={(e) => setForm({ ...form, currentKm: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1 block">Max lifespan (km)</label>
              <input type="number" value={form.maxKm} onChange={(e) => setForm({ ...form, maxKm: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setAdding(false)} className="flex-1 py-2 rounded-xl bg-gray-800 text-gray-300 text-sm font-medium">Cancel</button>
            <button onClick={addItem} className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500">Add Gear</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-700/50 text-gray-500 hover:text-gray-300 hover:border-gray-500 transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Add Gear Item
        </button>
      )}

      {/* Retired gear */}
      {retired.length > 0 && (
        <div>
          <h3 className="text-gray-500 font-bold text-sm mb-3">Retired</h3>
          <div className="space-y-2">
            {retired.map((item) => {
              const typeInfo = GEAR_TYPES.find((t) => t.type === item.type) || GEAR_TYPES[4];
              return (
                <div key={item.id} className="bg-gray-800/30 rounded-xl p-3 border border-gray-800 flex items-center gap-3 opacity-60">
                  <span className="text-lg">{typeInfo.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-400 font-medium text-sm truncate line-through">{item.name}</div>
                    <div className="text-gray-600 text-xs">{item.currentKm}km logged</div>
                  </div>
                  <button onClick={() => toggleRetire(item.id)} className="text-xs text-gray-600 hover:text-emerald-400">Reactivate</button>
                  <button onClick={() => removeItem(item.id)} className="text-gray-700 hover:text-red-400"><X size={14} /></button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
