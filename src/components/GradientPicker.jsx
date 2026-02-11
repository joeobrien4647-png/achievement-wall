import { GRADIENT_PRESETS } from "../data/schema";

export default function GradientPicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {GRADIENT_PRESETS.map((gradient) => (
        <button
          key={gradient}
          type="button"
          onClick={() => onChange(gradient)}
          className={`h-12 rounded-xl border-2 transition-all ${
            value === gradient
              ? "border-white scale-105 shadow-lg"
              : "border-gray-700 hover:border-gray-500"
          }`}
          style={{ background: gradient }}
        />
      ))}
    </div>
  );
}
