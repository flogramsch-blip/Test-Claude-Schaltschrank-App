import { useEffect } from "react";

interface SnackbarProps {
  open: boolean;
  message: string;
  actionLabel: string;
  onAction: () => void;
  onDismiss: () => void;
}

export function Snackbar({ open, message, actionLabel, onAction, onDismiss }: SnackbarProps) {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [open, onDismiss]);

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-[calc(76px+env(safe-area-inset-bottom))] z-30 flex justify-center px-4">
      <div className="flex items-center gap-4 rounded-2xl bg-label px-4 py-3 shadow-lg dark:bg-surface-elevated-dark">
        <span className="text-[14px] text-white dark:text-label-dark">{message}</span>
        <button onClick={onAction} className="shrink-0 text-[14px] font-semibold text-ios-teal">
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
