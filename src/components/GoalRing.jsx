export default function GoalRing({ value, target, label, unit, color }) {
  const pct = target > 0 ? Math.min(value / target, 1) : 0;
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);

  return (
    <div className="flex flex-col items-center">
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle
          cx="44" cy="44" r={r}
          fill="none" stroke="#1f2937" strokeWidth="6"
        />
        <circle
          cx="44" cy="44" r={r}
          fill="none" stroke={color} strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 44 44)"
          className="transition-all duration-700"
        />
        <text
          x="44" y="40" textAnchor="middle"
          fill="white" fontSize="14" fontWeight="800"
        >
          {Math.round(pct * 100)}%
        </text>
        <text
          x="44" y="54" textAnchor="middle"
          fill="#9ca3af" fontSize="9"
        >
          {value}/{target}{unit}
        </text>
      </svg>
      <span className="text-[10px] text-gray-400 uppercase tracking-wider mt-1 font-medium">
        {label}
      </span>
    </div>
  );
}
