"use client";

import React, { useState, useEffect } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { LearningActivityData } from "@/types";
import { Clock, TrendingUp, Calendar, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

interface LearningActivityChartProps {
  activityData: LearningActivityData | null;
  isLoading: boolean;
}

export function LearningActivityChart({ activityData, isLoading }: LearningActivityChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (isLoading || !mounted) {
    return (
      <div className="h-96 animate-pulse rounded-2xl border border-[#65685B] bg-[#171C18] p-6">
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-5 w-44 bg-[#202720]" />
          <Skeleton className="h-5 w-24 bg-[#202720]" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl bg-[#202720]" />
      </div>
    );
  }

  const weeklyData = activityData?.weeklyData || [];
  const totalHours = activityData?.totalHours ?? 0;
  const activeDays = activityData?.activeDaysCount ?? 0;
  const hasActivity = totalHours > 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#65685B] bg-[#171C18] p-6 shadow-sm sm:p-7">
      {/* Header with Lime Square Icon, Title and Metrics */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#65685B]/30 pb-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#D7FF00] font-black text-[#111512] shadow-sm">
            <TrendingUp className="h-4 w-4 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-space text-sm font-bold uppercase tracking-wider text-[#F3F0E6] sm:text-base">
              WEEKLY FOCUS ACTIVITY
            </h3>
            <p className="font-sans text-xs text-[#A5A79B]">
              Daily focus hours and session cadence over trailing 7 days.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-xs">
          <div className="flex items-center gap-1.5 rounded-xl border border-[#65685B] bg-[#202720] px-3 py-1.5">
            <Clock className="h-3.5 w-3.5 text-[#D7FF00]" />
            <span className="font-mono text-[11px] text-[#A5A79B]">Total:</span>
            <span className="font-mono font-bold text-[#D7FF00]">{totalHours} hrs</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-[#65685B] bg-[#202720] px-3 py-1.5">
            <Calendar className="h-3.5 w-3.5 text-[#EDE8D8]" />
            <span className="font-mono text-[11px] text-[#A5A79B]">Cadence:</span>
            <span className="font-mono font-bold text-[#EDE8D8]">{activeDays}/7 days</span>
          </div>
        </div>
      </div>

      {/* Chart or Empty State */}
      <div className="pt-6">
        {!hasActivity ? (
          <div className="my-2 flex flex-col items-center justify-center rounded-xl border border-dashed border-[#65685B]/50 py-12 text-center">
            <div className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl border border-[#65685B] bg-[#202720] text-[#A5A79B]">
              <BookOpen className="h-5 w-5 stroke-[1.5]" />
            </div>
            <p className="font-space text-sm font-semibold uppercase text-[#EDE8D8]">
              No Learning Activity Logged This Week
            </p>
            <p className="mt-1 max-w-sm font-sans text-xs leading-relaxed text-[#A5A79B]">
              Work through your roadmap topics or launch the Study Timer to track focus intervals.
            </p>
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#65685B"
                  opacity={0.3}
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  stroke="#A5A79B"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "#65685B" }}
                />
                <YAxis
                  stroke="#A5A79B"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "#65685B" }}
                  unit="h"
                />
                <Tooltip
                  cursor={{ fill: "rgba(215, 255, 0, 0.05)" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-xl border border-[#65685B] bg-[#171C18] p-3 shadow-2xl">
                          <p className="font-space text-xs font-bold text-[#F3F0E6]">
                            {data.day} ({data.date})
                          </p>
                          <p className="mt-1 font-mono text-xs font-bold text-[#D7FF00]">
                            {data.hours} hours logged
                          </p>
                          {data.topicsCovered > 0 && (
                            <p className="mt-0.5 font-mono text-[11px] text-[#A5A79B]">
                              {data.topicsCovered} topics covered
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="hours" fill="#D7FF00" radius={[6, 6, 0, 0]} maxBarSize={44} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
