"use client";

import React from "react";
import Link from "next/link";
import { IRoadmap } from "@/types";
import { Skeleton } from "@/components/ui/Skeleton";

interface RecentRoadmapsProps {
  roadmaps: IRoadmap[];
  isLoading: boolean;
  onRoadmapDeleted?: () => void;
}

interface LearningPathItem {
  id: string;
  category: string;
  categoryClass: string;
  modules: string;
  title: string;
  nextObjective: string;
  progress: number;
  progressColorClass: string;
  statusLabel: string;
  shadowClass?: string;
  titleHoverClass: string;
  arrowActive?: boolean;
}

export function RecentRoadmaps({ roadmaps, isLoading }: RecentRoadmapsProps) {
  const items: LearningPathItem[] =
    roadmaps && roadmaps.length > 0
      ? roadmaps.slice(0, 4).map((r, idx) => {
          return {
            id: r._id,
            category: r.category ? r.category.toUpperCase().slice(0, 10) : "TRACK",
            categoryClass:
              idx === 0
                ? "text-on-secondary bg-secondary"
                : "text-tertiary-fixed bg-surface-container-lowest",
            modules: `${String(r.totalTopics || 0).padStart(2, "0")} TOPICS`,
            title: r.title,
            nextObjective: r.description
              ? r.description.slice(0, 50)
              : "Active engineering pathway",
            progress: r.progress ?? 0,
            progressColorClass:
              idx === 0 ? "bg-tertiary-fixed text-tertiary-fixed" : "bg-secondary text-secondary",
            statusLabel:
              r.progress === 100 ? "COMPLETED" : r.progress > 0 ? "IN PROGRESS" : "QUEUED",
            shadowClass: idx === 0 ? "shadow-[2px_2px_0px_0px_#4e9f3d]" : undefined,
            titleHoverClass: idx === 0 ? "group-hover:text-secondary" : "group-hover:text-primary",
            arrowActive: idx === 0,
          };
        })
      : [];

  return (
    <section className="flex w-full flex-col gap-space-md pt-space-md">
      {/* Header */}
      <div className="flex flex-col justify-between gap-space-xs sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-space-sm">
            <span className="h-2 w-2 bg-tertiary-fixed" />
            <h2 className="font-headline-sm text-headline-sm uppercase tracking-tight text-on-surface">
              MY LEARNING PATHS
            </h2>
          </div>
          <p className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">
            Active curricula registered to your scholar workspace partition
          </p>
        </div>

        <Link
          href="/roadmaps"
          className="flex select-none items-center gap-1 font-label-sm text-label-sm uppercase tracking-wider text-secondary transition-colors hover:text-tertiary-fixed"
        >
          <span>VIEW ALL PATHWAYS [{String(roadmaps?.length || 0).padStart(2, "0")}]</span>
          <span className="material-symbols-outlined text-xs">arrow_forward</span>
        </Link>
      </div>

      {/* 4-Column Roadmap Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-space-md md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex h-64 animate-pulse flex-col justify-between rounded-DEFAULT border border-outline-variant/30 bg-surface-container p-space-lg"
            >
              <div className="space-y-2">
                <Skeleton className="h-4 w-20 bg-surface-container-high" />
                <Skeleton className="h-6 w-3/4 bg-surface-container-high" />
              </div>
              <Skeleton className="h-4 w-full bg-surface-container-high" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-space-md rounded-DEFAULT border border-dashed border-outline-variant/40 bg-surface-container/40 p-space-xl text-center">
          <span className="material-symbols-outlined text-3xl text-outline">account_tree</span>
          <div className="max-w-md space-y-1">
            <h3 className="font-headline-sm text-headline-sm uppercase text-on-surface">
              NO PATHWAYS FOUND
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              You haven&apos;t created or imported any learning paths yet. Initialize your
              curriculum to begin.
            </p>
          </div>
          <Link
            href="/roadmaps/create"
            className="flex items-center gap-space-xs rounded-DEFAULT bg-tertiary-fixed px-space-lg py-space-sm font-label-sm text-label-sm uppercase tracking-wider text-on-tertiary-fixed shadow-[2px_2px_0px_0px_#1e5128] transition-all hover:bg-secondary hover:text-on-secondary"
          >
            <span className="material-symbols-outlined text-sm font-bold">add</span>
            <span>+ CREATE NEW PATHWAY</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-space-md md:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/roadmaps/${item.id}`}
              className={`group relative flex flex-col justify-between rounded-DEFAULT border border-outline-variant/30 bg-surface-container p-space-md transition-all hover:border-secondary hover:bg-surface-container-high ${
                item.shadowClass || ""
              }`}
            >
              {/* Card Meta Header */}
              <div className="flex flex-col gap-space-xs">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-space-xs py-0.5 font-label-sm text-label-sm font-bold uppercase ${item.categoryClass}`}
                  >
                    {item.category}
                  </span>
                  <span className="font-label-sm text-label-sm uppercase text-outline">
                    {item.modules}
                  </span>
                </div>

                <h3
                  className={`mt-space-xs line-clamp-2 font-headline-sm text-headline-sm uppercase tracking-tight text-on-surface transition-colors ${item.titleHoverClass}`}
                >
                  {item.title}
                </h3>
              </div>

              {/* Card Footer: Progress & Objective */}
              <div className="mt-space-lg flex flex-col gap-space-sm border-t border-outline-variant/20 pt-space-sm">
                <div>
                  <span className="font-label-sm text-label-sm uppercase text-outline">
                    NEXT OBJECTIVE
                  </span>
                  <p className="line-clamp-1 font-body-sm text-body-sm text-on-surface-variant">
                    {item.nextObjective}
                  </p>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between font-label-sm text-label-sm">
                    <span className="uppercase text-outline">{item.statusLabel}</span>
                    <span className="font-bold text-on-surface">{item.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden bg-surface-container-lowest">
                    <div
                      className={`h-full transition-all duration-300 ${item.progressColorClass.split(" ")[0]}`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end pt-0.5">
                  <span
                    className={`material-symbols-outlined text-sm transition-transform group-hover:translate-x-1 ${
                      item.arrowActive ? "font-bold text-secondary" : "text-outline"
                    }`}
                  >
                    arrow_forward
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
