const BACKUP_KEY = "achievement-wall-backup";
const BACKUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function startAutoBackup(getState) {
  const doBackup = () => {
    try {
      const state = getState();
      if (state) {
        localStorage.setItem(BACKUP_KEY, JSON.stringify({
          ...state,
          _backupAt: new Date().toISOString(),
        }));
      }
    } catch { /* quota exceeded -- silently skip */ }
  };

  // Initial backup after 30s
  const initialTimer = setTimeout(doBackup, 30000);
  // Then every 5 minutes
  const intervalTimer = setInterval(doBackup, BACKUP_INTERVAL);

  return () => {
    clearTimeout(initialTimer);
    clearInterval(intervalTimer);
  };
}

export function getBackupInfo() {
  try {
    const raw = localStorage.getItem(BACKUP_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return {
      timestamp: data._backupAt,
      size: new Blob([raw]).size,
    };
  } catch {
    return null;
  }
}

export function restoreFromBackup() {
  try {
    const raw = localStorage.getItem(BACKUP_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    delete data._backupAt;
    return data;
  } catch {
    return null;
  }
}
