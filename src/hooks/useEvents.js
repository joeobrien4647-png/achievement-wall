import { useCallback } from "react";
import { useData } from "../context/DataContext";
import { createEvent, validateEvent } from "../data/schema";

export function useEvents() {
  const { state, dispatch } = useData();

  const events = state.events;
  const completed = events.filter((e) => e.status === "completed");
  const upcoming = events.find((e) => e.status === "upcoming") ?? null;
  const wishlist = events.filter((e) => e.status === "wishlist");

  const addEvent = useCallback(
    (overrides) => {
      const event = createEvent(overrides);
      const errors = validateEvent(event);
      if (errors.length > 0) return { success: false, errors };
      dispatch({ type: "ADD_EVENT", payload: event });
      return { success: true, event };
    },
    [dispatch]
  );

  const updateEvent = useCallback(
    (id, updates) => {
      dispatch({ type: "UPDATE_EVENT", payload: { id, ...updates } });
    },
    [dispatch]
  );

  const deleteEvent = useCallback(
    (id) => {
      dispatch({ type: "DELETE_EVENT", payload: id });
    },
    [dispatch]
  );

  const reorderWishlist = useCallback(
    (orderedIds) => {
      dispatch({ type: "REORDER_WISHLIST", payload: { orderedIds } });
    },
    [dispatch]
  );

  const getEventById = useCallback(
    (id) => events.find((e) => e.id === id) ?? null,
    [events]
  );

  return { events, completed, upcoming, wishlist, addEvent, updateEvent, deleteEvent, reorderWishlist, getEventById };
}
