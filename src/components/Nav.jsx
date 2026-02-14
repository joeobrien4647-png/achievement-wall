import { Home, BookOpen, BarChart3, Award, Target, Compass } from "lucide-react";

const items = [
  { id: "home", icon: Home, label: "Home" },
  { id: "events", icon: BookOpen, label: "Events" },
  { id: "stats", icon: BarChart3, label: "Stats" },
  { id: "milestones", icon: Award, label: "Badges" },
  { id: "next", icon: Target, label: "Next" },
  { id: "wishlist", icon: Compass, label: "Wishlist" },
];

export default function Nav({ page, setPage }) {
  return (
    <>
      {/* Desktop: top nav */}
      <nav aria-label="Main navigation" role="navigation" className="hidden sm:block sticky top-0 z-50 bg-gray-950/90 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-5xl mx-auto flex" role="tablist">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              role="tab"
              aria-selected={page === item.id}
              aria-label={`Navigate to ${item.label}`}
              className={`flex-1 flex flex-col items-center gap-0.5 py-3 text-xs font-medium transition-all ${
                page === item.id ? "text-white" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <item.icon size={18} strokeWidth={page === item.id ? 2.5 : 1.5} aria-hidden="true" />
              <span>{item.label}</span>
              {page === item.id && <div className="w-6 h-0.5 bg-white rounded-full mt-0.5" aria-hidden="true" />}
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile: bottom tab bar */}
      <nav aria-label="Main navigation" role="navigation" className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-gray-950/95 backdrop-blur-lg border-t border-gray-800 pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-5xl mx-auto flex" role="tablist">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              role="tab"
              aria-selected={page === item.id}
              aria-label={`Navigate to ${item.label}`}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-all active:scale-95 ${
                page === item.id ? "text-white" : "text-gray-500"
              }`}
            >
              <item.icon size={20} strokeWidth={page === item.id ? 2.5 : 1.5} aria-hidden="true" />
              <span className="text-[10px]">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
