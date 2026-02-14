import { useState } from "react";
import { Plus, X, Check, Package } from "lucide-react";

const CATEGORIES = ["Clothing", "Footwear", "Navigation", "Food & Water", "Safety", "Other"];

const CATEGORY_ICONS = {
  Clothing: "👕",
  Footwear: "🥾",
  Navigation: "🧭",
  "Food & Water": "🥤",
  Safety: "🛡️",
  Other: "📦",
};

const TEMPLATES = {
  Mountain: [
    { name: "Waterproofs", category: "Clothing", checked: false },
    { name: "Warm layers", category: "Clothing", checked: false },
    { name: "Gaiters", category: "Footwear", checked: false },
    { name: "Trekking poles", category: "Other", checked: false },
    { name: "Map", category: "Navigation", checked: false },
    { name: "Compass", category: "Navigation", checked: false },
    { name: "Headtorch", category: "Navigation", checked: false },
    { name: "First aid kit", category: "Safety", checked: false },
    { name: "Whistle", category: "Safety", checked: false },
    { name: "Emergency shelter", category: "Safety", checked: false },
  ],
  Ultra: [
    { name: "Headtorch", category: "Navigation", checked: false },
    { name: "Spare batteries", category: "Navigation", checked: false },
    { name: "Blister kit", category: "Safety", checked: false },
    { name: "Emergency blanket", category: "Safety", checked: false },
    { name: "Energy gels", category: "Food & Water", checked: false },
    { name: "Electrolytes", category: "Food & Water", checked: false },
    { name: "Phone charger", category: "Other", checked: false },
    { name: "Change of socks", category: "Footwear", checked: false },
  ],
  Urban: [
    { name: "Phone", category: "Navigation", checked: false },
    { name: "Portable charger", category: "Other", checked: false },
    { name: "Snacks", category: "Food & Water", checked: false },
    { name: "Water bottle", category: "Food & Water", checked: false },
    { name: "Rain jacket", category: "Clothing", checked: false },
    { name: "Comfortable shoes", category: "Footwear", checked: false },
    { name: "Cash", category: "Other", checked: false },
  ],
};

export default function KitListEditor({ items = [], onChange, eventType = "Mountain" }) {
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("Other");

  const addItem = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const exists = items.some((i) => i.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) return;
    onChange([...items, { name: trimmed, category: newCategory, checked: false }]);
    setNewName("");
  };

  const removeItem = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const toggleItem = (index) => {
    onChange(items.map((item, i) => (i === index ? { ...item, checked: !item.checked } : item)));
  };

  const loadTemplate = () => {
    const template = TEMPLATES[eventType] || TEMPLATES.Mountain;
    const existingNames = new Set(items.map((i) => i.name.toLowerCase()));
    const newItems = template.filter((t) => !existingNames.has(t.name.toLowerCase()));
    onChange([...items, ...newItems]);
  };

  // Group items by category, preserving order of CATEGORIES
  const grouped = CATEGORIES.map((cat) => ({
    category: cat,
    items: items
      .map((item, index) => ({ ...item, _index: index }))
      .filter((item) => item.category === cat),
  })).filter((g) => g.items.length > 0);

  const checkedCount = items.filter((i) => i.checked).length;

  return (
    <div className="space-y-3">
      {/* Progress summary */}
      {items.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {checkedCount}/{items.length} packed
          </span>
          <div className="flex-1 mx-3 h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${items.length > 0 ? (checkedCount / items.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Grouped items */}
      {grouped.map(({ category, items: catItems }) => (
        <div key={category}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-sm">{CATEGORY_ICONS[category]}</span>
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
              {category}
            </span>
          </div>
          <div className="space-y-1">
            {catItems.map((item) => (
              <div
                key={item._index}
                className="flex items-center gap-2 group"
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item._index)}
                  className={`w-5 h-5 rounded-md border flex-shrink-0 flex items-center justify-center transition-all ${
                    item.checked
                      ? "bg-emerald-500 border-emerald-500"
                      : "border-gray-600 hover:border-gray-400"
                  }`}
                >
                  {item.checked && <Check size={12} className="text-white" />}
                </button>
                <span
                  className={`text-sm flex-1 transition-colors ${
                    item.checked ? "text-gray-500 line-through" : "text-gray-200"
                  }`}
                >
                  {item.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(item._index)}
                  className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all p-0.5"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Add item form */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addItem())}
          placeholder="Add item..."
          className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-indigo-500"
        />
        <select
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-xl px-2 py-2 text-sm text-gray-300 focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_ICONS[c]} {c}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={addItem}
          className="bg-gray-800 border border-gray-700 rounded-xl px-3 hover:border-gray-500 transition-colors"
        >
          <Plus size={16} className="text-gray-400" />
        </button>
      </div>

      {/* Load template */}
      <button
        type="button"
        onClick={loadTemplate}
        className="flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
      >
        <Package size={14} />
        Load {eventType} template
      </button>
    </div>
  );
}
