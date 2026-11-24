"use client";

import React from "react";
import { WeeklyProgressAnalytics } from "@/types/analytics";
import { TrendingUp, TrendingDown, Sparkles, Flame, CalendarCheck, BookOpen } from "lucide-react";

interface WeeklyInsightsProps {
  insights: WeeklyProgressAnalytics["insights"];
  summary: WeeklyProgressAnalytics["currentWeek"];
  comparison: WeeklyProgressAnalytics["comparison"];
  isLoading?: boolean;
}

export function WeeklyInsights({ insights, summary, comparison, isLoading }: WeeklyInsightsProps) {
  if (isLoading) {
    return (
      <div className="h-64 animate-pulse rounded-2xl border border-[#62695D] bg-[#252D26] p-6" />
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-[#62695D] bg-[#252D26] p-6 shadow-sm">
      <div>
        <h3 className="flex items-center gap-2 text-sm font-bold text-[#F3F0E6]">
          <Sparkles className="h-4 w-4 text-[#D7FF00]" />
          Weekly Performance Insights
        </h3>
        <p className="mt-0.5 text-xs text-[#B8B9AA]">
          Objective metric comparisons based on your recorded study logs
        </p>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <div className="rounded-xl border border-[#62695D] bg-[#202720] p-3.5">
          <span className="font-mono text-[10px] uppercase text-[#B8B9AA]">Target</span>
          <div className="mt-0.5 font-mono text-lg font-bold text-[#F3F0E6]">
            {summary.actualHours}h{" "}
            <span className="text-xs font-normal text-[#B8B9AA]">/ {summary.targetHours}h</span>
          </div>
          <span className="font-mono text-[10px] text-[#D7FF00]">
            {summary.completionPercentage}% hit
          </span>
        </div>

        <div className="rounded-xl border border-[#62695D] bg-[#202720] p-3.5">
          <span className="font-mono text-[10px] uppercase text-[#B8B9AA]">Velocity</span>
          <div className="mt-0.5 flex items-center gap-1 font-mono text-lg font-bold">
            {comparison.hoursPercentChange >= 0 ? (
              <span className="flex items-center gap-0.5 text-[#D7FF00]">
                <TrendingUp className="h-4 w-4" />+{comparison.hoursPercentChange}%
              </span>
            ) : (
              <span className="flex items-center gap-0.5 text-red-400">
                <TrendingDown className="h-4 w-4" />
                {comparison.hoursPercentChange}%
              </span>
            )}
          </div>
          <span className="font-mono text-[10px] text-[#B8B9AA]">vs prev week</span>
        </div>

        <div className="rounded-xl border border-[#62695D] bg-[#202720] p-3.5">
          <span className="font-mono text-[10px] uppercase text-[#B8B9AA]">Topics Done</span>
          <div className="mt-0.5 font-mono text-lg font-bold text-[#F3F0E6]">
            {summary.topicsCompleted}
          </div>
          <span className="font-mono text-[10px] text-[#B8B9AA]">
            {comparison.topicsDiff >= 0 ? `+${comparison.topicsDiff}` : comparison.topicsDiff} vs
            prev
          </span>
        </div>

        <div className="rounded-xl border border-[#62695D] bg-[#202720] p-3.5">
          <span className="font-mono text-[10px] uppercase text-[#B8B9AA]">Sessions</span>
          <div className="mt-0.5 font-mono text-lg font-bold text-[#F3F0E6]">
            {summary.sessionsCompleted}
          </div>
          <span className="font-mono text-[10px] text-[#EDE8D8]">Deep work blocks</span>
        </div>
      </div>

      {/* Bulleted Insights */}
      <div className="space-y-2 border-t border-[#62695D]/40 pt-2 text-xs">
        <div className="flex items-center justify-between rounded-xl border border-[#62695D] bg-[#202720] p-2.5">
          <span className="flex items-center gap-2 text-[#B8B9AA]">
            <Flame className="h-3.5 w-3.5 text-amber-400" />
            Most Productive Day
          </span>
          <span className="font-mono font-bold text-[#F3F0E6]">{insights.mostProductiveDay}</span>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-[#62695D] bg-[#202720] p-2.5">
          <span className="flex items-center gap-2 text-[#B8B9AA]">
            <CalendarCheck className="h-3.5 w-3.5 text-[#B8B9AA]" />
            Least Active Day
          </span>
          <span className="font-mono font-bold text-[#EDE8D8]">{insights.leastActiveDay}</span>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-[#62695D] bg-[#202720] p-2.5">
          <span className="flex items-center gap-2 text-[#B8B9AA]">
            <BookOpen className="h-3.5 w-3.5 text-[#D7FF00]" />
            Most Focused Domain
          </span>
          <span className="max-w-[200px] truncate font-mono font-bold text-[#D7FF00]">
            {insights.mostStudiedRoadmap}
          </span>
        </div>
      </div>
    </div>
  );
}
