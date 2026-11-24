"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { WeeklyProgressAnalytics } from "@/types/analytics";
import { CalendarRange } from "lucide-react";

interface WeeklyComparisonChartProps {
  data: WeeklyProgressAnalytics["weeklyActivity"];
  isLoading?: boolean;
}

export function WeeklyComparisonChart({ data, isLoading }: WeeklyComparisonChartProps) {
  if (isLoading) {
    return (
      <div className="h-72 animate-pulse rounded-2xl border border-[#62695D] bg-[#252D26] p-6" />
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-[#62695D] bg-[#252D26] p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold text-[#F3F0E6]">
            <CalendarRange className="h-4 w-4 text-[#D7FF00]" />
            Weekly Comparison (Current vs Previous Week)
          </h3>
          <p className="mt-0.5 text-xs text-[#B8B9AA]">
            Day-by-day study volume comparison Monday through Sunday
          </p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#62695D"
              strokeOpacity={0.4}
              vertical={false}
            />
            <XAxis
              dataKey="day"
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
                  const curr = payload.find((p) => p.dataKey === "currentWeekHours")?.value || 0;
                  const prev = payload.find((p) => p.dataKey === "previousWeekHours")?.value || 0;
                  const label = payload[0].payload.day;
                  return (
                    <div className="space-y-1 rounded-xl border border-[#62695D] bg-[#252D26] p-3 font-mono text-xs shadow-2xl">
                      <p className="font-bold text-[#D7FF00]">{label}</p>
                      <p className="text-[#D7FF00]">Current Week: {curr}h</p>
                      <p className="text-[#B8B9AA]">Previous Week: {prev}h</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              formatter={(value) => (
                <span className="font-mono text-xs text-[#F3F0E6]">
                  {value === "currentWeekHours" ? "Current Week" : "Previous Week"}
                </span>
              )}
            />
            <Bar dataKey="previousWeekHours" fill="#2C352D" radius={[4, 4, 0, 0]} maxBarSize={20} />
            <Bar dataKey="currentWeekHours" fill="#D7FF00" radius={[4, 4, 0, 0]} maxBarSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
