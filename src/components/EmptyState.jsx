const EMPTY_CONFIGS = {
  events: {
    emoji: "\u{1F3C1}",
    title: "No events yet",
    subtitle: "Your journey starts with a single step. Add your first challenge!",
  },
  stats: {
    emoji: "\u{1F4CA}",
    title: "Nothing to crunch yet",
    subtitle: "Complete some events and we'll turn your adventures into beautiful charts.",
  },
  milestones: {
    emoji: "\u{1F3C6}",
    title: "Badges waiting to be earned",
    subtitle: "Keep pushing \u2014 your first badge is closer than you think.",
  },
  wishlist: {
    emoji: "\u{1F9ED}",
    title: "What's on your horizon?",
    subtitle: "Dream big. Add the challenges that keep you training when it's dark and cold.",
  },
  gear: {
    emoji: "\u{1F45F}",
    title: "No gear tracked yet",
    subtitle: "Add your shoes, packs and poles to track their mileage.",
  },
  routes: {
    emoji: "\u{1F5FA}\uFE0F",
    title: "No routes saved",
    subtitle: "Import GPX files to build your route library.",
  },
  search: {
    emoji: "\u{1F50D}",
    title: "No matches found",
    subtitle: "Try a different search term or filter.",
  },
};

export default function EmptyState({ type = "events", action }) {
  const config = EMPTY_CONFIGS[type] || EMPTY_CONFIGS.events;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="text-6xl mb-4 animate-bounce" style={{ animationDuration: "2s", animationIterationCount: 3 }}>
        {config.emoji}
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{config.title}</h3>
      <p className="text-gray-400 text-sm max-w-xs leading-relaxed mb-6">
        {config.subtitle}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
