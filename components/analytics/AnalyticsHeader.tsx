"use client";

import React from "react";
import Link from "next/link";
import { BarChart3, RefreshCw, Calendar as CalendarIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DateRangeFilter } from "./DateRangeFilter";
import { RoadmapFilter } from "./RoadmapFilter";
import { AnalyticsExport } from "./AnalyticsExport";
import {
  DateRangePreset,
  AnalyticsFilterState,
  OverviewStats,
  WeeklyProgressAnalytics,
} from "@/types/analytics";
import { IRoadmap } from "@/types";

interface AnalyticsHeaderProps {
  filters: AnalyticsFilterState;
  roadmaps: IRoadmap[];
  onFilterChange: (newFilters: Partial<AnalyticsFilterState>) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  overview?: OverviewStats | null;
  weekly?: WeeklyProgressAnalytics | null;
}

export function AnalyticsHeader({
  filters,
  roadmaps,
  onFilterChange,
  onRefresh,
  isRefreshing = false,
  overview,
  weekly,
}: AnalyticsHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Title & Actions Row */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full border border-[#62695D] bg-[#252D26] px-2.5 py-0.5 font-mono text-[11px] font-semibold text-[#D7FF00]">
            <Sparkles className="h-3 w-3 text-[#D7FF00]" />
            DEEP LEARNING PERFORMANCE INTELLIGENCE
          </div>
          <h1 className="flex items-center gap-2.5 font-mono text-2xl font-bold uppercase tracking-tight text-[#F3F0E6] md:text-3xl">
            <BarChart3 className="h-7 w-7 text-[#D7FF00]" />
            Learning Analytics
          </h1>
          <p className="mt-1 max-w-2xl text-xs text-[#B8B9AA] md:text-sm">
            Understand your learning habits, track your progress and achieve your goals.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/analytics/activity">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5 border-[#62695D] bg-[#202720] font-mono text-xs text-[#D7FF00] hover:border-[#D7FF00]"
            >
              <CalendarIcon className="h-3.5 w-3.5 text-[#D7FF00]" />
              12-Month Calendar
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            isLoading={isRefreshing}
            className="flex items-center gap-1.5 border-[#62695D] bg-[#202720] font-mono text-xs text-[#B8B9AA] hover:text-[#EDE8D8]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>

          <AnalyticsExport filters={filters} overview={overview} weekly={weekly} />
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-[#62695D] bg-[#252D26] p-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-2.5">
          <DateRangeFilter
            value={filters.dateRange}
            startDate={filters.startDate}
            endDate={filters.endDate}
            onChange={(preset, start, end) => {
              onFilterChange({
                dateRange: preset,
                startDate: start,
                endDate: end,
              });
            }}
          />

          <RoadmapFilter
            value={filters.roadmapId || "All"}
            roadmaps={roadmaps}
            onChange={(roadmapId) => onFilterChange({ roadmapId })}
          />
        </div>

        {/* Selected Window Readout */}
        <div className="self-end font-mono text-[11px] text-[#B8B9AA] sm:self-center">
          Scope:{" "}
          <span className="font-bold capitalize text-[#D7FF00]">
            {filters.dateRange === "7d"
              ? "Last 7 Days"
              : filters.dateRange === "30d"
                ? "Last 30 Days"
                : filters.dateRange === "90d"
                  ? "Last 90 Days"
                  : filters.dateRange === "year"
                    ? "Current Year"
                    : filters.dateRange === "all"
                      ? "All Time"
                      : `${filters.startDate || ""} to ${filters.endDate || ""}`}
          </span>
        </div>
      </div>
    </div>
  );
}
