import React, { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error, icon, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="relative flex items-center">
          {icon && <div className="pointer-events-none absolute left-3 text-[#A5A79B]">{icon}</div>}
          <input
            type={type}
            ref={ref}
            className={cn(
              "w-full rounded-xl border border-[#65685B] bg-[#202720] px-3.5 py-2 text-sm text-[#F3F0E6] placeholder:text-[#A5A79B]/50",
              "transition-colors duration-150 focus:border-[#D7FF00] focus:outline-none focus:ring-1 focus:ring-[#D7FF00]",
              "font-sans disabled:cursor-not-allowed disabled:opacity-50",
              icon && "pl-9",
              error && "border-red-500/80 focus:border-red-500 focus:ring-red-500/40",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1.5 font-mono text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
