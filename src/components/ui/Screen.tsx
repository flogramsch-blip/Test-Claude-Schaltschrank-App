import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";

interface ScreenProps {
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  onBack?: () => void;
  children: ReactNode;
}

export function Screen({ title, subtitle, trailing, onBack, children }: ScreenProps) {
  return (
    <div className="min-h-dvh bg-surface-grouped pb-28 dark:bg-surface-grouped-dark">
      <header className="sticky top-0 z-10 border-b border-separator/0 bg-surface-grouped/80 px-5 pt-12 pb-2 backdrop-blur-xl dark:bg-surface-grouped-dark/80">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-1 flex items-center gap-1 text-[15px] font-medium text-ios-blue"
            aria-label="Zurück"
          >
            <ChevronLeft size={20} />
            Zurück
          </button>
        )}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-label dark:text-label-dark">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-0.5 text-sm text-label-secondary dark:text-label-secondary-dark">
                {subtitle}
              </p>
            )}
          </div>
          {trailing}
        </div>
      </header>
      <main className="px-4 pt-2">{children}</main>
    </div>
  );
}
