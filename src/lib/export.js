export function exportToJSON(state) {
  const data = {
    exportVersion: 1,
    exportedAt: new Date().toISOString(),
    events: state.events,
    milestones: state.milestones,
    radarData: state.radarData,
    preferences: state.preferences,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `achievement-wall-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importFromJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data.events || !Array.isArray(data.events)) {
          reject(new Error("Invalid file: missing events array"));
          return;
        }
        resolve({
          events: data.events,
          milestones: data.milestones || [],
          radarData: data.radarData || [],
          preferences: data.preferences || {},
        });
      } catch {
        reject(new Error("Invalid JSON file"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}
