"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { RoadmapDistributionItem } from "@/types/analytics";
import { PieChart as PieIcon } from "lucide-react";

interface LearningDistributionChartProps {
  data: RoadmapDistributionItem[];
  totalHours: number;
  isLoading?: boolean;
}

export function LearningDistributionChart({
  data,
  totalHours,
  isLoading,
}: LearningDistributionChartProps) {
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
            <PieIcon className="h-4 w-4 text-[#D7FF00]" />
            Learning Distribution by Roadmap
          </h3>
          <p className="mt-0.5 text-xs text-[#B8B9AA]">
            Share of total focus time dedicated to each domain
          </p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-[#62695D] font-mono text-xs text-[#B8B9AA]">
          No roadmap study sessions logged yet
        </div>
      ) : (
        <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-2">
          {/* Donut Chart with Center Text */}
          <div className="relative flex h-56 w-full items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as RoadmapDistributionItem;
                      return (
                        <div className="space-y-1 rounded-xl border border-[#62695D] bg-[#252D26] p-3 font-mono text-xs shadow-2xl">
                          <p className="font-bold text-[#F3F0E6]">{item.title}</p>
                          <p className="text-[#B8B9AA]">{item.category}</p>
                          <p className="text-[#D7FF00]">
                            {item.hours}h ({item.percentage}%)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="hours"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="#252D26"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Center Label */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-2xl font-black text-[#F3F0E6]">{totalHours}h</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#B8B9AA]">
                Total Time
              </span>
            </div>
          </div>

          {/* Legend Items */}
          <div className="custom-scrollbar max-h-56 space-y-2 overflow-y-auto pr-1">
            {data.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl border border-[#62695D] bg-[#202720] p-2.5 text-xs"
              >
                <div className="flex min-w-0 items-center gap-2 pr-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="truncate font-medium text-[#F3F0E6]">{item.title}</span>
                </div>
                <div className="shrink-0 text-right font-mono">
                  <span className="font-bold text-[#D7FF00]">{item.hours}h</span>{" "}
                  <span className="text-[11px] text-[#B8B9AA]">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
