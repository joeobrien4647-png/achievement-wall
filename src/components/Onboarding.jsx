import { useState } from "react";
import { ChevronRight, Mountain, Trophy, Compass, Target, BarChart3 } from "lucide-react";

const STEPS = [
  {
    icon: Mountain,
    title: "Welcome to your Endurance CV",
    description: "Track every mountain summit, ultra walk, and urban adventure. This is your personal achievement wall.",
    color: "#8b5cf6",
  },
  {
    icon: Trophy,
    title: "Log your events",
    description: "Add completed events with distance, elevation, difficulty, photos, and your story. Build your record.",
    color: "#10b981",
  },
  {
    icon: Target,
    title: "Plan what's next",
    description: "Promote bucket list challenges to your next target. Get auto-generated training plans tailored to the event.",
    color: "#ef4444",
  },
  {
    icon: Compass,
    title: "103 challenges waiting",
    description: "Browse mountains, ultras, multi-day treks, urban walks, and international adventures. Filter by category, search, and sort.",
    color: "#f59e0b",
  },
  {
    icon: BarChart3,
    title: "Watch your stats grow",
    description: "Track personal records, unlock achievement badges, compare year-on-year, and see your journey on the map.",
    color: "#06b6d4",
  },
];

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-[300] bg-gray-950 flex flex-col items-center justify-center px-6">
      {/* Progress dots */}
      <div className="flex gap-2 mb-12">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === step ? "w-8 bg-white" : i < step ? "w-4 bg-gray-600" : "w-4 bg-gray-800"
            }`}
          />
        ))}
      </div>

      {/* Icon */}
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8 transition-all duration-500"
        style={{ backgroundColor: `${current.color}20`, border: `2px solid ${current.color}40` }}
      >
        <Icon size={36} style={{ color: current.color }} />
      </div>

      {/* Content */}
      <h2 className="text-2xl font-black text-white text-center mb-3 transition-all duration-300">
        {current.title}
      </h2>
      <p className="text-gray-400 text-center text-sm max-w-xs leading-relaxed mb-12">
        {current.description}
      </p>

      {/* Action */}
      <button
        onClick={() => {
          if (isLast) {
            onComplete();
          } else {
            setStep(step + 1);
          }
        }}
        className="flex items-center gap-2 bg-white text-gray-950 font-bold text-sm px-8 py-3.5 rounded-xl hover:bg-gray-100 transition-colors active:scale-95"
      >
        {isLast ? "Let's go" : "Next"}
        <ChevronRight size={16} />
      </button>

      {/* Skip */}
      {!isLast && (
        <button
          onClick={onComplete}
          className="mt-4 text-gray-600 text-xs hover:text-gray-400 transition-colors"
        >
          Skip intro
        </button>
      )}
    </div>
  );
}
