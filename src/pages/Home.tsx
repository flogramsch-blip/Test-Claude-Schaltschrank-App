import { useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useMeasures } from "../hooks/useMeasures";
import { useMeasureTypes } from "../hooks/useMeasureTypes";
import { Screen } from "../components/ui/Screen";
import { CardGroup, Card } from "../components/ui/Card";
import { ProgressBar } from "../components/ui/ProgressBar";
import { formatEuro, formatDate } from "../lib/format";
import { STATUS_LABELS } from "../types";

export function Home() {
  const { user } = useAuth();
  const { measures } = useMeasures(user?.householdId ?? null);
  const { types } = useMeasureTypes(user?.householdId ?? null);

  const totals = useMemo(() => {
    const soll = measures.reduce((sum, m) => sum + m.sollCost, 0);
    const ist = measures.reduce((sum, m) => sum + (m.istCost ?? 0), 0);
    const offen = measures.filter((m) => m.istCost === null).length;
    return { soll, ist, offen, diff: ist - soll };
  }, [measures]);

  const byType = useMemo(() => {
    return types.map((type) => {
      const items = measures.filter((m) => m.typeId === type.id);
      return {
        type,
        soll: items.reduce((sum, m) => sum + m.sollCost, 0),
        ist: items.reduce((sum, m) => sum + (m.istCost ?? 0), 0),
        count: items.length,
      };
    });
  }, [measures, types]);

  const recent = useMemo(
    () => [...measures].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 5),
    [measures],
  );

  return (
    <Screen title="Übersicht" subtitle={`Hallo, ${user?.displayName ?? ""} 👋`}>
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

      <CardGroup title="Nach Art der Maßnahme">
        {byType.map(({ type, soll, ist, count }) => (
          <div key={type.id} className="px-4 py-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="flex items-center gap-2 text-[15px] text-label dark:text-label-dark">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: type.color }} />
                {type.name}
                <span className="text-xs text-label-tertiary dark:text-label-tertiary-dark">
                  ({count})
                </span>
              </span>
              <span className="text-[15px] font-medium text-label dark:text-label-dark">
                {formatEuro(ist)} / {formatEuro(soll)}
              </span>
            </div>
            <ProgressBar value={ist} max={soll} color={type.color} />
          </div>
        ))}
        {byType.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-label-secondary dark:text-label-secondary-dark">
            Noch keine Maßnahmenarten angelegt.
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
    </Screen>
  );
}
