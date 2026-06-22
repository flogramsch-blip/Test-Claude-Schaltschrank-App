import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import type { Measure } from "../types";

export function useMeasures(householdId: string | null) {
  const [measures, setMeasures] = useState<Measure[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!householdId) {
      setMeasures([]);
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, "households", householdId, "measures"),
      orderBy("createdAt", "desc"),
    );
    const unsub = onSnapshot(q, (snap) => {
      setMeasures(
        snap.docs.map((d) => {
          const raw = d.data();
          const data = raw as Partial<Measure>;
          return {
            categoryId: "",
            company: "",
            location: "",
            contact: "",
            supervisor: "",
            material: "",
            isFundable: false,
            fundingPercent: null,
            energyConsultantRequested: false,
            offerObtained: false,
            attachments: [],
            fundingEntries: [],
            plannedStart: null,
            plannedEnd: null,
            ...data,
            id: d.id,
            createdAt: raw.createdAt?.toMillis?.() ?? 0,
            updatedAt: raw.updatedAt?.toMillis?.() ?? 0,
          } as Measure;
        }),
      );
      setLoading(false);
    });
    return unsub;
  }, [householdId]);

  async function addMeasure(
    data: Omit<Measure, "id" | "createdBy" | "updatedBy" | "createdAt" | "updatedAt">,
  ) {
    if (!householdId || !auth.currentUser) return;
    await addDoc(collection(db, "households", householdId, "measures"), {
      ...data,
      createdBy: auth.currentUser.uid,
      updatedBy: auth.currentUser.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  async function updateMeasure(
    id: string,
    data: Partial<Omit<Measure, "id" | "createdBy" | "createdAt">>,
  ) {
    if (!householdId || !auth.currentUser) return;
    await updateDoc(doc(db, "households", householdId, "measures", id), {
      ...data,
      updatedBy: auth.currentUser.uid,
      updatedAt: serverTimestamp(),
    });
  }

  async function deleteMeasure(id: string) {
    if (!householdId) return;
    await deleteDoc(doc(db, "households", householdId, "measures", id));
  }

  async function restoreMeasure(measure: Measure) {
    if (!householdId) return;
    const { id, createdAt, updatedAt, ...rest } = measure;
    await setDoc(doc(db, "households", householdId, "measures", id), {
      ...rest,
      createdAt: Timestamp.fromMillis(createdAt),
      updatedAt: Timestamp.fromMillis(updatedAt),
    });
  }

  return { measures, loading, addMeasure, updateMeasure, deleteMeasure, restoreMeasure };
}
