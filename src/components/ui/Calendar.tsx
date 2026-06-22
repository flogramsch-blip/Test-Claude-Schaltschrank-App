import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { de } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

interface CalendarProps {
  month: Date;
  onMonthChange: (month: Date) => void;
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  markerCounts: Map<string, number>;
}

function dateKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function Calendar({ month, onMonthChange, selectedDate, onSelectDate, markerCounts }: CalendarProps) {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
  const days: Date[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) days.push(d);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => onMonthChange(subMonths(month, 1))}
          className="rounded-full p-1.5 text-ios-blue active:bg-surface-secondary dark:active:bg-black/40"
          aria-label="Vorheriger Monat"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-[15px] font-semibold text-label dark:text-label-dark">
          {format(month, "MMMM yyyy", { locale: de })}
        </span>
        <button
          onClick={() => onMonthChange(addMonths(month, 1))}
          className="rounded-full p-1.5 text-ios-blue active:bg-surface-secondary dark:active:bg-black/40"
          aria-label="Nächster Monat"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-label-tertiary dark:text-label-tertiary-dark">
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((day) => {
          const count = markerCounts.get(dateKey(day)) ?? 0;
          const inMonth = isSameMonth(day, month);
          const selected = selectedDate && isSameDay(day, selectedDate);
          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelectDate(day)}
              className={clsx(
                "flex aspect-square flex-col items-center justify-center rounded-xl text-[13px]",
                selected
                  ? "bg-ios-blue text-white"
                  : isToday(day)
                    ? "text-ios-blue"
                    : inMonth
                      ? "text-label dark:text-label-dark"
                      : "text-label-tertiary dark:text-label-tertiary-dark",
              )}
            >
              {format(day, "d")}
              <span
                className={clsx(
                  "mt-0.5 h-1 w-1 rounded-full",
                  count > 0 ? (selected ? "bg-white" : "bg-ios-blue") : "bg-transparent",
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
