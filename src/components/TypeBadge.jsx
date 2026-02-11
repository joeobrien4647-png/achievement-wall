import { TYPE_COLORS } from "../data/schema";

export default function TypeBadge({ type }) {
  const color = TYPE_COLORS[type] || "#6b7280";
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: color + "20", color }}
    >
      {type}
    </span>
  );
}
