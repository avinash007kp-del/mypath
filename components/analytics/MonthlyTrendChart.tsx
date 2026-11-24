"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { MonthlyTrendItem, TimePeriod } from "@/types/analytics";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface MonthlyTrendChartProps {
  data: MonthlyTrendItem[];
  period: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
  isLoading?: boolean;
}

export function MonthlyTrendChart({
  data,
  period,
  onPeriodChange,
  isLoading,
}: MonthlyTrendChartProps) {
  if (isLoading) {
    return (
      <div className="h-72 animate-pulse rounded-2xl border border-[#62695D] bg-[#252D26] p-6" />
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-[#62695D] bg-[#252D26] p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold text-[#F3F0E6]">
            <TrendingUp className="h-4 w-4 text-[#D7FF00]" />
            Learning Cadence &amp; Hours Trend
          </h3>
          <p className="mt-0.5 text-xs text-[#B8B9AA]">
            Velocity of study time invested across the selected period
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1 self-start rounded-xl border border-[#62695D] bg-[#202720] p-1 sm:self-center">
          {(["daily", "weekly", "monthly"] as TimePeriod[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPeriodChange(p)}
              className={cn(
                "rounded-lg px-2.5 py-1 font-mono text-[11px] capitalize transition-all",
                period === p
                  ? "bg-[#D7FF00] font-bold text-[#1B211C]"
                  : "text-[#B8B9AA] hover:text-[#F3F0E6]"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 w-full">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-[#62695D] font-mono text-xs text-[#B8B9AA]">
            No session activity in this interval
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="hoursGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D7FF00" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#D7FF00" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#62695D"
                strokeOpacity={0.4}
                vertical={false}
              />
              <XAxis
                dataKey="period"
                stroke="#B8B9AA"
                fontSize={11}
                fontFamily="monospace"
                tickLine={false}
                axisLine={{ stroke: "#62695D" }}
              />
              <YAxis
                stroke="#B8B9AA"
                fontSize={11}
                fontFamily="monospace"
                tickLine={false}
                axisLine={{ stroke: "#62695D" }}
                unit="h"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as MonthlyTrendItem;
                    return (
                      <div className="space-y-1 rounded-xl border border-[#62695D] bg-[#252D26] p-3 font-mono text-xs shadow-2xl">
                        <p className="font-bold text-[#D7FF00]">{item.period}</p>
                        <p className="text-[#F3F0E6]">{item.hours} hours logged</p>
                        <p className="text-[11px] text-[#B8B9AA]">
                          {item.sessions} sessions completed
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="hours"
                stroke="#D7FF00"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#hoursGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
