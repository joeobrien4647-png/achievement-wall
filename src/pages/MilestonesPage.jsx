import { useMilestones } from "../hooks/useMilestones";

export default function MilestonesPage() {
  const { unlocked, locked, unlockedCount, totalCount } = useMilestones();

  return (
    <div className="px-4 pb-24 sm:pb-8 pt-4">
      <h2 className="text-2xl font-black text-white mb-1">Badges & Milestones</h2>
      <p className="text-gray-500 text-sm mb-5">
        {unlockedCount}/{totalCount} unlocked
      </p>

      <div className="bg-gray-800/40 rounded-2xl p-4 mb-4 border border-gray-700/50">
        <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
          <div
            className="bg-gradient-to-r from-amber-500 to-amber-300 h-3 rounded-full transition-all duration-700"
            style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
          />
        </div>
        <p className="text-center text-xs text-gray-400">
          {unlockedCount} of {totalCount} badges earned
        </p>
      </div>

      <h3 className="text-xs uppercase tracking-widest text-emerald-400 font-bold mb-3 mt-6">
        🏆 Unlocked
      </h3>
      <div className="grid grid-cols-2 gap-2.5 mb-6">
        {unlocked.map((m) => (
          <div
            key={m.id}
            className="bg-gray-800/60 border border-gray-700/50 rounded-2xl p-4 text-center"
          >
            <div className="text-3xl mb-2">{m.icon}</div>
            <div className="text-white font-bold text-sm">{m.text}</div>
            <div className="text-gray-400 text-[11px] mt-1 leading-snug">{m.desc}</div>
          </div>
        ))}
      </div>

      <h3 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-3">
        🔒 Locked — What's Next?
      </h3>
      <div className="grid grid-cols-2 gap-2.5">
        {locked.map((m) => (
          <div
            key={m.id}
            className="bg-gray-800/30 border border-gray-700/30 border-dashed rounded-2xl p-4 text-center opacity-50"
          >
            <div className="text-3xl mb-2 grayscale">{m.icon}</div>
            <div className="text-gray-400 font-bold text-sm">{m.text}</div>
            <div className="text-gray-500 text-[11px] mt-1 leading-snug">{m.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
