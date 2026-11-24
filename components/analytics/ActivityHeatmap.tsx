"use client";

import React, { useState, useMemo } from "react";
import { HeatmapDay } from "@/types/analytics";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityHeatmapProps {
  days?: HeatmapDay[];
  data?: HeatmapDay[];
  isLoading?: boolean;
  onDayClick?: (date: string) => void;
}

export function ActivityHeatmap({ days, data, isLoading, onDayClick }: ActivityHeatmapProps) {
  const [rangeMonths, setRangeMonths] = useState<3 | 6 | 12>(6);
  const rawDays = days || data || [];

  const filteredDays = useMemo(() => {
    const daysToShow = rangeMonths * 30;
    return rawDays.slice(-daysToShow);
  }, [rawDays, rangeMonths]);

  // Group into columns of 7 days (weeks)
  const weeks = useMemo(() => {
    const cols: HeatmapDay[][] = [];
    let currentWeek: HeatmapDay[] = [];

    filteredDays.forEach((day, index) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || index === filteredDays.length - 1) {
        cols.push(currentWeek);
        currentWeek = [];
      }
    });

    return cols;
  }, [filteredDays]);

  if (isLoading) {
    return (
      <div className="h-64 animate-pulse rounded-2xl border border-[#62695D] bg-[#252D26] p-6" />
    );
  }

  const getIntensityColor = (intensity: number) => {
    switch (intensity) {
      case 4:
        return "bg-[#D7FF00] border-[#EDE8D8]"; // heavy > 2 hrs
      case 3:
        return "bg-[#a3cc00] border-[#D7FF00]"; // medium 1-2 hrs
      case 2:
        return "bg-[#4f613c] border-[#62695D]"; // light 30-60 mins
      case 1:
        return "bg-[#2C352D] border-[#62695D]/60"; // subtle < 30 mins
      default:
        return "bg-[#202720] border-[#2C352D]"; // 0 mins
    }
  };

  const activeDays = filteredDays.filter((d) => d.minutes > 0).length;
  const totalMins = filteredDays.reduce((acc, d) => acc + d.minutes, 0);
  const totalHrs = Number((totalMins / 60).toFixed(1));

  return (
    <div className="space-y-4 rounded-2xl border border-[#62695D] bg-[#252D26] p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold text-[#F3F0E6]">
            <Flame className="h-4 w-4 text-[#D7FF00]" />
            Study Time Activity Heatmap
          </h3>
          <p className="mt-0.5 text-xs text-[#B8B9AA]">
            Consistency matrix tracking daily learning intensity
          </p>
        </div>

        {/* Range Buttons (3m / 6m / 12m) */}
        <div className="flex items-center gap-1 self-start rounded-xl border border-[#62695D] bg-[#202720] p-1 sm:self-center">
          {([3, 6, 12] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setRangeMonths(m)}
              className={cn(
                "rounded-lg px-2.5 py-1 font-mono text-[11px] transition-all",
                rangeMonths === m
                  ? "bg-[#D7FF00] font-bold text-[#1B211C]"
                  : "text-[#B8B9AA] hover:text-[#F3F0E6]"
              )}
            >
              {m} Months
            </button>
          ))}
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="flex items-center gap-6 border-b border-[#62695D]/40 pb-1 font-mono text-xs text-[#B8B9AA]">
        <div>
          Active Days: <span className="font-bold text-[#D7FF00]">{activeDays}</span> /{" "}
          {filteredDays.length}
        </div>
        <div>
          Total Volume: <span className="font-bold text-[#F3F0E6]">{totalHrs}h</span> ({totalMins}m)
        </div>
      </div>

      {/* Grid Canvas */}
      <div className="custom-scrollbar overflow-x-auto pb-2">
        <div className="inline-flex gap-1.5 p-1">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1.5">
              {week.map((day) => (
                <div
                  key={day.date}
                  onClick={() => onDayClick && onDayClick(day.date)}
                  className={cn(
                    "group relative h-3.5 w-3.5 cursor-pointer rounded-[3px] border transition-all",
                    getIntensityColor(day.intensity)
                  )}
                  title={`${day.date}: ${day.hours}h (${day.minutes} mins) - ${day.count} sessions`}
                >
                  {/* Hover Floating Mini Tooltip */}
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-xl border border-[#62695D] bg-[#252D26] px-2.5 py-1 font-mono text-[10px] text-[#F3F0E6] opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                    <p className="font-bold text-[#D7FF00]">{day.date}</p>
                    <p>
                      {day.hours}h ({day.minutes}m) • {day.count} sess
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap Legend */}
      <div className="flex flex-col justify-between gap-2 pt-1 font-mono text-[11px] text-[#B8B9AA] sm:flex-row sm:items-center">
        <span>Click any day square to inspect recorded sessions &amp; notes</span>
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          <span className="h-3 w-3 rounded-[2px] border border-[#2C352D] bg-[#202720]" />
          <span className="h-3 w-3 rounded-[2px] border border-[#62695D]/60 bg-[#2C352D]" />
          <span className="h-3 w-3 rounded-[2px] border border-[#62695D] bg-[#4f613c]" />
          <span className="h-3 w-3 rounded-[2px] border border-[#D7FF00] bg-[#a3cc00]" />
          <span className="h-3 w-3 rounded-[2px] border border-[#EDE8D8] bg-[#D7FF00]" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
