import type { ReactNode } from "react";

interface TileProps {
  color: string;
  label: ReactNode;
  value: ReactNode;
  sub?: ReactNode;
  onClick?: () => void;
}

export function Tile({ color, label, value, sub, onClick }: TileProps) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className="rounded-3xl bg-surface p-4 text-left shadow-sm dark:bg-surface-elevated-dark"
    >
      <span
        className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full"
        style={{ background: `${color}26` }}
      >
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      </span>
      <p className="truncate text-[13px] font-medium text-label dark:text-label-dark">{label}</p>
      <p className="truncate text-base font-semibold text-label dark:text-label-dark">{value}</p>
      {sub && <p className="truncate text-xs text-label-secondary dark:text-label-secondary-dark">{sub}</p>}
    </Tag>
  );
}
