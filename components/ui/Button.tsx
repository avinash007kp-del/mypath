import React, { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "lime" | "ivory";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-bold tracking-tight transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#D7FF00]/40 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-xl";

    const variants = {
      primary:
        "bg-[#D7FF00] text-[#111512] hover:bg-[#c4eb00] shadow-sm active:scale-[0.98] border border-[#D7FF00]",
      lime: "bg-[#D7FF00] text-[#111512] hover:bg-[#c4eb00] shadow-sm active:scale-[0.98] border border-[#D7FF00]",
      secondary:
        "bg-[#EDE8D8] text-[#111512] hover:bg-[#ded7c3] border border-[#EDE8D8] active:scale-[0.98]",
      ivory:
        "bg-[#EDE8D8] text-[#111512] hover:bg-[#ded7c3] border border-[#EDE8D8] active:scale-[0.98]",
      outline:
        "border border-[#65685B] bg-[#171C18] text-[#F3F0E6] hover:bg-[#202720] hover:border-[#D7FF00] hover:text-[#D7FF00]",
      ghost: "text-[#A5A79B] hover:bg-[#202720] hover:text-[#F3F0E6]",
      danger:
        "bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20 hover:border-rose-500/50",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-9 px-4 text-xs gap-2",
      lg: "h-11 px-6 text-sm gap-2.5",
      icon: "h-9 w-9 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="-ml-1 mr-2 h-4 w-4 animate-spin text-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
