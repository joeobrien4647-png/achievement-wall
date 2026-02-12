import { createContext, useContext, useReducer, useEffect } from "react";
import { load, save } from "../lib/storage";
import { seedEvents, seedMilestones, seedRadarData, seedPreferences } from "../data/seed";

const DataContext = createContext(null);

function getInitialState() {
  const stored = load();
  if (stored) {
    // Merge in any new seed events (e.g. suggested challenges) that aren't already stored
    const storedEvents = stored.events ?? seedEvents;
    const storedIds = new Set(storedEvents.map((e) => e.id));
    const newSeedEvents = seedEvents.filter((e) => !storedIds.has(e.id));

    // Build a lookup of seed event metadata to backfill missing fields (e.g. category)
    const seedLookup = new Map(seedEvents.map((e) => [e.id, e]));

    // Backfill category + appeal on existing events from seed data
    const patched = storedEvents.map((e) => {
      const seed = seedLookup.get(e.id);
      if (!seed) return e;
      const updates = {};
      if (!e.category && seed.category) updates.category = seed.category;
      if (!e.appeal && seed.appeal) updates.appeal = seed.appeal;
      return Object.keys(updates).length > 0 ? { ...e, ...updates } : e;
    });

    return {
      events: newSeedEvents.length > 0 ? [...patched, ...newSeedEvents] : patched,
      milestones: stored.milestones ?? seedMilestones,
      radarData: stored.radarData ?? seedRadarData,
      preferences: stored.preferences ?? seedPreferences,
    };
  }
  return {
    events: seedEvents,
    milestones: seedMilestones,
    radarData: seedRadarData,
    preferences: seedPreferences,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case "ADD_EVENT":
      return { ...state, events: [...state.events, action.payload] };

    case "UPDATE_EVENT":
      return {
        ...state,
        events: state.events.map((e) =>
          e.id === action.payload.id ? { ...e, ...action.payload, updatedAt: new Date().toISOString() } : e
        ),
      };

    case "DELETE_EVENT":
      return { ...state, events: state.events.filter((e) => e.id !== action.payload) };

    case "UPDATE_MILESTONE":
      return {
        ...state,
        milestones: state.milestones.map((m) =>
          m.id === action.payload.id ? { ...m, ...action.payload } : m
        ),
      };

    case "UPDATE_RADAR":
      return { ...state, radarData: action.payload };

    case "UPDATE_PREFERENCES":
      return { ...state, preferences: { ...state.preferences, ...action.payload } };

    case "IMPORT_DATA":
      return { ...action.payload };

    case "RESET_TO_SEED":
      return {
        events: seedEvents,
        milestones: seedMilestones,
        radarData: seedRadarData,
        preferences: seedPreferences,
      };

    default:
      return state;
  }
}

export function DataProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, getInitialState);

  // Persist every state change to localStorage
  useEffect(() => {
    save(state);
  }, [state]);

  return (
    <DataContext.Provider value={{ state, dispatch }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
