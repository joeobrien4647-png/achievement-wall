import { ACCENT_PRESETS } from "../lib/themes";
import { Palette } from "lucide-react";

export default function AccentColorPicker({ value, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Palette size={18} className="text-indigo-400" style={{ color: value }} />
        <div>
          <div className="text-white text-sm font-medium">Accent Color</div>
          <div className="text-gray-500 text-xs">Theme color throughout the app</div>
        </div>
      </div>
      <div className="flex gap-1.5">
        {ACCENT_PRESETS.map((preset) => (
          <button
            key={preset.hex}
            onClick={() => onChange(preset.hex)}
            className={`w-6 h-6 rounded-full transition-all ${
              value === preset.hex ? "ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110" : "hover:scale-110"
            }`}
            style={{ backgroundColor: preset.hex }}
            title={preset.name}
          />
        ))}
      </div>
    </div>
  );
}
