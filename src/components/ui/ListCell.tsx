import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import clsx from "clsx";

interface ListCellProps {
  label: ReactNode;
  value?: ReactNode;
  detail?: ReactNode;
  leading?: ReactNode;
  chevron?: boolean;
  onClick?: () => void;
  destructive?: boolean;
}

export function ListCell({ label, value, detail, leading, chevron, onClick, destructive }: ListCellProps) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={clsx(
        "flex w-full items-center gap-3 px-4 py-3 text-left active:bg-surface-secondary dark:active:bg-black/40",
        onClick && "cursor-pointer",
      )}
    >
      {leading}
      <div className="flex-1 min-w-0">
        <div
          className={clsx(
            "text-[15px]",
            destructive ? "text-ios-red" : "text-label dark:text-label-dark",
          )}
        >
          {label}
        </div>
        {detail && (
          <div className="text-xs text-label-secondary dark:text-label-secondary-dark">
            {detail}
          </div>
        )}
      </div>
      {value && (
        <div className="shrink-0 text-[15px] text-label-secondary dark:text-label-secondary-dark">
          {value}
        </div>
      )}
      {chevron && <ChevronRight size={18} className="shrink-0 text-label-tertiary dark:text-label-tertiary-dark" />}
    </Tag>
  );
}
