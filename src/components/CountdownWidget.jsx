import { useState, useEffect } from "react";
import { Clock, Target, CheckCircle } from "lucide-react";

export default function CountdownWidget({ event }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000); // update every minute
    return () => clearInterval(id);
  }, []);

  if (!event?.date) return null;

  const target = new Date(event.date + "T09:00:00").getTime(); // assume 9am start
  const diff = target - now;

  if (diff <= 0) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <CheckCircle size={20} className="text-emerald-400" />
          <div>
            <div className="text-emerald-400 font-bold text-sm">Race Day!</div>
            <div className="text-gray-400 text-xs">{event.name} — Go crush it!</div>
          </div>
        </div>
      </div>
    );
  }

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);

  // Urgency color
  const urgencyColor = days <= 7 ? "text-red-400" : days <= 30 ? "text-orange-400" : "text-indigo-400";
  const urgencyBg = days <= 7 ? "from-red-900/30 to-red-900/10" : days <= 30 ? "from-orange-900/30 to-orange-900/10" : "from-indigo-900/30 to-indigo-900/10";
  const urgencyBorder = days <= 7 ? "border-red-700/30" : days <= 30 ? "border-orange-700/30" : "border-indigo-700/30";

  // Training checklist
  const checklist = [];
  if (days > 60) checklist.push({ label: "Base training", done: true });
  if (days > 30) checklist.push({ label: "Build phase", done: days <= 60 });
  if (days > 14) checklist.push({ label: "Peak week", done: days <= 30 });
  if (days > 7) checklist.push({ label: "Taper", done: days <= 14 });
  checklist.push({ label: "Kit check", done: days <= 3 });
  checklist.push({ label: "Race day", done: false });

  return (
    <div className={`bg-gradient-to-r ${urgencyBg} border ${urgencyBorder} rounded-2xl p-4`}>
      <div className="flex items-start gap-3">
        <Target size={20} className={urgencyColor} />
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">
            Countdown to
          </div>
          <div className="text-white font-bold text-sm truncate">{event.name}</div>

          {/* Timer */}
          <div className="flex gap-3 mt-3">
            {[
              { value: days, label: "days" },
              { value: hours, label: "hrs" },
              { value: mins, label: "min" },
            ].map((t) => (
              <div key={t.label} className="text-center">
                <div className={`text-2xl font-black ${urgencyColor}`}>{t.value}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">{t.label}</div>
              </div>
            ))}
          </div>

          {/* Mini training phase checklist */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {checklist.map((c) => (
              <span
                key={c.label}
                className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${
                  c.done
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-gray-700/40 text-gray-500"
                }`}
              >
                {c.done ? "\u2713 " : ""}{c.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
