import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "../contexts/AuthContext";
import { useMeasures } from "../hooks/useMeasures";
import { useMeasureTypes } from "../hooks/useMeasureTypes";
import { Screen } from "../components/ui/Screen";
import { Card } from "../components/ui/Card";
import { formatEuro } from "../lib/format";
import { useTheme } from "../contexts/ThemeContext";

export function Statistik() {
  const { user } = useAuth();
  const householdId = user?.householdId ?? null;
  const { measures } = useMeasures(householdId);
  const { types } = useMeasureTypes(householdId);
  const { isDark } = useTheme();

  const byType = useMemo(
    () =>
      types
        .map((type) => {
          const items = measures.filter((m) => m.typeId === type.id);
          return {
            name: type.name,
            color: type.color,
            soll: items.reduce((s, m) => s + m.sollCost, 0),
            ist: items.reduce((s, m) => s + (m.istCost ?? 0), 0),
          };
        })
        .filter((t) => t.soll > 0 || t.ist > 0),
    [measures, types],
  );

  const pieData = byType.filter((t) => t.ist > 0).map((t) => ({ name: t.name, value: t.ist, color: t.color }));

  const cumulative = useMemo(() => {
    const withCost = measures
      .filter((m) => m.istCost !== null)
      .sort((a, b) => a.updatedAt - b.updatedAt);
    let running = 0;
    return withCost.map((m) => {
      running += m.istCost ?? 0;
      return { name: m.name, total: running };
    });
  }, [measures]);

  const tickColor = isDark ? "#ebebf599" : "#3c3c4399";
  const gridColor = isDark ? "#54545899" : "#3c3c4329";

  return (
    <Screen title="Statistik" subtitle="Auswertung eurer Sanierung">
      <Card className="mb-6 p-4">
        <h2 className="mb-3 text-sm font-semibold text-label dark:text-label-dark">
          Istkosten nach Art
        </h2>
        {pieData.length === 0 ? (
          <p className="py-8 text-center text-sm text-label-secondary dark:text-label-secondary-dark">
            Noch keine Istkosten erfasst.
          </p>
        ) : pieData.length === 1 ? (
          // A donut chart with a single 100% slice hits a known recharts/d3
          // arc rendering bug (the full-circle sweep degenerates to a sliver),
          // so render the trivial "all one color" case with plain CSS instead.
          <div className="flex flex-col items-center gap-3 py-6">
            <div
              className="h-40 w-40 rounded-full [--ring-hole:#ffffff] dark:[--ring-hole:#1c1c1e]"
              style={{
                background: `radial-gradient(circle, var(--ring-hole) 55px, ${pieData[0].color} 56px)`,
              }}
            />
            <span className="flex items-center gap-2 text-sm text-label dark:text-label-dark">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: pieData[0].color }} />
              {pieData[0].name} · {formatEuro(pieData[0].value)}
            </span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatEuro(Number(v))} />
              <Legend wrapperStyle={{ fontSize: 12, color: tickColor }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card className="mb-6 p-4">
        <h2 className="mb-3 text-sm font-semibold text-label dark:text-label-dark">
          Soll vs. Ist nach Art
        </h2>
        {byType.length === 0 ? (
          <p className="py-8 text-center text-sm text-label-secondary dark:text-label-secondary-dark">
            Noch keine Maßnahmen erfasst.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byType}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: tickColor }} interval={0} />
              <YAxis tick={{ fontSize: 11, fill: tickColor }} />
              <Tooltip formatter={(v) => formatEuro(Number(v))} />
              <Legend wrapperStyle={{ fontSize: 12, color: tickColor }} />
              <Bar dataKey="soll" name="Soll" fill="#8e8e93" radius={[6, 6, 0, 0]} />
              <Bar dataKey="ist" name="Ist" fill="#007aff" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card className="mb-6 p-4">
        <h2 className="mb-3 text-sm font-semibold text-label dark:text-label-dark">
          Kostenverlauf (kumuliert)
        </h2>
        {cumulative.length === 0 ? (
          <p className="py-8 text-center text-sm text-label-secondary dark:text-label-secondary-dark">
            Noch keine Istkosten erfasst.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={cumulative}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="name" tick={false} />
              <YAxis tick={{ fontSize: 11, fill: tickColor }} />
              <Tooltip formatter={(v) => formatEuro(Number(v))} />
              <Bar dataKey="total" name="Gesamt" fill="#34c759" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </Screen>
  );
}
