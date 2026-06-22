import type { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "plain";
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  fullWidth,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "rounded-xl px-4 py-3 text-[15px] font-semibold transition active:opacity-70 disabled:opacity-40",
        fullWidth && "w-full",
        variant === "primary" && "bg-ios-blue text-white",
        variant === "secondary" && "bg-surface-secondary text-ios-blue dark:bg-surface-elevated-dark",
        variant === "destructive" && "bg-ios-red text-white",
        variant === "plain" && "bg-transparent text-ios-blue px-2 py-1",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
