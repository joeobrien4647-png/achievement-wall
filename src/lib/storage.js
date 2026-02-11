const STORAGE_KEY = "achievement-wall";
const SCHEMA_VERSION = 1;

export function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.version < SCHEMA_VERSION) {
      return migrate(data, data.version);
    }
    return data;
  } catch {
    return null;
  }
}

export function save(data) {
  try {
    const payload = { ...data, version: SCHEMA_VERSION, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.error("Failed to save to localStorage:", e);
  }
}

export function clear() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getStorageSize() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? new Blob([raw]).size : 0;
}

function migrate(data, fromVersion) {
  // Future migrations go here: if (fromVersion < 2) { ... }
  return { ...data, version: SCHEMA_VERSION };
}
