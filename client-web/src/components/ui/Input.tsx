"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-[var(--neutral-200)] bg-[var(--background)] px-3 py-1 text-sm text-[var(--foreground)] shadow-sm transition-colors placeholder:text-[var(--neutral-400)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--neutral-400)] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
