import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { de } from "date-fns/locale";
import { useAuth } from "../contexts/AuthContext";
import { useMeasures } from "../hooks/useMeasures";
import { useMeasureTypes } from "../hooks/useMeasureTypes";
import { useCategories } from "../hooks/useCategories";
import { Screen } from "../components/ui/Screen";
import { CardGroup, Card } from "../components/ui/Card";
import { SegmentedControl } from "../components/ui/SegmentedControl";
import { Calendar } from "../components/ui/Calendar";
import { MeasureFormSheet } from "../components/measures/MeasureFormSheet";
import { MeasureInfoDisclosure } from "../components/measures/MeasureInfoDisclosure";
import type { Measure } from "../types";

type View = "liste" | "kalender";

export function Zeitplanung() {
  const { user } = useAuth();
  const householdId = user?.householdId ?? null;
  const { measures, addMeasure, updateMeasure, deleteMeasure } = useMeasures(householdId);
  const { types } = useMeasureTypes(householdId);
  const { categories } = useCategories(householdId);

  const [view, setView] = useState<View>("liste");
  const [month, setMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editing, setEditing] = useState<Measure | null>(null);
  const [showSheet, setShowSheet] = useState(false);

  const typeById = useMemo(() => new Map(types.map((t) => [t.id, t])), [types]);

  const planned = useMemo(
    () =>
      measures
        .filter((m) => m.plannedStart !== null)
        .sort((a, b) => (a.plannedStart ?? 0) - (b.plannedStart ?? 0)),
    [measures],
  );

  const grouped = useMemo(() => {
    const groups = new Map<string, Measure[]>();
    for (const m of planned) {
      const key = format(new Date(m.plannedStart!), "MMMM yyyy", { locale: de });
      groups.set(key, [...(groups.get(key) ?? []), m]);
    }
    return Array.from(groups.entries());
  }, [planned]);

  const markerCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of planned) {
      const key = format(new Date(m.plannedStart!), "yyyy-MM-dd");
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [planned]);

  const dayItems = useMemo(
    () => (selectedDate ? planned.filter((m) => isSameDay(new Date(m.plannedStart!), selectedDate)) : []),
    [planned, selectedDate],
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
      title="Planung"
      subtitle="Zeitstrahl & Kalender eurer Maßnahmen"
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
      <div className="mb-4">
        <SegmentedControl
          value={view}
          onChange={setView}
          options={[
            { value: "liste", label: "Zeitstrahl" },
            { value: "kalender", label: "Kalender" },
          ]}
        />
      </div>

      {view === "liste" ? (
        <>
          {grouped.map(([label, items]) => (
            <CardGroup key={label} title={label}>
              {items.map((m) => (
                <MeasureInfoDisclosure key={m.id} measure={m} type={typeById.get(m.typeId)} onEdit={() => openEdit(m)} />
              ))}
            </CardGroup>
          ))}
          {planned.length === 0 && (
            <p className="px-1 py-8 text-center text-sm text-label-secondary dark:text-label-secondary-dark">
              Noch keine Termine geplant. Tippe auf + um eine anstehende Maßnahme einzutragen.
            </p>
          )}
        </>
      ) : (
        <>
          <Card className="mb-4 p-4">
            <Calendar
              month={month}
              onMonthChange={setMonth}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              markerCounts={markerCounts}
            />
          </Card>
          {selectedDate && (
            <CardGroup title={format(selectedDate, "d. MMMM yyyy", { locale: de })}>
              {dayItems.map((m) => (
                <MeasureInfoDisclosure key={m.id} measure={m} type={typeById.get(m.typeId)} onEdit={() => openEdit(m)} />
              ))}
              {dayItems.length === 0 && (
                <p className="px-4 py-6 text-center text-sm text-label-secondary dark:text-label-secondary-dark">
                  Keine Maßnahmen an diesem Tag.
                </p>
              )}
            </CardGroup>
          )}
        </>
      )}

      {showSheet && (
        <MeasureFormSheet
          editing={editing}
          categories={categories}
          types={types}
          defaultPlannedDate={selectedDate}
          onClose={() => setShowSheet(false)}
          addMeasure={addMeasure}
          updateMeasure={updateMeasure}
          deleteMeasure={deleteMeasure}
        />
      )}
    </Screen>
  );
}
