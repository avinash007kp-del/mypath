"use client";

import React from "react";
import Link from "next/link";
import { RoadmapProgressItem } from "@/types/analytics";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { Trophy, Clock, ArrowRight, AlertCircle } from "lucide-react";

interface RoadmapProgressListProps {
  roadmaps: RoadmapProgressItem[];
  highestProgress: RoadmapProgressItem | null;
  lowestProgress: RoadmapProgressItem | null;
  recentlyUpdated: RoadmapProgressItem | null;
  isLoading?: boolean;
}

export function RoadmapProgressList({
  roadmaps,
  highestProgress,
  lowestProgress,
  recentlyUpdated,
  isLoading,
}: RoadmapProgressListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl border border-[#62695D] bg-[#252D26]"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 3 Callout Cards for Leaders */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {/* Highest Progress */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#62695D] bg-[#252D26] p-4 shadow-sm">
          <span className="flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#D7FF00]">
            <Trophy className="h-3.5 w-3.5" /> Top Performing Roadmap
          </span>
          <div className="my-2">
            <h4 className="truncate text-sm font-bold text-[#F3F0E6]">
              {highestProgress?.title || "None yet"}
            </h4>
            <p className="mt-0.5 font-mono text-xs text-[#B8B9AA]">
              {highestProgress?.completionPercentage || 0}% Completed
            </p>
          </div>
          {highestProgress && (
            <Link
              href={`/roadmaps/${highestProgress._id}/editor`}
              className="flex items-center gap-1 pt-1 font-mono text-[11px] text-[#D7FF00] hover:underline"
            >
              Open Editor <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>

        {/* Lowest Progress Active */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#62695D] bg-[#252D26] p-4 shadow-sm">
          <span className="flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#EDE8D8]">
            <AlertCircle className="h-3.5 w-3.5" /> Needs Momentum
          </span>
          <div className="my-2">
            <h4 className="truncate text-sm font-bold text-[#F3F0E6]">
              {lowestProgress?.title || "All Caught Up!"}
            </h4>
            <p className="mt-0.5 font-mono text-xs text-[#B8B9AA]">
              {lowestProgress
                ? `${lowestProgress.completionPercentage}% Completed`
                : "No lagging curriculums"}
            </p>
          </div>
          {lowestProgress && (
            <Link
              href={`/roadmaps/${lowestProgress._id}/editor`}
              className="flex items-center gap-1 pt-1 font-mono text-[11px] text-[#EDE8D8] hover:underline"
            >
              Jump Back In <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>

        {/* Recently Updated */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#62695D] bg-[#252D26] p-4 shadow-sm">
          <span className="flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#D7FF00]">
            <Clock className="h-3.5 w-3.5" /> Recently Updated
          </span>
          <div className="my-2">
            <h4 className="truncate text-sm font-bold text-[#F3F0E6]">
              {recentlyUpdated?.title || "None"}
            </h4>
            <p className="mt-0.5 font-mono text-xs text-[#B8B9AA]">
              {recentlyUpdated ? recentlyUpdated.updatedAt.substring(0, 10) : ""}
            </p>
          </div>
          {recentlyUpdated && (
            <Link
              href={`/roadmaps/${recentlyUpdated._id}/editor`}
              className="flex items-center gap-1 pt-1 font-mono text-[11px] text-[#D7FF00] hover:underline"
            >
              Continue Work <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>

      {/* Full Roadmaps List */}
      <div className="space-y-3">
        {roadmaps.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#62695D] p-6 py-12 text-center font-mono text-xs text-[#B8B9AA]">
            No roadmaps match the selected filter.
          </div>
        ) : (
          roadmaps.map((r) => (
            <div
              key={r._id}
              className="space-y-3 rounded-2xl border border-[#62695D] bg-[#252D26] p-5 shadow-sm transition-all hover:border-[#D7FF00]/60"
            >
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div className="flex min-w-0 items-center gap-2.5">
                  <h4 className="truncate text-sm font-bold text-[#F3F0E6]">{r.title}</h4>
                  <Badge
                    variant="outline"
                    className="border-[#62695D] py-0 text-[10px] text-[#EDE8D8]"
                  >
                    {r.category}
                  </Badge>
                  <span
                    className={`rounded border px-2 py-0.5 font-mono text-[10px] ${
                      r.status === "Completed"
                        ? "border-[#D7FF00]/40 bg-[#D7FF00]/15 text-[#D7FF00]"
                        : "border-[#62695D] bg-[#202720] text-[#B8B9AA]"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>

                <div className="flex shrink-0 items-center gap-4 font-mono text-xs text-[#B8B9AA]">
                  <span>
                    Topics:{" "}
                    <strong className="text-[#F3F0E6]">
                      {r.completedTopics} / {r.totalTopics}
                    </strong>
                  </span>
                  <span>
                    Invested: <strong className="text-[#D7FF00]">{r.actualHours}h</strong>{" "}
                    <span className="text-[#B8B9AA]/70">/ est {r.estimatedHours}h</span>
                  </span>
                  <Link
                    href={`/roadmaps/${r._id}/editor`}
                    className="flex items-center gap-1 font-bold text-[#D7FF00] hover:underline"
                  >
                    Edit →
                  </Link>
                </div>
              </div>

              {/* Progress Bar & Ratios */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-[#B8B9AA]">{r.remainingTopics} topics remaining</span>
                  <span className="font-bold text-[#D7FF00]">{r.completionPercentage}%</span>
                </div>
                <ProgressBar value={r.completionPercentage} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
