import { Heart, AlertTriangle, CheckCircle, Activity } from "lucide-react";
import { computeRecovery } from "../lib/recoveryScore";

const SCORE_CONFIG = {
  fresh: { color: "#10b981", bg: "bg-emerald-500/10", border: "border-emerald-500/30", icon: CheckCircle, label: "Fresh" },
  moderate: { color: "#f59e0b", bg: "bg-amber-500/10", border: "border-amber-500/30", icon: Activity, label: "Moderate" },
  fatigued: { color: "#ef4444", bg: "bg-red-500/10", border: "border-red-500/30", icon: AlertTriangle, label: "Fatigued" },
};

export default function RecoveryScoreCard({ events }) {
  const recovery = computeRecovery(events);
  const config = SCORE_CONFIG[recovery.score];
  const Icon = config.icon;

  return (
    <div className={`${config.bg} border ${config.border} rounded-2xl p-4`}>
      <div className="flex items-center gap-3 mb-3">
        <Heart size={18} style={{ color: config.color }} />
        <span className="text-white font-bold text-sm">Recovery Status</span>
        <span
          className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: config.color + "20", color: config.color }}
        >
          {config.label}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} style={{ color: config.color }} />
        <p className="text-gray-300 text-sm">{recovery.message}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="text-lg font-black text-white">
            {recovery.daysSinceLast ?? "\u2014"}
          </div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider">Days rest</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-black text-white">
            {recovery.avgGap ?? "\u2014"}
          </div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider">Avg gap</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-black text-white">
            {recovery.recentLoad}
          </div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider">30d load</div>
        </div>
      </div>
    </div>
  );
}
