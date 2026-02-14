import { useCallback, useRef } from "react";

export function useUndoDelete(deleteAction, showToast) {
  const timerRef = useRef(null);
  const pendingRef = useRef(null);

  const softDelete = useCallback((id, name) => {
    // Clear any previous pending delete
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      // Execute the previous pending delete immediately
      if (pendingRef.current) deleteAction(pendingRef.current);
    }

    pendingRef.current = id;

    showToast(`"${name}" deleted`, {
      type: "undo",
      duration: 5000,
      action: {
        label: "Undo",
        onClick: () => {
          clearTimeout(timerRef.current);
          pendingRef.current = null;
        },
      },
    });

    timerRef.current = setTimeout(() => {
      if (pendingRef.current === id) {
        deleteAction(id);
        pendingRef.current = null;
      }
    }, 5000);
  }, [deleteAction, showToast]);

  return softDelete;
}
