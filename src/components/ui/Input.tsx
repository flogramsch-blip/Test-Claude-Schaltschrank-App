import type { InputHTMLAttributes } from "react";
import clsx from "clsx";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Field({ label, className, ...rest }: FieldProps) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-label-secondary dark:text-label-secondary-dark">
          {label}
        </span>
      )}
      <input
        className={clsx(
          "w-full rounded-xl border border-separator bg-surface px-3.5 py-2.5 text-[15px] text-label outline-none focus:border-ios-blue dark:border-separator-dark dark:bg-surface-elevated-dark dark:text-label-dark",
          className,
        )}
        {...rest}
      />
    </label>
  );
}
