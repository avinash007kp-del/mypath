"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from "recharts";
import { WeeklyDistributionItem } from "@/types/analytics";
import { Clock } from "lucide-react";

interface LearningHoursChartProps {
  data: WeeklyDistributionItem[];
  isLoading?: boolean;
}

export function LearningHoursChart({ data, isLoading }: LearningHoursChartProps) {
  if (isLoading) {
    return (
      <div className="h-72 animate-pulse rounded-2xl border border-[#62695D] bg-[#252D26] p-6" />
    );
  }

  const totalWeekHours = Number(data.reduce((acc, curr) => acc + (curr.hours || 0), 0).toFixed(1));

  return (
    <div className="space-y-4 rounded-2xl border border-[#62695D] bg-[#252D26] p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold text-[#F3F0E6]">
            <Clock className="h-4 w-4 text-[#D7FF00]" />
            Weekly Learning Hours Distribution
          </h3>
          <p className="mt-0.5 text-xs text-[#B8B9AA]">
            Actual study hours invested Monday through Sunday
          </p>
        </div>
        <div className="text-right">
          <span className="font-mono text-xs text-[#B8B9AA]">Week Total:</span>{" "}
          <span className="font-mono text-base font-black text-[#D7FF00]">{totalWeekHours}h</span>
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
                  const item = payload[0].payload as WeeklyDistributionItem;
                  return (
                    <div className="space-y-1 rounded-xl border border-[#62695D] bg-[#252D26] p-3 font-mono text-xs shadow-2xl">
                      <p className="font-bold text-[#D7FF00]">{item.fullDay}</p>
                      <p className="text-[#F3F0E6]">
                        {item.hours} hours ({item.minutes} mins)
                      </p>
                      <p className="text-[11px] text-[#B8B9AA]">
                        {item.sessionCount} study sessions logged
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="hours" radius={[6, 6, 0, 0]} maxBarSize={40}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.hours > 0 ? "#D7FF00" : "#2C352D"}
                  className="cursor-pointer transition-opacity hover:opacity-80"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
