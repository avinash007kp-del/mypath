"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Flame,
  Clock,
  CheckCircle2,
  Filter,
  Map,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ActivityDayDetails } from "@/components/analytics/ActivityDayDetails";
import { fetchActivityCalendarAnalytics, fetchRoadmaps } from "@/services/api";
import { HeatmapDay } from "@/types/analytics";
import { IRoadmap } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ActivityCalendarPage() {
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [roadmapId, setRoadmapId] = useState("All");
  const [filterType, setFilterType] = useState<"all" | "sessions" | "topics">("all");
  const [roadmaps, setRoadmaps] = useState<IRoadmap[]>([]);

  const [days, setDays] = useState<HeatmapDay[]>([]);
  const [totalYearHours, setTotalYearHours] = useState(0);
  const [activeDaysCount, setActiveDaysCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Selected date for day inspection drawer
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    fetchRoadmaps().then((r) => setRoadmaps(r));
  }, []);

  const loadCalendar = () => {
    setIsLoading(true);
    fetchActivityCalendarAnalytics({
      year: selectedYear,
      roadmapId,
      filterType,
    })
      .then((res) => {
        setDays(res.days);
        setTotalYearHours(res.totalYearHours);
        setActiveDaysCount(res.activeDaysCount);
      })
      .catch((err) => {
        toast.error("Failed to load activity calendar");
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadCalendar();
  }, [selectedYear, roadmapId, filterType]);

  // Group into weeks (columns of 7 days)
  const weeks = useMemo(() => {
    const cols: HeatmapDay[][] = [];
    let currentWeek: HeatmapDay[] = [];

    days.forEach((day, index) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || index === days.length - 1) {
        cols.push(currentWeek);
        currentWeek = [];
      }
    });

    return cols;
  }, [days]);

  const todayStr = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, []);

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

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#62695D]/40 pb-4 sm:flex-row sm:items-end">
        <div>
          <Link
            href="/analytics"
            className="mb-2 inline-flex items-center gap-1.5 font-mono text-xs text-[#D7FF00] hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Analytics Dashboard
          </Link>
          <h1 className="flex items-center gap-2.5 text-3xl font-black tracking-tight text-[#F3F0E6]">
            <CalendarIcon className="h-7 w-7 text-[#D7FF00]" />
            Annual Learning Activity Calendar
          </h1>
          <p className="mt-1 text-xs text-[#B8B9AA] md:text-sm">
            Brutalist matrix tracking 365 days of deep study sessions and topic completions.
          </p>
        </div>

        {/* Year Navigator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl border border-[#62695D] bg-[#252D26] p-1 font-mono text-xs">
            <button
              onClick={() => setSelectedYear((prev) => prev - 1)}
              className="rounded-lg p-1.5 text-[#B8B9AA] transition-colors hover:bg-[#2C352D] hover:text-[#F3F0E6]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 font-bold text-[#F3F0E6]">{selectedYear}</span>
            <button
              onClick={() => setSelectedYear((prev) => prev + 1)}
              disabled={selectedYear >= new Date().getFullYear()}
              className="rounded-lg p-1.5 text-[#B8B9AA] transition-colors hover:bg-[#2C352D] hover:text-[#F3F0E6] disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedYear(new Date().getFullYear())}
            className="border-[#62695D] font-mono text-xs"
          >
            Current Year
          </Button>
        </div>
      </div>

      {/* KPI Banner */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-[#62695D] bg-[#252D26] p-4">
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#B8B9AA]">
            Total Study Hours
          </span>
          <div className="mt-1 font-mono text-2xl font-black text-[#F3F0E6]">{totalYearHours}h</div>
          <span className="mt-0.5 block font-mono text-[10px] text-[#B8B9AA]">
            Across {selectedYear}
          </span>
        </div>

        <div className="rounded-2xl border border-[#62695D] bg-[#252D26] p-4">
          <span className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-[#D7FF00]">
            <CheckCircle2 className="h-3.5 w-3.5" /> Active Days
          </span>
          <div className="mt-1 font-mono text-2xl font-black text-[#D7FF00]">
            {activeDaysCount}{" "}
            <span className="text-xs font-normal text-[#B8B9AA]">/ {days.length}</span>
          </div>
          <span className="mt-0.5 block font-mono text-[10px] text-[#B8B9AA]">
            {Math.round((activeDaysCount / Math.max(1, days.length)) * 100)}% consistency
          </span>
        </div>

        <div className="rounded-2xl border border-[#62695D] bg-[#252D26] p-4">
          <span className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-[#EDE8D8]">
            <Flame className="h-3.5 w-3.5 text-[#D7FF00]" /> Active Filter
          </span>
          <div className="mt-1 truncate text-xl font-bold capitalize text-[#EDE8D8]">
            {filterType === "all" ? "All Activity" : filterType}
          </div>
          <span className="mt-0.5 block font-mono text-[10px] text-[#B8B9AA]">
            {roadmapId === "All" ? "All roadmaps" : "Specific roadmap"}
          </span>
        </div>

        <div className="rounded-2xl border border-[#62695D] bg-[#252D26] p-4">
          <span className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-[#D7FF00]">
            <Sparkles className="h-3.5 w-3.5" /> Interaction
          </span>
          <div className="mt-1 text-base font-bold text-[#F3F0E6]">Click Any Day</div>
          <span className="mt-0.5 block font-mono text-[10px] text-[#B8B9AA]">
            View detailed session log
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-[#62695D] bg-[#252D26] p-3.5 sm:flex-row sm:items-center">
        {/* Activity Filter Types */}
        <div className="flex items-center gap-1.5 rounded-xl border border-[#62695D] bg-[#202720] p-1 font-mono text-xs">
          {(["all", "sessions", "topics"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={cn(
                "rounded-lg px-3 py-1.5 capitalize transition-colors",
                filterType === type
                  ? "bg-[#D7FF00] font-bold text-[#1B211C]"
                  : "text-[#B8B9AA] hover:text-[#F3F0E6]"
              )}
            >
              {type === "all"
                ? "All Activity"
                : type === "sessions"
                  ? "Sessions Only"
                  : "Topics Only"}
            </button>
          ))}
        </div>

        {/* Roadmap Filter */}
        <div className="flex items-center gap-2">
          <select
            value={roadmapId}
            onChange={(e) => setRoadmapId(e.target.value)}
            className="cursor-pointer rounded-xl border border-[#62695D] bg-[#202720] px-3 py-1.5 font-mono text-xs text-[#EDE8D8] focus:border-[#D7FF00] focus:outline-none"
          >
            <option value="All">All Roadmaps</option>
            {roadmaps.map((r) => (
              <option key={r._id} value={r._id}>
                {r.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Calendar Heatmap Workspace */}
      <div className="space-y-4 rounded-2xl border border-[#62695D] bg-[#252D26] p-6 shadow-sm">
        {isLoading ? (
          <div className="h-48 animate-pulse rounded-xl bg-[#202720]" />
        ) : (
          <div className="custom-scrollbar overflow-x-auto pb-4">
            <div className="inline-flex gap-1.5 p-2">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1.5">
                  {week.map((day) => {
                    const isToday = day.date === todayStr;
                    return (
                      <div
                        key={day.date}
                        onClick={() => setSelectedDate(day.date)}
                        className={cn(
                          "group relative h-3.5 w-3.5 cursor-pointer rounded-[3px] border transition-all",
                          getIntensityColor(day.intensity),
                          isToday && "z-10 ring-2 ring-[#D7FF00]"
                        )}
                        title={`${day.date}: ${day.hours}h (${day.minutes}m) - ${day.count} sessions`}
                      >
                        {/* Hover Tooltip */}
                        <div className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 -translate-x-1/2 whitespace-nowrap rounded-xl border border-[#62695D] bg-[#252D26] px-2.5 py-1.5 font-mono text-xs text-[#F3F0E6] opacity-0 shadow-2xl transition-opacity group-hover:opacity-100">
                          <p className="font-bold text-[#D7FF00]">
                            {day.date} {isToday ? "(Today)" : ""}
                          </p>
                          <p className="text-[11px] text-[#F3F0E6]">
                            {day.hours} hrs ({day.minutes} mins)
                          </p>
                          <p className="text-[10px] text-[#B8B9AA]">{day.count} sessions logged</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-col justify-between gap-2 border-t border-[#62695D]/40 pt-3 font-mono text-xs text-[#B8B9AA] sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-[3px] border-2 border-[#D7FF00] bg-transparent" />
            <span>Outlined in Electric Lime = Today</span>
          </div>

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

      {/* Selected Day Inspection Drawer */}
      <ActivityDayDetails
        date={selectedDate}
        roadmapId={roadmapId}
        onClose={() => setSelectedDate(null)}
      />
    </div>
  );
}
