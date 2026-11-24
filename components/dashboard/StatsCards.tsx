import React from "react";
import { DashboardStats } from "@/types";
import { Skeleton } from "@/components/ui/Skeleton";

interface StatsCardsProps {
  stats: DashboardStats | null;
  isLoading: boolean;
  completionRate?: number;
}

export function StatsCards({ stats, isLoading, completionRate }: StatsCardsProps) {
  if (isLoading) {
    return (
      <section className="grid grid-cols-1 gap-space-md md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex h-48 animate-pulse flex-col justify-between rounded-DEFAULT border border-outline-variant/30 bg-surface-container p-space-lg"
          >
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20 bg-surface-container-high" />
              <Skeleton className="h-4 w-16 bg-surface-container-high" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-28 bg-surface-container-high" />
              <Skeleton className="h-12 w-20 bg-surface-container-high" />
            </div>
            <Skeleton className="h-4 w-full bg-surface-container-high" />
          </div>
        ))}
      </section>
    );
  }

  const roadmapsCount = stats?.totalRoadmaps ?? 0;
  const roadmapsFormatted = String(roadmapsCount).padStart(2, "0");
  const hoursCount = stats?.totalLearningHours ?? 0;
  const topicsCompleted = stats?.topicsCompleted ?? 0;
  const topicsInProgress = stats?.topicsInProgress ?? 0;
  const totalTopics = topicsCompleted + topicsInProgress;
  const calcRate =
    completionRate ?? (totalTopics > 0 ? Math.round((topicsCompleted / totalTopics) * 100) : 0);

  // Compute filled segments out of 10
  const activeSegments = Math.round((calcRate / 100) * 10);

  return (
    <section className="grid grid-cols-1 gap-space-md md:grid-cols-3">
      {/* Stat Card 1: ACTIVE ROADMAPS */}
      <div className="group relative flex flex-col justify-between overflow-hidden rounded-DEFAULT border border-outline-variant/20 bg-surface-container p-space-lg transition-colors hover:border-outline-variant/50 hover:bg-surface-container-high">
        {/* Structural corner tick */}
        <div className="absolute right-0 top-0 h-4 w-4 bg-primary-container" />
        <div className="mb-space-md flex items-center justify-between">
          <span className="font-label-md text-label-md uppercase tracking-wider text-outline">
            // STAT_01
          </span>
          <span className="rounded-DEFAULT bg-primary-container/40 px-space-xs py-0.5 font-label-sm text-label-sm uppercase text-primary">
            INDEX.ACT
          </span>
        </div>

        <div className="flex flex-col gap-space-xs">
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
            ACTIVE ROADMAPS
          </span>
          <div className="flex items-baseline gap-space-sm">
            <span className="font-headline-xl text-headline-xl font-bold tracking-tight text-on-surface">
              {roadmapsFormatted}
            </span>
            <span className="font-label-md text-label-md text-secondary">PROGRAMS</span>
          </div>
        </div>

        <div className="mt-space-md flex items-center justify-between border-t border-outline-variant/20 pt-space-md text-on-surface-variant">
          <span className="font-label-sm text-label-sm uppercase tracking-wide">
            {topicsInProgress > 0
              ? `0${topicsInProgress} IN PROGRESS // 01 CRITICAL`
              : "02 ON TRACK // 01 CRITICAL"}
          </span>
          <span className="material-symbols-outlined text-base text-secondary">trending_up</span>
        </div>
      </div>

      {/* Stat Card 2: LEARNING HOURS */}
      <div className="group relative flex flex-col justify-between overflow-hidden rounded-DEFAULT border border-outline-variant/20 bg-surface-container p-space-lg transition-colors hover:border-outline-variant/50 hover:bg-surface-container-high">
        <div className="absolute right-0 top-0 h-4 w-4 bg-secondary-container" />
        <div className="mb-space-md flex items-center justify-between">
          <span className="font-label-md text-label-md uppercase tracking-wider text-outline">
            // STAT_02
          </span>
          <span className="rounded-DEFAULT bg-secondary-container/40 px-space-xs py-0.5 font-label-sm text-label-sm uppercase text-secondary">
            +18.4 HRS / WK
          </span>
        </div>

        <div className="flex flex-col gap-space-xs">
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
            ACCUMULATED TIME
          </span>
          <div className="flex items-baseline gap-space-sm">
            <span className="font-headline-xl text-headline-xl font-bold tracking-tight text-on-surface">
              {hoursCount}
            </span>
            <span className="font-label-md text-label-md text-tertiary-fixed">HOURS</span>
          </div>
        </div>

        {/* Micro Sparkline SVG */}
        <div className="mt-space-md flex items-center justify-between gap-space-md border-t border-outline-variant/20 pt-space-md">
          <div className="h-6 flex-1">
            <svg className="h-full w-full text-secondary" fill="none" viewBox="0 0 140 24">
              <path
                d="M0 18 L20 14 L40 19 L60 8 L80 12 L100 4 L120 7 L140 2"
                stroke="currentColor"
                strokeLinecap="square"
                strokeWidth="2"
              />
              <circle cx="140" cy="2" fill="#d9eaa9" r="3" />
            </svg>
          </div>
          <span className="whitespace-nowrap font-label-sm text-label-sm uppercase text-tertiary-fixed">
            7-DAY SURGE
          </span>
        </div>
      </div>

      {/* Stat Card 3: COMPLETION RATE */}
      <div className="group relative flex flex-col justify-between overflow-hidden rounded-DEFAULT border border-outline-variant/20 bg-surface-container p-space-lg transition-colors hover:border-outline-variant/50 hover:bg-surface-container-high">
        <div className="absolute right-0 top-0 h-4 w-4 bg-tertiary-container" />
        <div className="mb-space-md flex items-center justify-between">
          <span className="font-label-md text-label-md uppercase tracking-wider text-outline">
            // STAT_03
          </span>
          <span className="rounded-DEFAULT bg-tertiary-container px-space-xs py-0.5 font-label-sm text-label-sm uppercase text-tertiary">
            AGGREGATE
          </span>
        </div>

        <div className="flex flex-col gap-space-xs">
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
            CURRICULUM COMPLETION
          </span>
          <div className="flex items-baseline gap-space-sm">
            <span className="font-headline-xl text-headline-xl font-bold tracking-tight text-tertiary-fixed">
              {calcRate}%
            </span>
            <span className="font-label-md text-label-md text-on-surface-variant">AVERAGE</span>
          </div>
        </div>

        {/* Segmented Structural Progress Bar */}
        <div className="mt-space-md flex flex-col gap-space-xs border-t border-outline-variant/20 pt-space-md">
          <div className="grid h-2 w-full grid-cols-10 gap-1">
            {[...Array(10)].map((_, idx) => (
              <div
                key={idx}
                className={
                  idx < activeSegments - 1
                    ? "bg-secondary"
                    : idx === activeSegments - 1
                      ? "bg-tertiary-fixed"
                      : "bg-surface-variant"
                }
              />
            ))}
          </div>
          <div className="flex justify-between pt-0.5 font-label-sm text-label-sm text-outline">
            <span>TARGET: 85% BY Q2</span>
            <span className="text-tertiary-fixed">+4% DELTA</span>
          </div>
        </div>
      </div>
    </section>
  );
}
