import clsx from "clsx";

interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div className="flex rounded-xl bg-surface-secondary p-1 dark:bg-surface-elevated-dark">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={clsx(
            "flex-1 rounded-lg px-3 py-1.5 text-[13px] font-medium transition",
            value === opt.value
              ? "bg-surface text-label shadow-sm dark:bg-black dark:text-label-dark"
              : "text-label-secondary dark:text-label-secondary-dark",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
