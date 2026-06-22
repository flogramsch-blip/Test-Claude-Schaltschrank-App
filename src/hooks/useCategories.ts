import { useEffect, useRef, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { DEFAULT_CATEGORIES, type Category } from "../types";

export function useCategories(householdId: string | null) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const seeded = useRef(false);

  useEffect(() => {
    seeded.current = false;
  }, [householdId]);

  useEffect(() => {
    if (!householdId) {
      setCategories([]);
      setLoading(false);
      return;
    }
    const collRef = collection(db, "households", householdId, "categories");
    const q = query(collRef, orderBy("order", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      if (snap.empty && !seeded.current) {
        seeded.current = true;
        const batch = writeBatch(db);
        for (const category of DEFAULT_CATEGORIES) {
          batch.set(doc(collRef), category);
        }
        void batch.commit();
      }
      setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category)));
      setLoading(false);
    });
    return unsub;
  }, [householdId]);

  async function addCategory(data: Omit<Category, "id">) {
    if (!householdId) return;
    await addDoc(collection(db, "households", householdId, "categories"), data);
  }

  async function updateCategory(id: string, data: Partial<Omit<Category, "id">>) {
    if (!householdId) return;
    await updateDoc(doc(db, "households", householdId, "categories", id), data);
  }

  async function deleteCategory(id: string) {
    if (!householdId) return;
    await deleteDoc(doc(db, "households", householdId, "categories", id));
  }

  return { categories, loading, addCategory, updateCategory, deleteCategory };
}
