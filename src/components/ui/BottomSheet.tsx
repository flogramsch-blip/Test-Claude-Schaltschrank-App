import type { ReactNode } from "react";
import { X } from "lucide-react";

interface BottomSheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function BottomSheet({ open, title, onClose, children }: BottomSheetProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-t-2xl bg-surface pb-[max(1.5rem,env(safe-area-inset-bottom))] dark:bg-surface-elevated-dark"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-separator px-4 py-3 dark:border-separator-dark">
          <h2 className="text-base font-semibold text-label dark:text-label-dark">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-full bg-surface-secondary p-1.5 text-label-secondary dark:bg-surface-dark dark:text-label-secondary-dark"
          >
            <X size={16} />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto px-4 py-4">{children}</div>
      </div>
    </div>
  );
}
