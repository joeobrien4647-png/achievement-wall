import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { DataProvider, useData } from "./context/DataContext";
import Nav from "./components/Nav";
import Onboarding from "./components/Onboarding";
import SkeletonLoader from "./components/SkeletonLoader";
import { hapticLight } from "./lib/haptics";

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

  const showNav = page !== "form";

  if (!onboarded) {
    return (
      <Onboarding
        onComplete={() => dispatch({ type: "UPDATE_PREFERENCES", payload: { onboardingComplete: true } })}
      />
    );
  }

  return (
    <div className="bg-gray-950 min-h-screen text-white max-w-2xl mx-auto">
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
          {page === "form" && <EventFormPage eventId={editEventId} onBack={closeForm} />}
        </div>
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <AppShell />
    </DataProvider>
  );
}
