import { useEffect, useState } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Household } from "../types";

export function useHousehold(householdId: string | null) {
  const [household, setHousehold] = useState<Household | null>(null);

  useEffect(() => {
    if (!householdId) {
      setHousehold(null);
      return;
    }
    const unsub = onSnapshot(doc(db, "households", householdId), (snap) => {
      setHousehold(snap.exists() ? ({ id: snap.id, ...snap.data() } as Household) : null);
    });
    return unsub;
  }, [householdId]);

  async function updateHousehold(data: Partial<Pick<Household, "name" | "houseLabel">>) {
    if (!householdId) return;
    await updateDoc(doc(db, "households", householdId), data);
  }

  return { household, updateHousehold };
}
