"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { CheckCircle2, TrendingUp } from "lucide-react";

interface CompletionChartProps {
  statusDistribution: {
    notStarted: number;
    inProgress: number;
    completed: number;
    onHold: number;
  };
  trend: Array<{ period: string; count: number }>;
  isLoading?: boolean;
}

export function CompletionChart({ statusDistribution, trend, isLoading }: CompletionChartProps) {
  if (isLoading) {
    return (
      <div className="h-72 animate-pulse rounded-2xl border border-[#62695D] bg-[#252D26] p-6" />
    );
  }

  const pieData = [
    { name: "Completed", value: statusDistribution.completed, color: "#D7FF00" },
    { name: "In Progress", value: statusDistribution.inProgress, color: "#EDE8D8" },
    { name: "Not Started", value: statusDistribution.notStarted, color: "#62695D" },
    { name: "On Hold", value: statusDistribution.onHold, color: "#2C352D" },
  ].filter((d) => d.value > 0);

  const totalTopics =
    statusDistribution.completed +
    statusDistribution.inProgress +
    statusDistribution.notStarted +
    statusDistribution.onHold;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* 1. Status Distribution Donut */}
      <div className="space-y-4 rounded-2xl border border-[#62695D] bg-[#252D26] p-6 shadow-sm">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold text-[#F3F0E6]">
            <CheckCircle2 className="h-4 w-4 text-[#D7FF00]" />
            Topic Status Breakdown
          </h3>
          <p className="mt-0.5 text-xs text-[#B8B9AA]">
            Active topic allocation across your curriculums
          </p>
        </div>

        {totalTopics === 0 ? (
          <div className="flex h-48 items-center justify-center font-mono text-xs text-[#B8B9AA]">
            No roadmap topics registered
          </div>
        ) : (
          <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-2">
            <div className="relative flex h-48 items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0];
                        return (
                          <div className="rounded-xl border border-[#62695D] bg-[#252D26] p-3 font-mono text-xs shadow-xl">
                            <span className="font-bold text-[#F3F0E6]">{item.name}: </span>
                            <span className="text-[#D7FF00]">{item.value} topics</span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
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
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-xl font-bold text-[#F3F0E6]">{totalTopics}</span>
                <span className="font-mono text-[10px] text-[#B8B9AA]">Topics</span>
              </div>
            </div>

            {/* Legend Breakdown */}
            <div className="space-y-2">
              {pieData.map((d) => (
                <div
                  key={d.name}
                  className="flex items-center justify-between rounded-xl border border-[#62695D] bg-[#202720] p-2 font-mono text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: d.color }}
                    />
                    <span className="font-sans text-[#F3F0E6]">{d.name}</span>
                  </div>
                  <span className="font-bold text-[#D7FF00]">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. Topic Completion Trend Over Time */}
      <div className="space-y-4 rounded-2xl border border-[#62695D] bg-[#252D26] p-6 shadow-sm">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold text-[#F3F0E6]">
            <TrendingUp className="h-4 w-4 text-[#D7FF00]" />
            Topic Completion Velocity
          </h3>
          <p className="mt-0.5 text-xs text-[#B8B9AA]">
            Cumulative completed learning milestones over time
          </p>
        </div>

        <div className="h-48 w-full">
          {trend.length === 0 ? (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-[#62695D] font-mono text-xs text-[#B8B9AA]">
              No recorded topic completions in this interval
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  allowDecimals={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as { period: string; count: number };
                      return (
                        <div className="space-y-1 rounded-xl border border-[#62695D] bg-[#252D26] p-3 font-mono text-xs shadow-xl">
                          <p className="font-bold text-[#D7FF00]">{item.period}</p>
                          <p className="text-[#F3F0E6]">{item.count} topics completed</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#D7FF00"
                  strokeWidth={2.5}
                  dot={{ fill: "#D7FF00", r: 3 }}
                  activeDot={{ r: 5, fill: "#EDE8D8" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
