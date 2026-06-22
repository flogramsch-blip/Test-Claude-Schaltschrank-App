import { useMemo, useState } from "react";
import { differenceInDays, eachMonthOfInterval, format } from "date-fns";
import { de } from "date-fns/locale";
import { Pencil, Trash2, X } from "lucide-react";
import type { Measure, MeasureType } from "../../types";
import { STATUS_LABELS } from "../../types";
import { formatDate, formatEuro } from "../../lib/format";

interface TimelineProps {
  measures: Measure[];
  typeById: Map<string, MeasureType>;
  onEdit: (measure: Measure) => void;
  onDelete: (id: string) => void;
}

const PX_PER_DAY = 18;
const LINE_TOP = 90;
const STACK_GAP = 10;
const DOT_GAP = 18;
const MAX_STACK = 3;
const CONTAINER_HEIGHT = LINE_TOP + 40;

function dayKey(timestamp: number) {
  return format(new Date(timestamp), "yyyy-MM-dd");
}

export function Timeline({ measures, typeById, onEdit, onDelete }: TimelineProps) {
  const [popupItems, setPopupItems] = useState<Measure[] | null>(null);

  const { start, end, totalWidth } = useMemo(() => {
    const dates = measures.map((m) => m.plannedStart!).concat(
      measures.filter((m) => m.plannedEnd !== null).map((m) => m.plannedEnd!),
    );
    const start = new Date(Math.min(...dates));
    const end = new Date(Math.max(...dates));
    const days = Math.max(differenceInDays(end, start), 1);
    return { start, end, days, totalWidth: days * PX_PER_DAY + 80 };
  }, [measures]);

  const groups = useMemo(() => {
    const map = new Map<string, Measure[]>();
    for (const m of measures) {
      const key = dayKey(m.plannedStart!);
      map.set(key, [...(map.get(key) ?? []), m]);
    }
    return Array.from(map.entries()).map(([key, items]) => ({
      key,
      items,
      left: differenceInDays(new Date(items[0].plannedStart!), start) * PX_PER_DAY,
    }));
  }, [measures, start]);

  const months = useMemo(
    () => eachMonthOfInterval({ start, end }).map((d) => ({ date: d, left: Math.max(differenceInDays(d, start), 0) * PX_PER_DAY })),
    [start, end],
  );

  const segments = useMemo(
    () =>
      measures
        .filter((m) => m.plannedEnd !== null && m.plannedEnd! > m.plannedStart!)
        .map((m) => ({
          measure: m,
          left: differenceInDays(new Date(m.plannedStart!), start) * PX_PER_DAY,
          width: differenceInDays(new Date(m.plannedEnd!), new Date(m.plannedStart!)) * PX_PER_DAY,
        })),
    [measures, start],
  );

  if (measures.length === 0) {
    return (
      <p className="px-1 py-8 text-center text-sm text-label-secondary dark:text-label-secondary-dark">
        Noch keine Termine geplant. Tippe auf + um eine anstehende Maßnahme einzutragen.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto pb-2">
      <div className="relative" style={{ width: totalWidth, height: CONTAINER_HEIGHT }}>
        <div
          className="absolute left-0 right-0 border-t-2 border-separator dark:border-separator-dark"
          style={{ top: LINE_TOP }}
        />

        {segments.map(({ measure, left, width }) => (
          <div
            key={`seg-${measure.id}`}
            className="absolute h-[2px] rounded-full opacity-50"
            style={{ left, width, top: LINE_TOP - 1, background: typeById.get(measure.typeId)?.color ?? "#8e8e93" }}
          />
        ))}

        {months.map(({ date, left }) => (
          <span
            key={date.toISOString()}
            className="absolute text-[11px] text-label-tertiary dark:text-label-tertiary-dark"
            style={{ left, top: LINE_TOP + 6 }}
          >
            {format(date, "MMM yyyy", { locale: de })}
          </span>
        ))}

        {groups.map(({ key, items, left }) => {
          const visible = items.slice(0, MAX_STACK);
          const overflow = items.length - visible.length;
          return (
            <div key={key} className="absolute left-0 top-0" style={{ left }}>
              {visible.map((m, i) => {
                const color = typeById.get(m.typeId)?.color ?? "#8e8e93";
                return (
                  <div
                    key={m.id}
                    className="group absolute left-0"
                    style={{ top: LINE_TOP - STACK_GAP - i * DOT_GAP }}
                  >
                    <button
                      onClick={() => setPopupItems([m])}
                      aria-label={m.name}
                      className="block h-3.5 w-3.5 -translate-x-1/2 rounded-full ring-2 ring-surface transition-transform hover:scale-125 active:scale-110 dark:ring-surface-dark"
                      style={{ background: color }}
                    />
                    <div className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-lg bg-label px-2 py-1 text-[11px] text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-surface-elevated-dark dark:text-label-dark">
                      {m.name}
                    </div>
                  </div>
                );
              })}
              {overflow > 0 && (
                <button
                  onClick={() => setPopupItems(items)}
                  style={{ top: LINE_TOP - STACK_GAP - MAX_STACK * DOT_GAP }}
                  className="absolute left-0 -translate-x-1/2 rounded-full bg-surface-secondary px-1.5 py-0.5 text-[10px] font-medium text-label-secondary transition-transform hover:scale-110 dark:bg-surface-elevated-dark dark:text-label-secondary-dark"
                >
                  +{overflow}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {popupItems && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setPopupItems(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-surface p-4 shadow-xl dark:bg-surface-elevated-dark"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-base font-semibold text-label dark:text-label-dark">
                {popupItems.length === 1 ? "Maßnahme" : `${popupItems.length} Maßnahmen`}
              </h3>
              <button
                onClick={() => setPopupItems(null)}
                className="rounded-full bg-surface-secondary p-1.5 text-label-secondary dark:bg-surface-dark dark:text-label-secondary-dark"
              >
                <X size={16} />
              </button>
            </div>
            <div className="divide-y divide-separator dark:divide-separator-dark">
              {popupItems.map((m) => (
                <div key={m.id} className="flex items-center gap-3 py-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: typeById.get(m.typeId)?.color ?? "#8e8e93" }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] text-label dark:text-label-dark">{m.name}</p>
                    <p className="text-xs text-label-secondary dark:text-label-secondary-dark">
                      {STATUS_LABELS[m.status]} · {formatDate(m.plannedStart!)} ·{" "}
                      {formatEuro(m.istCost ?? m.sollCost)}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setPopupItems(null);
                      onEdit(m);
                    }}
                    aria-label="Bearbeiten"
                    className="shrink-0 text-ios-blue"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setPopupItems(null);
                      onDelete(m.id);
                    }}
                    aria-label="Löschen"
                    className="shrink-0 text-ios-red"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
