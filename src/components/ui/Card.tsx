import type { HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className, ...rest }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-2xl bg-surface shadow-sm dark:bg-surface-elevated-dark",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardGroup({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="mb-6">
      {title && (
        <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-label-secondary dark:text-label-secondary-dark">
          {title}
        </h2>
      )}
      <Card className="divide-y divide-separator overflow-hidden dark:divide-separator-dark">
        {children}
      </Card>
    </section>
  );
}
