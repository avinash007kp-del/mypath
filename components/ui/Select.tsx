import React, { SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  options?: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, options, children, ...props }, ref) => {
    return (
      <div className="w-full">
        <select
          ref={ref}
          className={cn(
            "w-full rounded-xl border border-[#62695D] bg-[#202720] px-3 py-2 text-sm text-[#F3F0E6]",
            "transition-colors duration-150 focus:border-[#D7FF00] focus:outline-none focus:ring-1 focus:ring-[#D7FF00]",
            "cursor-pointer appearance-none font-sans disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500/80 focus:border-red-500 focus:ring-red-500/40",
            className
          )}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  className="bg-[#252D26] py-1 text-[#F3F0E6]"
                >
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error && <p className="mt-1.5 font-mono text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
