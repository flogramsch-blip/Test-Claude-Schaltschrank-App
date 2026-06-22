import { useState } from "react";
import { format } from "date-fns";
import { Plus, Trash2, X } from "lucide-react";
import { BottomSheet } from "../ui/BottomSheet";
import { Field } from "../ui/Input";
import { Button } from "../ui/Button";
import { STATUS_LABELS } from "../../types";
import type { Attachment, Category, FundingEntry, Measure, MeasureStatus, MeasureType } from "../../types";

interface MeasureFormSheetProps {
  editing: Measure | null;
  categories: Category[];
  types: MeasureType[];
  defaultCategoryId?: string;
  defaultPlannedDate?: Date | null;
  onClose: () => void;
  addMeasure: (
    data: Omit<Measure, "id" | "createdBy" | "updatedBy" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  updateMeasure: (id: string, data: Partial<Omit<Measure, "id" | "createdBy" | "createdAt">>) => Promise<void>;
  deleteMeasure: (id: string) => Promise<void>;
}

function toDateInput(value: number | null) {
  return value ? format(new Date(value), "yyyy-MM-dd") : "";
}

function fromDateInput(value: string) {
  return value ? new Date(`${value}T00:00:00`).getTime() : null;
}

function buildInitialForm(editing: Measure | null, categories: Category[], defaultCategoryId?: string) {
  if (editing) {
    return {
      name: editing.name,
      categoryId: editing.categoryId,
      typeId: editing.typeId,
      sollCost: String(editing.sollCost),
      istCost: editing.istCost === null ? "" : String(editing.istCost),
      status: editing.status,
      notes: editing.notes,
      company: editing.company,
      location: editing.location,
      contact: editing.contact,
      supervisor: editing.supervisor,
      material: editing.material,
      isFundable: editing.isFundable,
      fundingPercent: editing.fundingPercent === null ? "" : String(editing.fundingPercent),
      energyConsultantRequested: editing.energyConsultantRequested,
      offerObtained: editing.offerObtained,
      plannedStart: toDateInput(editing.plannedStart),
      plannedEnd: toDateInput(editing.plannedEnd),
      attachments: editing.attachments,
      fundingEntries: editing.fundingEntries,
    };
  }
  return {
    name: "",
    categoryId: defaultCategoryId ?? categories[0]?.id ?? "",
    typeId: "",
    sollCost: "",
    istCost: "",
    status: "geplant" as MeasureStatus,
    notes: "",
    company: "",
    location: "",
    contact: "",
    supervisor: "",
    material: "",
    isFundable: false,
    fundingPercent: "",
    energyConsultantRequested: false,
    offerObtained: false,
    plannedStart: "",
    plannedEnd: "",
    attachments: [] as Attachment[],
    fundingEntries: [] as FundingEntry[],
  };
}

const selectClass =
  "w-full rounded-xl border border-separator bg-surface px-3.5 py-2.5 text-[15px] text-label outline-none focus:border-ios-blue dark:border-separator-dark dark:bg-surface-elevated-dark dark:text-label-dark";
const labelClass =
  "mb-1 block text-xs font-semibold uppercase tracking-wide text-label-secondary dark:text-label-secondary-dark";

export function MeasureFormSheet({
  editing,
  categories,
  types,
  defaultCategoryId,
  defaultPlannedDate,
  onClose,
  addMeasure,
  updateMeasure,
  deleteMeasure,
}: MeasureFormSheetProps) {
  const [form, setForm] = useState(() => {
    const initial = buildInitialForm(editing, categories, defaultCategoryId);
    if (!editing && defaultPlannedDate) {
      initial.plannedStart = format(defaultPlannedDate, "yyyy-MM-dd");
    }
    return initial;
  });

  function addAttachment() {
    setForm((f) => ({
      ...f,
      attachments: [...f.attachments, { id: crypto.randomUUID(), label: "", url: "", addedAt: Date.now() }],
    }));
  }

  function updateAttachment(id: string, patch: Partial<Attachment>) {
    setForm((f) => ({
      ...f,
      attachments: f.attachments.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }));
  }

  function removeAttachment(id: string) {
    setForm((f) => ({ ...f, attachments: f.attachments.filter((a) => a.id !== id) }));
  }

  function addFundingEntry() {
    setForm((f) => ({
      ...f,
      fundingEntries: [
        ...f.fundingEntries,
        { id: crypto.randomUUID(), amount: 0, note: "", receivedAt: null, createdAt: Date.now() },
      ],
    }));
  }

  function updateFundingEntry(id: string, patch: Partial<FundingEntry>) {
    setForm((f) => ({
      ...f,
      fundingEntries: f.fundingEntries.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  }

  function removeFundingEntry(id: string) {
    setForm((f) => ({ ...f, fundingEntries: f.fundingEntries.filter((e) => e.id !== id) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: form.name,
      categoryId: form.categoryId,
      typeId: form.typeId,
      sollCost: Number(form.sollCost) || 0,
      istCost: form.istCost === "" ? null : Number(form.istCost),
      status: form.status,
      notes: form.notes,
      company: form.company,
      location: form.location,
      contact: form.contact,
      supervisor: form.supervisor,
      material: form.material,
      isFundable: form.isFundable,
      fundingPercent: form.fundingPercent === "" ? null : Number(form.fundingPercent),
      energyConsultantRequested: form.energyConsultantRequested,
      offerObtained: form.offerObtained,
      plannedStart: fromDateInput(form.plannedStart),
      plannedEnd: fromDateInput(form.plannedEnd),
      attachments: form.attachments,
      fundingEntries: form.fundingEntries,
    };
    if (editing) {
      await updateMeasure(editing.id, payload);
    } else {
      await addMeasure(payload);
    }
    onClose();
  }

  async function handleDelete() {
    if (!editing) return;
    await deleteMeasure(editing.id);
    onClose();
  }

  return (
    <BottomSheet open title={editing ? "Maßnahme bearbeiten" : "Neue Maßnahme"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Field
          label="Bezeichnung"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="z. B. Badezimmer Fliesen"
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className={labelClass}>Kategorie</span>
            <select
              value={form.categoryId}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              className={selectClass}
              required
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={labelClass}>Art der Durchführung</span>
            <select
              value={form.typeId}
              onChange={(e) => setForm((f) => ({ ...f, typeId: e.target.value }))}
              className={selectClass}
              required
            >
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
        </div>

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
          <span className={labelClass}>Status</span>
          <select
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as MeasureStatus }))}
            className={selectClass}
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Geplanter Start"
            type="date"
            value={form.plannedStart}
            onChange={(e) => setForm((f) => ({ ...f, plannedStart: e.target.value }))}
          />
          <Field
            label="Geplantes Ende"
            type="date"
            value={form.plannedEnd}
            onChange={(e) => setForm((f) => ({ ...f, plannedEnd: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Firma"
            value={form.company}
            onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
            placeholder="Optional"
          />
          <Field
            label="Ort"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            placeholder="Optional"
          />
        </div>

        <Field
          label="Kontaktinformationen"
          value={form.contact}
          onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
          placeholder="Telefon, E-Mail, Ansprechpartner"
        />
        <Field
          label="Bauleitung / Aufsicht"
          value={form.supervisor}
          onChange={(e) => setForm((f) => ({ ...f, supervisor: e.target.value }))}
          placeholder="Wer beaufsichtigt die Baustelle?"
        />
        <Field
          label="Material"
          value={form.material}
          onChange={(e) => setForm((f) => ({ ...f, material: e.target.value }))}
          placeholder="z. B. Kabel, Farbe, Fliesen"
        />
        <Field
          label="Notizen"
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          placeholder="Optional"
        />

        <div className="space-y-2 rounded-xl bg-surface-secondary px-3.5 py-3 dark:bg-surface-elevated-dark">
          <label className="flex items-center justify-between">
            <span className="text-[15px] text-label dark:text-label-dark">Energieberater angefragt</span>
            <input
              type="checkbox"
              checked={form.energyConsultantRequested}
              onChange={(e) => setForm((f) => ({ ...f, energyConsultantRequested: e.target.checked }))}
              className="h-5 w-5 accent-ios-blue"
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-[15px] text-label dark:text-label-dark">Angebot eingeholt</span>
            <input
              type="checkbox"
              checked={form.offerObtained}
              onChange={(e) => setForm((f) => ({ ...f, offerObtained: e.target.checked }))}
              className="h-5 w-5 accent-ios-blue"
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-[15px] text-label dark:text-label-dark">Förderbar</span>
            <input
              type="checkbox"
              checked={form.isFundable}
              onChange={(e) => setForm((f) => ({ ...f, isFundable: e.target.checked }))}
              className="h-5 w-5 accent-ios-blue"
            />
          </label>
          {form.isFundable && (
            <Field
              label="Förderung (%)"
              type="number"
              inputMode="decimal"
              value={form.fundingPercent}
              onChange={(e) => setForm((f) => ({ ...f, fundingPercent: e.target.value }))}
              placeholder="z. B. 20"
            />
          )}
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className={labelClass}>Förderungen / Zahlungseingänge</span>
            <button type="button" onClick={addFundingEntry} className="text-ios-blue">
              <Plus size={18} />
            </button>
          </div>
          <div className="space-y-2">
            {form.fundingEntries.map((entry) => (
              <div key={entry.id} className="flex items-center gap-2 rounded-xl bg-surface-secondary p-2 dark:bg-surface-elevated-dark">
                <input
                  type="number"
                  inputMode="decimal"
                  value={entry.amount}
                  onChange={(e) => updateFundingEntry(entry.id, { amount: Number(e.target.value) || 0 })}
                  placeholder="Betrag €"
                  className="w-20 rounded-lg border border-separator bg-surface px-2 py-1.5 text-[13px] text-label outline-none dark:border-separator-dark dark:bg-surface-dark dark:text-label-dark"
                />
                <input
                  type="text"
                  value={entry.note}
                  onChange={(e) => updateFundingEntry(entry.id, { note: e.target.value })}
                  placeholder="Notiz"
                  className="min-w-0 flex-1 rounded-lg border border-separator bg-surface px-2 py-1.5 text-[13px] text-label outline-none dark:border-separator-dark dark:bg-surface-dark dark:text-label-dark"
                />
                <label className="flex shrink-0 items-center gap-1 text-[11px] text-label-secondary dark:text-label-secondary-dark">
                  <input
                    type="checkbox"
                    checked={entry.receivedAt !== null}
                    onChange={(e) =>
                      updateFundingEntry(entry.id, { receivedAt: e.target.checked ? Date.now() : null })
                    }
                    className="h-4 w-4 accent-ios-blue"
                  />
                  erhalten
                </label>
                <button type="button" onClick={() => removeFundingEntry(entry.id)} className="text-ios-red">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className={labelClass}>Anhänge (Links zu PDFs, Angeboten, Mails)</span>
            <button type="button" onClick={addAttachment} className="text-ios-blue">
              <Plus size={18} />
            </button>
          </div>
          <div className="space-y-2">
            {form.attachments.map((a) => (
              <div key={a.id} className="flex items-center gap-2 rounded-xl bg-surface-secondary p-2 dark:bg-surface-elevated-dark">
                <input
                  type="text"
                  value={a.label}
                  onChange={(e) => updateAttachment(a.id, { label: e.target.value })}
                  placeholder="Bezeichnung"
                  className="w-24 rounded-lg border border-separator bg-surface px-2 py-1.5 text-[13px] text-label outline-none dark:border-separator-dark dark:bg-surface-dark dark:text-label-dark"
                />
                <input
                  type="url"
                  value={a.url}
                  onChange={(e) => updateAttachment(a.id, { url: e.target.value })}
                  placeholder="https://..."
                  className="min-w-0 flex-1 rounded-lg border border-separator bg-surface px-2 py-1.5 text-[13px] text-label outline-none dark:border-separator-dark dark:bg-surface-dark dark:text-label-dark"
                />
                <button type="button" onClick={() => removeAttachment(a.id)} className="text-ios-red">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

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
  );
}
