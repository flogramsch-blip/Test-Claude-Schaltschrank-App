import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useMeasures } from "../hooks/useMeasures";
import { useMeasureTypes } from "../hooks/useMeasureTypes";
import { useCategories } from "../hooks/useCategories";
import { useUndoableDelete } from "../hooks/useUndoableDelete";
import { Screen } from "../components/ui/Screen";
import { CardGroup } from "../components/ui/Card";
import { Snackbar } from "../components/ui/Snackbar";
import { MeasureFormSheet } from "../components/measures/MeasureFormSheet";
import { MeasureInfoDisclosure } from "../components/measures/MeasureInfoDisclosure";
import { formatEuro } from "../lib/format";
import type { Measure } from "../types";

export function Kategorie() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const householdId = user?.householdId ?? null;
  const { measures, addMeasure, updateMeasure, deleteMeasure, restoreMeasure } = useMeasures(householdId);
  const { types } = useMeasureTypes(householdId);
  const { categories } = useCategories(householdId);
  const { deletedMeasure, handleDelete, handleUndo, dismiss } = useUndoableDelete(
    measures,
    deleteMeasure,
    restoreMeasure,
  );

  const [editing, setEditing] = useState<Measure | null>(null);
  const [showSheet, setShowSheet] = useState(false);

  const category = categories.find((c) => c.id === categoryId);
  const typeById = useMemo(() => new Map(types.map((t) => [t.id, t])), [types]);
  const items = useMemo(
    () => measures.filter((m) => m.categoryId === categoryId).sort((a, b) => a.name.localeCompare(b.name)),
    [measures, categoryId],
  );
  const totals = useMemo(
    () => ({
      soll: items.reduce((sum, m) => sum + m.sollCost, 0),
      ist: items.reduce((sum, m) => sum + (m.istCost ?? 0), 0),
    }),
    [items],
  );

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
      title={category?.name ?? "Kategorie"}
      subtitle={`${formatEuro(totals.ist)} von ${formatEuro(totals.soll)}`}
      onBack={() => navigate("/")}
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
        {items.map((m) => (
          <MeasureInfoDisclosure
            key={m.id}
            measure={m}
            type={typeById.get(m.typeId)}
            onEdit={() => openEdit(m)}
            onDelete={() => handleDelete(m.id)}
          />
        ))}
        {items.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-label-secondary dark:text-label-secondary-dark">
            Noch keine Einträge in dieser Kategorie. Tippe auf + um den ersten hinzuzufügen.
          </p>
        )}
      </CardGroup>

      {showSheet && (
        <MeasureFormSheet
          editing={editing}
          categories={categories}
          types={types}
          defaultCategoryId={categoryId}
          onClose={() => setShowSheet(false)}
          addMeasure={addMeasure}
          updateMeasure={updateMeasure}
          deleteMeasure={deleteMeasure}
        />
      )}

      <Snackbar
        open={!!deletedMeasure}
        message={deletedMeasure ? `„${deletedMeasure.name}" gelöscht` : ""}
        actionLabel="Rückgängig"
        onAction={handleUndo}
        onDismiss={dismiss}
      />
    </Screen>
  );
}
