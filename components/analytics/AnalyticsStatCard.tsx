"use client";

import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyticsStatCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  change?: number; // percentage
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor?: string; // hex or tailwind class
  badgeText?: string;
  footerText?: string;
  isLoading?: boolean;
}

export function AnalyticsStatCard({
  title,
  value,
  subValue,
  change,
  trend = "neutral",
  trendLabel,
  icon: Icon,
  badgeText,
  footerText,
  isLoading = false,
}: AnalyticsStatCardProps) {
  if (isLoading) {
    return (
      <div className="h-36 animate-pulse rounded-2xl border border-[#62695D] bg-[#252D26] p-5" />
    );
  }

  return (
    <div className="group flex flex-col justify-between rounded-2xl border border-[#62695D] bg-[#252D26] p-5 shadow-sm transition-all hover:border-[#D7FF00] hover:bg-[#2C352D]">
      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="truncate font-mono text-[11px] font-bold uppercase tracking-wider text-[#B8B9AA]">
            {title}
          </span>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#62695D] bg-[#202720] text-[#D7FF00] transition-colors group-hover:border-[#D7FF00]">
            <Icon className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-mono text-3xl font-bold tracking-tight text-[#F3F0E6]">
            {value}
          </span>
          {subValue && <span className="font-mono text-xs text-[#B8B9AA]">{subValue}</span>}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-[#62695D]/40 pt-2.5 text-xs">
        {change !== undefined ? (
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            {trend === "up" ? (
              <span className="flex items-center gap-0.5 font-bold text-[#D7FF00]">
                <TrendingUp className="h-3.5 w-3.5" />+{change}%
              </span>
            ) : trend === "down" ? (
              <span className="flex items-center gap-0.5 font-bold text-red-400">
                <TrendingDown className="h-3.5 w-3.5" />
                {change}%
              </span>
            ) : (
              <span className="flex items-center gap-0.5 text-[#B8B9AA]">
                <Minus className="h-3.5 w-3.5" /> 0%
              </span>
            )}
            <span className="text-[#B8B9AA]">{trendLabel || "vs prev"}</span>
          </div>
        ) : badgeText ? (
          <span className="font-mono text-[11px] font-bold text-[#D7FF00]">{badgeText}</span>
        ) : (
          <span className="font-mono text-[11px] text-[#B8B9AA]">
            {footerText || "Active tracking"}
          </span>
        )}
      </div>
    </div>
  );
}
