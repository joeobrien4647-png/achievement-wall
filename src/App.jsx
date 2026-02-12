import { useState, useEffect, lazy, Suspense } from "react";
import { DataProvider, useData } from "./context/DataContext";
import Nav from "./components/Nav";

const HomePage = lazy(() => import("./pages/HomePage"));
const EventsPage = lazy(() => import("./pages/EventsPage"));
const StatsPage = lazy(() => import("./pages/StatsPage"));
const MilestonesPage = lazy(() => import("./pages/MilestonesPage"));
const NextPage = lazy(() => import("./pages/NextPage"));
const BucketListPage = lazy(() => import("./pages/BucketListPage"));
const EventFormPage = lazy(() => import("./pages/EventFormPage"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center pt-32">
      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function AppShell() {
  const { state } = useData();
  const oledMode = state.preferences?.oledMode ?? false;
  const [page, setPage] = useState("home");
  const [editEventId, setEditEventId] = useState(null);
  const [formReturnPage, setFormReturnPage] = useState("events");

  // Apply OLED mode class to <html>
  useEffect(() => {
    document.documentElement.classList.toggle("oled-mode", oledMode);
  }, [oledMode]);

  const navigate = (newPage) => {
    if (document.startViewTransition) {
      document.startViewTransition(() => setPage(newPage));
    } else {
      setPage(newPage);
    }
    window.scrollTo(0, 0);
  };

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

  return (
    <div className="bg-gray-950 min-h-screen text-white max-w-2xl mx-auto">
      {showNav && <Nav page={page} setPage={navigate} />}
      <Suspense fallback={<PageLoader />}>
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
