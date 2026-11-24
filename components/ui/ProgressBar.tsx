import React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0 to 100
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ProgressBar({
  value,
  showLabel = false,
  size = "md",
  className,
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, Math.round(value)));

  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-1.5 flex items-center justify-between">
        {showLabel && (
          <span className="font-mono text-xs font-medium text-[#A5A79B]">Progress</span>
        )}
        {showLabel && (
          <span className="font-mono text-xs font-bold text-[#D7FF00]">{clampedValue}%</span>
        )}
      </div>
      <div
        className={cn(
          "w-full overflow-hidden rounded-full border border-[#65685B] bg-[#202720]",
          sizeClasses[size]
        )}
      >
        <div
          className="h-full rounded-full bg-[#D7FF00] transition-all duration-500 ease-out"
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}
