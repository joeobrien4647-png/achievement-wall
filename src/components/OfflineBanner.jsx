import { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";

export default function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);

    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[60] flex items-center justify-center gap-1.5 h-7 bg-amber-600 text-white text-xs font-medium transition-transform duration-300 ${
        offline ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <WifiOff size={12} />
      <span>You're offline</span>
    </div>
  );
}
