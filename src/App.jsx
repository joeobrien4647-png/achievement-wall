import { useState } from "react";
import { DataProvider } from "./context/DataContext";
import Nav from "./components/Nav";
import HomePage from "./pages/HomePage";
import EventsPage from "./pages/EventsPage";
import StatsPage from "./pages/StatsPage";
import MilestonesPage from "./pages/MilestonesPage";
import NextPage from "./pages/NextPage";
import BucketListPage from "./pages/BucketListPage";
import EventFormPage from "./pages/EventFormPage";

function AppShell() {
  const [page, setPage] = useState("home");
  const [editEventId, setEditEventId] = useState(null);
  const [formReturnPage, setFormReturnPage] = useState("events");

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
    // Store prefill in sessionStorage so EventFormPage can pick it up
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
