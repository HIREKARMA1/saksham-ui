import * as React from "react";
import { cn } from "@/lib/utils";

export interface SqButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function SqButton({
  className,
  variant = "primary",
  size = "md",
  ...props
}: SqButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-transform",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sq-accent)]",
        "disabled:opacity-60 disabled:pointer-events-none",
        variant === "primary" && "bg-[var(--sq-accent)] text-white hover:translate-x-0.5",
        variant === "secondary" &&
          "border border-[var(--sq-border)] text-[var(--sq-ink)] hover:bg-[var(--sq-surface-2)]",
        variant === "ghost" && "text-[var(--sq-muted)] hover:text-[var(--sq-ink)]",
        size === "sm" && "px-3 py-1.5 text-xs",
        size === "md" && "px-5 py-3 text-sm",
        size === "lg" && "px-6 py-3.5 text-base",
        className,
      )}
      {...props}
    />
  );
}
