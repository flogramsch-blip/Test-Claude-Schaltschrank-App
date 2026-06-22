import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useMeasures } from "../hooks/useMeasures";
import { useCategories } from "../hooks/useCategories";
import { useMeasureTypes } from "../hooks/useMeasureTypes";
import { Screen } from "../components/ui/Screen";
import { CardGroup, Card } from "../components/ui/Card";
import { ListCell } from "../components/ui/ListCell";
import { ProgressBar } from "../components/ui/ProgressBar";
import { MeasureFormSheet } from "../components/measures/MeasureFormSheet";
import { formatEuro, formatDate } from "../lib/format";
import { STATUS_LABELS } from "../types";

export function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const householdId = user?.householdId ?? null;
  const { measures, addMeasure, updateMeasure, deleteMeasure } = useMeasures(householdId);
  const { categories } = useCategories(householdId);
  const { types } = useMeasureTypes(householdId);

  const [showSheet, setShowSheet] = useState(false);

  const totals = useMemo(() => {
    const soll = measures.reduce((sum, m) => sum + m.sollCost, 0);
    const ist = measures.reduce((sum, m) => sum + (m.istCost ?? 0), 0);
    const offen = measures.filter((m) => m.istCost === null).length;
    return { soll, ist, offen, diff: ist - soll };
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

  const recent = useMemo(
    () => [...measures].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 5),
    [measures],
  );

  return (
    <Screen
      title="Übersicht"
      subtitle={`Hallo, ${user?.displayName ?? ""} 👋`}
      trailing={
        <button
          onClick={() => setShowSheet(true)}
          className="rounded-full bg-ios-blue p-2 text-white"
          aria-label="Maßnahme hinzufügen"
        >
          <Plus size={20} />
        </button>
      }
    >
      <Card className="mb-6 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-label-secondary dark:text-label-secondary-dark">
          Gesamtkosten
        </p>
        <p className="mt-1 text-4xl font-bold text-label dark:text-label-dark">
          {formatEuro(totals.ist)}
        </p>
        <p className="mb-3 text-sm text-label-secondary dark:text-label-secondary-dark">
          von geplant {formatEuro(totals.soll)}
        </p>
        <ProgressBar value={totals.ist} max={totals.soll} />
        <div className="mt-3 flex justify-between text-sm">
          <span className={totals.diff > 0 ? "text-ios-red" : "text-ios-green"}>
            {totals.diff > 0 ? "+" : ""}
            {formatEuro(totals.diff)} {totals.diff > 0 ? "über Budget" : "unter Budget"}
          </span>
          <span className="text-label-secondary dark:text-label-secondary-dark">
            {totals.offen} offen
          </span>
        </div>
      </Card>

      <CardGroup title="Kategorien">
        {byCategory.map(({ category, soll, ist, count }) => (
          <ListCell
            key={category.id}
            leading={<span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: category.color }} />}
            label={
              <span>
                {category.name}{" "}
                <span className="text-xs text-label-tertiary dark:text-label-tertiary-dark">({count})</span>
              </span>
            }
            value={`${formatEuro(ist)} / ${formatEuro(soll)}`}
            chevron
            onClick={() => navigate(`/kategorie/${category.id}`)}
          />
        ))}
        {byCategory.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-label-secondary dark:text-label-secondary-dark">
            Noch keine Kategorien angelegt.
          </p>
        )}
      </CardGroup>

      <CardGroup title="Zuletzt aktualisiert">
        {recent.map((m) => (
          <div key={m.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-[15px] text-label dark:text-label-dark">{m.name}</p>
              <p className="text-xs text-label-secondary dark:text-label-secondary-dark">
                {STATUS_LABELS[m.status]} · {formatDate(m.updatedAt)}
              </p>
            </div>
            <p className="text-[15px] font-medium text-label dark:text-label-dark">
              {formatEuro(m.istCost ?? m.sollCost)}
            </p>
          </div>
        ))}
        {recent.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-label-secondary dark:text-label-secondary-dark">
            Noch keine Maßnahmen erfasst.
          </p>
        )}
      </CardGroup>

      {showSheet && (
        <MeasureFormSheet
          editing={null}
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
