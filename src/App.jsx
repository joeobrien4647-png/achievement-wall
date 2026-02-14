import { useState, useEffect, useCallback, useRef, lazy, Suspense } from "react";
import { DataProvider, useData } from "./context/DataContext";
import { ToastProvider } from "./context/ToastContext";
import Nav from "./components/Nav";
import Onboarding from "./components/Onboarding";
import SkeletonLoader from "./components/SkeletonLoader";
import OfflineBanner from "./components/OfflineBanner";
import { hapticLight } from "./lib/haptics";
import { applyAccentColor, applyLightMode } from "./lib/themes";
import { startAutoBackup } from "./lib/autoBackup";
import { useSwipe } from "./hooks/useSwipe";

const HomePage = lazy(() => import("./pages/HomePage"));
const EventsPage = lazy(() => import("./pages/EventsPage"));
const StatsPage = lazy(() => import("./pages/StatsPage"));
const MilestonesPage = lazy(() => import("./pages/MilestonesPage"));
const NextPage = lazy(() => import("./pages/NextPage"));
const BucketListPage = lazy(() => import("./pages/BucketListPage"));
const EventFormPage = lazy(() => import("./pages/EventFormPage"));
const WrappedPage = lazy(() => import("./pages/WrappedPage"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));
const PaceCalculatorPage = lazy(() => import("./pages/PaceCalculatorPage"));
const GearPage = lazy(() => import("./pages/GearPage"));
const RoutesPage = lazy(() => import("./pages/RoutesPage"));

function AppShell() {
  const { state, dispatch } = useData();
  const oledMode = state.preferences?.oledMode ?? false;
  const reducedMotion = state.preferences?.reducedMotion ?? false;
  const onboarded = state.preferences?.onboardingComplete ?? false;
  const [page, setPage] = useState("home");
  const [editEventId, setEditEventId] = useState(null);
  const [formReturnPage, setFormReturnPage] = useState("events");

  // Apply OLED mode class to <html>
  useEffect(() => {
    document.documentElement.classList.toggle("oled-mode", oledMode);
  }, [oledMode]);

  // Apply reduced motion class to <html>
  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", reducedMotion);
  }, [reducedMotion]);

  // Apply accent color
  const accentColor = state.preferences?.accentColor ?? "#6366f1";
  useEffect(() => {
    applyAccentColor(accentColor);
  }, [accentColor]);

  // Apply light mode (OLED takes priority — never both)
  const lightMode = state.preferences?.lightMode ?? false;
  useEffect(() => {
    applyLightMode(lightMode && !oledMode);
  }, [lightMode, oledMode]);

  // Auto-backup every 5 minutes
  const stateRef = useRef(state);
  stateRef.current = state;
  useEffect(() => {
    return startAutoBackup(() => stateRef.current);
  }, []);

  const navigate = useCallback((newPage) => {
    hapticLight();
    if (!reducedMotion && document.startViewTransition) {
      document.startViewTransition(() => setPage(newPage));
    } else {
      setPage(newPage);
    }
    window.scrollTo(0, 0);
  }, [reducedMotion]);

  // Global keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      // Escape closes form/overlays
      if (e.key === "Escape" && page === "form") {
        e.preventDefault();
        closeForm();
        return;
      }
      // Only handle nav shortcuts when not in an input
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      const shortcuts = {
        "1": "home", "2": "events", "3": "stats",
        "4": "milestones", "5": "next", "6": "wishlist",
      };
      if (shortcuts[e.key]) {
        e.preventDefault();
        navigate(shortcuts[e.key]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [page, navigate]);

  const openForm = (eventId = null, returnTo = "events") => {
    setEditEventId(eventId);
    setFormReturnPage(returnTo);
    navigate("form");
  };

  const openWishlistForm = (prefill = {}) => {
    setEditEventId(null);
    setFormReturnPage("wishlist");
    navigate("form");
    if (Object.keys(prefill).length > 0) {
      sessionStorage.setItem("formPrefill", JSON.stringify({ status: "wishlist", ...prefill }));
    } else {
      sessionStorage.setItem("formPrefill", JSON.stringify({ status: "wishlist" }));
    }
  };

  const closeForm = () => {
    setEditEventId(null);
    sessionStorage.removeItem("formPrefill");
    navigate(formReturnPage);
  };

  // Swipe navigation between main pages
  const NAV_PAGES = ["home", "events", "stats", "milestones", "next", "wishlist"];
  const swipeHandlers = useSwipe(
    () => {
      const i = NAV_PAGES.indexOf(page);
      if (i >= 0 && i < NAV_PAGES.length - 1) navigate(NAV_PAGES[i + 1]);
    },
    () => {
      const i = NAV_PAGES.indexOf(page);
      if (i > 0) navigate(NAV_PAGES[i - 1]);
    }
  );

  const showNav = page !== "form";

  if (!onboarded) {
    return (
      <Onboarding
        onComplete={() => dispatch({ type: "UPDATE_PREFERENCES", payload: { onboardingComplete: true } })}
      />
    );
  }

  return (
    <div className="bg-gray-950 min-h-screen text-white max-w-2xl mx-auto" {...swipeHandlers}>
      <OfflineBanner />
      {showNav && <Nav page={page} setPage={navigate} />}
      <Suspense fallback={<SkeletonLoader />}>
        <div style={{ viewTransitionName: "page" }}>
          {page === "home" && <HomePage setPage={navigate} />}
          {page === "events" && <EventsPage setPage={navigate} onAddEvent={() => openForm()} onEditEvent={(id) => openForm(id)} />}
          {page === "stats" && <StatsPage />}
          {page === "milestones" && <MilestonesPage />}
          {page === "next" && <NextPage />}
          {page === "wishlist" && (
            <BucketListPage
              onAddWishlist={(prefill) => openWishlistForm(prefill)}
              onEditEvent={(id) => openForm(id, "wishlist")}
            />
          )}
          {page === "wrapped" && <WrappedPage />}
          {page === "calendar" && <CalendarPage />}
          {page === "pace" && <PaceCalculatorPage />}
          {page === "gear" && <GearPage />}
          {page === "routes" && <RoutesPage />}
          {page === "form" && <EventFormPage eventId={editEventId} onBack={closeForm} />}
        </div>
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <ToastProvider>
        <AppShell />
      </ToastProvider>
    </DataProvider>
  );
}
