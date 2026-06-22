import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useMeasures } from "../hooks/useMeasures";
import { useMeasureTypes } from "../hooks/useMeasureTypes";
import { Screen } from "../components/ui/Screen";
import { CardGroup } from "../components/ui/Card";
import { BottomSheet } from "../components/ui/BottomSheet";
import { Field } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { formatEuro } from "../lib/format";
import { STATUS_LABELS, type Measure, type MeasureStatus } from "../types";

const EMPTY_FORM = {
  name: "",
  typeId: "",
  sollCost: "",
  istCost: "",
  status: "geplant" as MeasureStatus,
  notes: "",
};

export function Vergleich() {
  const { user } = useAuth();
  const householdId = user?.householdId ?? null;
  const { measures, addMeasure, updateMeasure, deleteMeasure } = useMeasures(householdId);
  const { types } = useMeasureTypes(householdId);

  const [editing, setEditing] = useState<Measure | null>(null);
  const [showSheet, setShowSheet] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const sorted = useMemo(() => [...measures].sort((a, b) => a.name.localeCompare(b.name)), [measures]);
  const typeById = useMemo(() => new Map(types.map((t) => [t.id, t])), [types]);

  function openNew() {
    setEditing(null);
    setForm({ ...EMPTY_FORM, typeId: types[0]?.id ?? "" });
    setShowSheet(true);
  }

  function openEdit(m: Measure) {
    setEditing(m);
    setForm({
      name: m.name,
      typeId: m.typeId,
      sollCost: String(m.sollCost),
      istCost: m.istCost === null ? "" : String(m.istCost),
      status: m.status,
      notes: m.notes,
    });
    setShowSheet(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: form.name,
      typeId: form.typeId,
      sollCost: Number(form.sollCost) || 0,
      istCost: form.istCost === "" ? null : Number(form.istCost),
      status: form.status,
      notes: form.notes,
    };
    if (editing) {
      await updateMeasure(editing.id, payload);
    } else {
      await addMeasure(payload);
    }
    setShowSheet(false);
  }

  async function handleDelete() {
    if (!editing) return;
    await deleteMeasure(editing.id);
    setShowSheet(false);
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
                  {type?.name ?? "Unbekannt"} · {STATUS_LABELS[m.status]}
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

      <BottomSheet
        open={showSheet}
        title={editing ? "Maßnahme bearbeiten" : "Neue Maßnahme"}
        onClose={() => setShowSheet(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <Field
            label="Bezeichnung"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="z. B. Badezimmer Fliesen"
            required
          />
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-label-secondary dark:text-label-secondary-dark">
              Art der Maßnahme
            </span>
            <select
              value={form.typeId}
              onChange={(e) => setForm((f) => ({ ...f, typeId: e.target.value }))}
              className="w-full rounded-xl border border-separator bg-surface px-3.5 py-2.5 text-[15px] text-label outline-none focus:border-ios-blue dark:border-separator-dark dark:bg-surface-elevated-dark dark:text-label-dark"
              required
            >
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Sollkosten (€)"
              type="number"
              inputMode="decimal"
              value={form.sollCost}
              onChange={(e) => setForm((f) => ({ ...f, sollCost: e.target.value }))}
              placeholder="0"
              required
            />
            <Field
              label="Istkosten (€)"
              type="number"
              inputMode="decimal"
              value={form.istCost}
              onChange={(e) => setForm((f) => ({ ...f, istCost: e.target.value }))}
              placeholder="noch offen"
            />
          </div>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-label-secondary dark:text-label-secondary-dark">
              Status
            </span>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as MeasureStatus }))}
              className="w-full rounded-xl border border-separator bg-surface px-3.5 py-2.5 text-[15px] text-label outline-none focus:border-ios-blue dark:border-separator-dark dark:bg-surface-elevated-dark dark:text-label-dark"
            >
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <Field
            label="Notizen"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="Optional"
          />
          <Button type="submit" fullWidth>
            {editing ? "Speichern" : "Hinzufügen"}
          </Button>
          {editing && (
            <Button type="button" variant="destructive" fullWidth onClick={handleDelete}>
              <span className="flex items-center justify-center gap-2">
                <Trash2 size={16} /> Löschen
              </span>
            </Button>
          )}
        </form>
      </BottomSheet>
    </Screen>
  );
}
