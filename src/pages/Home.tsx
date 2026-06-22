import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useMeasures } from "../hooks/useMeasures";
import { useCategories } from "../hooks/useCategories";
import { useMeasureTypes } from "../hooks/useMeasureTypes";
import { useHousehold } from "../hooks/useHousehold";
import { useUndoableDelete } from "../hooks/useUndoableDelete";
import { Screen } from "../components/ui/Screen";
import { CardGroup } from "../components/ui/Card";
import { Tile } from "../components/ui/Tile";
import { Snackbar } from "../components/ui/Snackbar";
import { MeasureFormSheet } from "../components/measures/MeasureFormSheet";
import { MeasureInfoDisclosure } from "../components/measures/MeasureInfoDisclosure";
import { formatEuro } from "../lib/format";
import type { Measure } from "../types";

export function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const householdId = user?.householdId ?? null;
  const { measures, addMeasure, updateMeasure, deleteMeasure, restoreMeasure } = useMeasures(householdId);
  const { categories } = useCategories(householdId);
  const { types } = useMeasureTypes(householdId);
  const { household } = useHousehold(householdId);
  const { deletedMeasure, handleDelete, handleUndo, dismiss } = useUndoableDelete(
    measures,
    deleteMeasure,
    restoreMeasure,
  );

  const [editing, setEditing] = useState<Measure | null>(null);
  const [showSheet, setShowSheet] = useState(false);

  const typeById = useMemo(() => new Map(types.map((t) => [t.id, t])), [types]);

  const totals = useMemo(() => {
    const soll = measures.reduce((sum, m) => sum + m.sollCost, 0);
    const ist = measures.reduce((sum, m) => sum + (m.istCost ?? 0), 0);
    const offen = measures.filter((m) => m.istCost === null).length;
    const pct = soll > 0 ? Math.min(100, Math.round((ist / soll) * 100)) : 0;
    return { soll, ist, offen, diff: ist - soll, pct };
  }, [measures]);

  const byCategory = useMemo(() => {
    return categories.map((category) => {
      const items = measures.filter((m) => m.categoryId === category.id);
      return {
        category,
        soll: items.reduce((sum, m) => sum + m.sollCost, 0),
        ist: items.reduce((sum, m) => sum + (m.istCost ?? 0), 0),
        count: items.length,
      };
    });
  }, [measures, categories]);

  const byType = useMemo(() => {
    return types
      .map((type) => {
        const items = measures.filter((m) => m.typeId === type.id);
        return {
          type,
          soll: items.reduce((sum, m) => sum + m.sollCost, 0),
          ist: items.reduce((sum, m) => sum + (m.istCost ?? 0), 0),
          count: items.length,
        };
      })
      .filter((t) => t.count > 0);
  }, [measures, types]);

  const sortedMeasures = useMemo(
    () => [...measures].sort((a, b) => b.updatedAt - a.updatedAt),
    [measures],
  );

  function openNew() {
    setEditing(null);
    setShowSheet(true);
  }

  function openEdit(m: Measure) {
    setEditing(m);
    setShowSheet(true);
  }

  const ringColor = totals.diff > 0 ? "var(--color-ios-red)" : "var(--color-ios-blue)";

  return (
    <Screen
      title={household?.houseLabel || "Übersicht"}
      subtitle={`Hallo, ${user?.displayName ?? ""} 👋`}
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
      <div className="mb-6 rounded-3xl bg-surface p-5 shadow-md dark:bg-surface-elevated-dark">
        <div className="flex items-center gap-5">
          <div className="relative h-28 w-28 shrink-0">
            <div className="absolute inset-0 rounded-full bg-black/10 dark:bg-white/10" />
            <div
              className="absolute inset-0 rounded-full"
              style={{ background: `conic-gradient(${ringColor} ${totals.pct}%, transparent 0)` }}
            />
            <div className="absolute inset-[12px] rounded-full bg-surface dark:bg-surface-elevated-dark" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-label dark:text-label-dark">{totals.pct}%</span>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-label-secondary dark:text-label-secondary-dark">
              Gesamtkosten
            </p>
            <p className="mt-1 text-3xl font-bold text-label dark:text-label-dark">
              {formatEuro(totals.ist)}
            </p>
            <p className="text-sm text-label-secondary dark:text-label-secondary-dark">
              von geplant {formatEuro(totals.soll)}
            </p>
            <div className="mt-2 flex justify-between text-sm">
              <span className={totals.diff > 0 ? "text-ios-red" : "text-ios-green"}>
                {totals.diff > 0 ? "+" : ""}
                {formatEuro(totals.diff)} {totals.diff > 0 ? "über Budget" : "unter Budget"}
              </span>
              <span className="text-label-secondary dark:text-label-secondary-dark">
                {totals.offen} offen
              </span>
            </div>
          </div>
        </div>
      </div>

      <h2 className="mb-2 px-1 text-sm font-semibold text-label-secondary dark:text-label-secondary-dark">
        Kategorien
      </h2>
      {byCategory.length === 0 ? (
        <p className="mb-6 px-1 text-sm text-label-secondary dark:text-label-secondary-dark">
          Noch keine Kategorien angelegt.
        </p>
      ) : (
        <div className="mb-6 grid grid-cols-2 gap-3">
          {byCategory.map(({ category, soll, ist, count }) => (
            <Tile
              key={category.id}
              color={category.color}
              label={`${category.name} (${count})`}
              value={formatEuro(ist)}
              sub={`von ${formatEuro(soll)}`}
              onClick={() => navigate(`/kategorie/${category.id}`)}
            />
          ))}
        </div>
      )}

      <h2 className="mb-2 px-1 text-sm font-semibold text-label-secondary dark:text-label-secondary-dark">
        Aufschlüsselung nach Art
      </h2>
      {byType.length === 0 ? (
        <p className="mb-6 px-1 text-sm text-label-secondary dark:text-label-secondary-dark">
          Noch keine Maßnahmen erfasst.
        </p>
      ) : (
        <div className="mb-6 grid grid-cols-2 gap-3">
          {byType.map(({ type, soll, ist, count }) => (
            <Tile
              key={type.id}
              color={type.color}
              label={`${type.name} (${count})`}
              value={formatEuro(ist)}
              sub={`von ${formatEuro(soll)}`}
            />
          ))}
        </div>
      )}

      <CardGroup title="Alle Maßnahmen">
        {sortedMeasures.map((m) => (
          <MeasureInfoDisclosure
            key={m.id}
            measure={m}
            type={typeById.get(m.typeId)}
            onEdit={() => openEdit(m)}
            onDelete={() => handleDelete(m.id)}
          />
        ))}
        {sortedMeasures.length === 0 && (
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
