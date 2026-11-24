"use client";

import React from "react";
import { LearningHabitsAnalytics } from "@/types/analytics";
import { Sun, Sunset, Moon, Clock } from "lucide-react";

interface LearningHabitsProps {
  data: LearningHabitsAnalytics;
  isLoading?: boolean;
}

export function LearningHabits({ data, isLoading }: LearningHabitsProps) {
  if (isLoading) {
    return (
      <div className="h-64 animate-pulse rounded-2xl border border-[#62695D] bg-[#252D26] p-6" />
    );
  }

  const { timeDistribution } = data;

  return (
    <div className="space-y-5 rounded-2xl border border-[#62695D] bg-[#252D26] p-6 shadow-sm">
      <div>
        <h3 className="flex items-center gap-2 text-sm font-bold text-[#F3F0E6]">
          <Clock className="h-4 w-4 text-[#D7FF00]" />
          Study Habits &amp; Peak Focus Windows
        </h3>
        <p className="mt-0.5 text-xs text-[#B8B9AA]">
          Behavioral insights calculated from actual session start timestamps
        </p>
      </div>

      {/* 4 Habit KPI Badges */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-[#62695D] bg-[#202720] p-3.5">
          <span className="font-mono text-[10px] uppercase text-[#B8B9AA]">Top Weekday</span>
          <div className="mt-1 truncate font-mono text-base font-bold text-[#F3F0E6]">
            {data.mostProductiveWeekday}
          </div>
          <span className="font-mono text-[10px] text-[#B8B9AA]">Highest minutes</span>
        </div>

        <div className="rounded-xl border border-[#62695D] bg-[#202720] p-3.5">
          <span className="font-mono text-[10px] uppercase text-[#B8B9AA]">Avg Session</span>
          <div className="mt-1 font-mono text-base font-bold text-[#EDE8D8]">
            {data.averageSessionDurationMinutes}m
          </div>
          <span className="font-mono text-[10px] text-[#B8B9AA]">Per focus block</span>
        </div>

        <div className="rounded-xl border border-[#62695D] bg-[#202720] p-3.5">
          <span className="font-mono text-[10px] uppercase text-[#B8B9AA]">Longest Session</span>
          <div className="mt-1 font-mono text-base font-bold text-[#EDE8D8]">
            {data.longestSessionMinutes}m
          </div>
          <span className="font-mono text-[10px] text-[#B8B9AA]">Personal record</span>
        </div>

        <div className="rounded-xl border border-[#62695D] bg-[#202720] p-3.5">
          <span className="font-mono text-[10px] uppercase text-[#B8B9AA]">Preferred Window</span>
          <div className="mt-1 font-mono text-base font-bold text-[#D7FF00]">
            {data.preferredStudyTime}
          </div>
          <span className="font-mono text-[10px] text-[#B8B9AA]">Peak alertness</span>
        </div>
      </div>

      {/* Time-of-Day Proportion Bar */}
      <div className="space-y-2 border-t border-[#62695D]/40 pt-2">
        <div className="flex items-center justify-between font-mono text-xs text-[#EDE8D8]">
          <span>Time-of-Day Distribution:</span>
          <span className="font-sans text-[11px] text-[#B8B9AA]">
            Morning vs Afternoon vs Evening
          </span>
        </div>

        {/* Stacked Progress Bar */}
        <div className="flex h-3 w-full overflow-hidden rounded-full border border-[#62695D] bg-[#202720]">
          <div
            style={{ width: `${timeDistribution.morning.percent}%` }}
            className="bg-amber-400 transition-all hover:opacity-90"
            title={`Morning: ${timeDistribution.morning.hours}h (${timeDistribution.morning.percent}%)`}
          />
          <div
            style={{ width: `${timeDistribution.afternoon.percent}%` }}
            className="bg-[#D7FF00] transition-all hover:opacity-90"
            title={`Afternoon: ${timeDistribution.afternoon.hours}h (${timeDistribution.afternoon.percent}%)`}
          />
          <div
            style={{ width: `${timeDistribution.evening.percent}%` }}
            className="bg-sky-400 transition-all hover:opacity-90"
            title={`Evening: ${timeDistribution.evening.hours}h (${timeDistribution.evening.percent}%)`}
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-1 gap-2.5 pt-1 text-xs sm:grid-cols-3">
          <div className="flex items-center gap-2.5 rounded-xl border border-[#62695D] bg-[#202720] p-2.5">
            <Sun className="h-4 w-4 shrink-0 text-amber-400" />
            <div className="min-w-0">
              <span className="block truncate font-semibold text-[#F3F0E6]">
                Morning (05:00 - 12:00)
              </span>
              <span className="font-mono text-[11px] text-[#B8B9AA]">
                {timeDistribution.morning.hours}h ({timeDistribution.morning.percent}%)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl border border-[#62695D] bg-[#202720] p-2.5">
            <Sunset className="h-4 w-4 shrink-0 text-[#D7FF00]" />
            <div className="min-w-0">
              <span className="block truncate font-semibold text-[#F3F0E6]">
                Afternoon (12:00 - 17:00)
              </span>
              <span className="font-mono text-[11px] text-[#B8B9AA]">
                {timeDistribution.afternoon.hours}h ({timeDistribution.afternoon.percent}%)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl border border-[#62695D] bg-[#202720] p-2.5">
            <Moon className="h-4 w-4 shrink-0 text-sky-400" />
            <div className="min-w-0">
              <span className="block truncate font-semibold text-[#F3F0E6]">
                Evening (17:00 - 05:00)
              </span>
              <span className="font-mono text-[11px] text-[#B8B9AA]">
                {timeDistribution.evening.hours}h ({timeDistribution.evening.percent}%)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
