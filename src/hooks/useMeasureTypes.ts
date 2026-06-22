import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { MeasureType } from "../types";

export function useMeasureTypes(householdId: string | null) {
  const [types, setTypes] = useState<MeasureType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!householdId) {
      setTypes([]);
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, "households", householdId, "measureTypes"),
      orderBy("order", "asc"),
    );
    const unsub = onSnapshot(q, (snap) => {
      setTypes(snap.docs.map((d) => ({ id: d.id, ...d.data() } as MeasureType)));
      setLoading(false);
    });
    return unsub;
  }, [householdId]);

  async function addType(data: Omit<MeasureType, "id">) {
    if (!householdId) return;
    await addDoc(collection(db, "households", householdId, "measureTypes"), data);
  }

  async function updateType(id: string, data: Partial<Omit<MeasureType, "id">>) {
    if (!householdId) return;
    await updateDoc(doc(db, "households", householdId, "measureTypes", id), data);
  }

  async function deleteType(id: string) {
    if (!householdId) return;
    await deleteDoc(doc(db, "households", householdId, "measureTypes", id));
  }

  return { types, loading, addType, updateType, deleteType };
}
