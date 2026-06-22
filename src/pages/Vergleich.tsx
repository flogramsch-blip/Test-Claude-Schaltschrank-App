import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useMeasures } from "../hooks/useMeasures";
import { useMeasureTypes } from "../hooks/useMeasureTypes";
import { useCategories } from "../hooks/useCategories";
import { Screen } from "../components/ui/Screen";
import { CardGroup } from "../components/ui/Card";
import { MeasureFormSheet } from "../components/measures/MeasureFormSheet";
import { formatEuro } from "../lib/format";
import { STATUS_LABELS, type Measure } from "../types";

export function Vergleich() {
  const { user } = useAuth();
  const householdId = user?.householdId ?? null;
  const { measures, addMeasure, updateMeasure, deleteMeasure } = useMeasures(householdId);
  const { types } = useMeasureTypes(householdId);
  const { categories } = useCategories(householdId);

  const [editing, setEditing] = useState<Measure | null>(null);
  const [showSheet, setShowSheet] = useState(false);

  const sorted = useMemo(() => [...measures].sort((a, b) => a.name.localeCompare(b.name)), [measures]);
  const typeById = useMemo(() => new Map(types.map((t) => [t.id, t])), [types]);
  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  function openNew() {
    setEditing(null);
    setShowSheet(true);
  }

  function openEdit(m: Measure) {
    setEditing(m);
    setShowSheet(true);
  }

  return (
    <Screen
      title="Soll / Ist"
      subtitle="Vergleich deiner Maßnahmen"
      trailing={
        <button
          onClick={openNew}
          className="rounded-full bg-ios-blue p-2 text-white"
          aria-label="Maßnahme hinzufügen"
        >
          <Plus size={20} />
        </button>
      }
    >
      <CardGroup>
        {sorted.map((m) => {
          const type = typeById.get(m.typeId);
          const category = categoryById.get(m.categoryId);
          const diff = (m.istCost ?? 0) - m.sollCost;
          return (
            <button
              key={m.id}
              onClick={() => openEdit(m)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-surface-secondary dark:active:bg-black/40"
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: type?.color ?? "#8e8e93" }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] text-label dark:text-label-dark">{m.name}</p>
                <p className="text-xs text-label-secondary dark:text-label-secondary-dark">
                  {category?.name ?? "Ohne Kategorie"} · {type?.name ?? "Unbekannt"} · {STATUS_LABELS[m.status]}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[15px] font-medium text-label dark:text-label-dark">
                  {formatEuro(m.istCost ?? 0)} / {formatEuro(m.sollCost)}
                </p>
                {m.istCost !== null && diff !== 0 && (
                  <p className={diff > 0 ? "text-xs text-ios-red" : "text-xs text-ios-green"}>
                    {diff > 0 ? "+" : ""}
                    {formatEuro(diff)}
                  </p>
                )}
              </div>
            </button>
          );
        })}
        {sorted.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-label-secondary dark:text-label-secondary-dark">
            Noch keine Maßnahmen. Tippe auf + um die erste hinzuzufügen.
          </p>
        )}
      </CardGroup>

      {showSheet && (
        <MeasureFormSheet
          editing={editing}
          categories={categories}
          types={types}
          onClose={() => setShowSheet(false)}
          addMeasure={addMeasure}
          updateMeasure={updateMeasure}
          deleteMeasure={deleteMeasure}
        />
      )}
    </Screen>
  );
}
