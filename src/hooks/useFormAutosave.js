import { useEffect, useRef, useCallback } from "react";

const AUTOSAVE_KEY = "achievement-wall-form-draft";
const DEBOUNCE_MS = 1000;

export function useFormAutosave(form, eventId) {
  const timerRef = useRef(null);
  const key = eventId ? `${AUTOSAVE_KEY}-${eventId}` : AUTOSAVE_KEY;

  // Debounced save
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try {
        // Only save if the form has a name (to avoid saving empty forms)
        if (form.name?.trim()) {
          sessionStorage.setItem(key, JSON.stringify(form));
        }
      } catch { /* ignore */ }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [form, key]);

  return null;
}

export function loadDraft(eventId) {
  const key = eventId ? `${AUTOSAVE_KEY}-${eventId}` : AUTOSAVE_KEY;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearDraft(eventId) {
  const key = eventId ? `${AUTOSAVE_KEY}-${eventId}` : AUTOSAVE_KEY;
  sessionStorage.removeItem(key);
}
