import React, { TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          ref={ref}
          className={cn(
            "w-full rounded-xl border border-[#62695D] bg-[#202720] px-3.5 py-2.5 text-sm text-[#F3F0E6] placeholder:text-[#B8B9AA]/50",
            "transition-colors duration-150 focus:border-[#D7FF00] focus:outline-none focus:ring-1 focus:ring-[#D7FF00]",
            "min-h-[100px] resize-y font-sans disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500/80 focus:border-red-500 focus:ring-red-500/40",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 font-mono text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
