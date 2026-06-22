import { useState } from "react";
import { ChevronDown, ExternalLink, Pencil, Trash2 } from "lucide-react";
import clsx from "clsx";
import type { Measure, MeasureType } from "../../types";
import { STATUS_LABELS } from "../../types";
import { formatDate, formatEuro } from "../../lib/format";
import { netCostAfterFunding } from "../../lib/funding";

interface MeasureInfoDisclosureProps {
  measure: Measure;
  type?: MeasureType;
  onEdit: () => void;
  onDelete?: () => void;
}

function Row({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-3 py-1 text-[13px]">
      <span className="text-label-secondary dark:text-label-secondary-dark">{label}</span>
      <span className="text-right text-label dark:text-label-dark">{value}</span>
    </div>
  );
}

export function MeasureInfoDisclosure({ measure, type, onEdit, onDelete }: MeasureInfoDisclosureProps) {
  const [open, setOpen] = useState(false);
  const net = netCostAfterFunding(measure.istCost, measure.fundingEntries);

  return (
    <div className="px-4 py-3">
      <div className="flex w-full items-center gap-3">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ background: type?.color ?? "#8e8e93" }}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] text-label dark:text-label-dark">{measure.name}</p>
            <p className="text-xs text-label-secondary dark:text-label-secondary-dark">
              {STATUS_LABELS[measure.status]}
              {measure.plannedStart ? ` · ${formatDate(measure.plannedStart)}` : ""}
            </p>
          </div>
          <span className="shrink-0 text-[15px] font-medium text-label dark:text-label-dark">
            {formatEuro(measure.istCost ?? measure.sollCost)}
          </span>
        </button>
        {onDelete && (
          <button onClick={onDelete} aria-label="Maßnahme löschen" className="shrink-0 text-ios-red">
            <Trash2 size={18} />
          </button>
        )}
        <button onClick={() => setOpen((o) => !o)} aria-label="Details ein-/ausblenden" className="shrink-0">
          <ChevronDown
            size={18}
            className={clsx(
              "text-label-tertiary transition-transform dark:text-label-tertiary-dark",
              open && "rotate-180",
            )}
          />
        </button>
      </div>

      {open && (
        <div className="mt-2 rounded-xl bg-surface-secondary px-3 py-2 dark:bg-black/30">
          <Row label="Firma" value={measure.company} />
          <Row label="Ort" value={measure.location} />
          <Row label="Kontakt" value={measure.contact} />
          <Row label="Bauleitung / Aufsicht" value={measure.supervisor} />
          <Row label="Material" value={measure.material} />
          <Row label="Sollkosten" value={formatEuro(measure.sollCost)} />
          {measure.istCost !== null && <Row label="Istkosten" value={formatEuro(measure.istCost)} />}
          <Row
            label="Förderbar"
            value={measure.isFundable ? `Ja${measure.fundingPercent ? ` (${measure.fundingPercent}%)` : ""}` : "Nein"}
          />
          <Row label="Energieberater angefragt" value={measure.energyConsultantRequested ? "Ja" : "Nein"} />
          <Row label="Angebot eingeholt" value={measure.offerObtained ? "Ja" : "Nein"} />
          {measure.notes && (
            <div className="py-1 text-[13px]">
              <p className="text-label-secondary dark:text-label-secondary-dark">Notizen</p>
              <p className="mt-0.5 text-label dark:text-label-dark">{measure.notes}</p>
            </div>
          )}

          {measure.fundingEntries.length > 0 && (
            <div className="py-1 text-[13px]">
              <p className="mb-1 text-label-secondary dark:text-label-secondary-dark">Förderhistorie</p>
              <ul className="space-y-0.5">
                {measure.fundingEntries.map((entry) => (
                  <li key={entry.id} className="flex justify-between text-label dark:text-label-dark">
                    <span>
                      {formatEuro(entry.amount)}
                      {entry.note ? ` · ${entry.note}` : ""}
                    </span>
                    <span
                      className={entry.receivedAt ? "text-ios-green" : "text-label-tertiary dark:text-label-tertiary-dark"}
                    >
                      {entry.receivedAt ? `erhalten ${formatDate(entry.receivedAt)}` : "ausstehend"}
                    </span>
                  </li>
                ))}
              </ul>
              {measure.istCost !== null && (
                <p className="mt-1 font-medium text-label dark:text-label-dark">
                  Netto-Kosten nach Förderung: {formatEuro(net)}
                </p>
              )}
            </div>
          )}

          {measure.attachments.length > 0 && (
            <div className="py-1 text-[13px]">
              <p className="mb-1 text-label-secondary dark:text-label-secondary-dark">Anhänge</p>
              <ul className="space-y-0.5">
                {measure.attachments.map((a) => (
                  <li key={a.id}>
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-ios-blue"
                    >
                      <ExternalLink size={13} />
                      {a.label || a.url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={onEdit}
            className="mt-2 flex items-center gap-1.5 text-[13px] font-medium text-ios-blue"
          >
            <Pencil size={14} />
            Bearbeiten
          </button>
        </div>
      )}
    </div>
  );
}
