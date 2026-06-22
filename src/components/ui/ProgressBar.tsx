import clsx from "clsx";

interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
}

export function ProgressBar({ value, max, color }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const overBudget = max > 0 && value > max;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-secondary dark:bg-surface-elevated-dark">
      <div
        className={clsx("h-full rounded-full transition-all", !color && !overBudget && "bg-ios-blue")}
        style={{ width: `${pct}%`, background: overBudget ? "#ff3b30" : color }}
      />
    </div>
  );
}
