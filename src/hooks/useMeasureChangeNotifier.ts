import { useEffect, useRef } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { showLocalNotification } from "../lib/notifications";

/**
 * Shows an in-app/OS notification when the partner changes a measure's
 * cost while this app instance is running. Real push delivery while the
 * app is closed is handled server-side by the Cloud Function + FCM.
 */
export function useMeasureChangeNotifier(householdId: string | null, currentUid: string | undefined) {
  const isFirstSnapshot = useRef(true);

  useEffect(() => {
    if (!householdId || !currentUid) return;
    isFirstSnapshot.current = true;
    const unsub = onSnapshot(collection(db, "households", householdId, "measures"), (snap) => {
      if (isFirstSnapshot.current) {
        isFirstSnapshot.current = false;
        return;
      }
      for (const change of snap.docChanges()) {
        if (change.doc.metadata.hasPendingWrites) continue;
        const data = change.doc.data();
        if (data.updatedBy === currentUid) continue;
        if (change.type === "added") {
          showLocalNotification("Neue Maßnahme", `"${data.name}" wurde hinzugefügt.`);
        } else if (change.type === "modified") {
          showLocalNotification(
            "Kosten aktualisiert",
            `"${data.name}": Soll ${data.sollCost} € / Ist ${data.istCost ?? "–"} €`,
          );
        }
      }
    });
    return unsub;
  }, [householdId, currentUid]);
}
