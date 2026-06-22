import { useState } from "react";
import type { Measure } from "../types";

export function useUndoableDelete(
  measures: Measure[],
  deleteMeasure: (id: string) => Promise<void>,
  restoreMeasure: (measure: Measure) => Promise<void>,
) {
  const [deletedMeasure, setDeletedMeasure] = useState<Measure | null>(null);

  async function handleDelete(id: string) {
    const measure = measures.find((m) => m.id === id);
    await deleteMeasure(id);
    if (measure) setDeletedMeasure(measure);
  }

  async function handleUndo() {
    if (!deletedMeasure) return;
    await restoreMeasure(deletedMeasure);
    setDeletedMeasure(null);
  }

  return { deletedMeasure, handleDelete, handleUndo, dismiss: () => setDeletedMeasure(null) };
}
