"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FolderKanban, GitBranch, Plus, ArrowUpRight } from "lucide-react";
import { fetchRoadmaps } from "@/services/api";
import { IRoadmap } from "@/types";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ProjectsPage() {
  const [roadmaps, setRoadmaps] = useState<IRoadmap[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRoadmaps()
      .then((data) => setRoadmaps(data))
      .catch((err) => console.error("Error loading roadmaps for projects:", err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6 pb-16">
      {/* Editorial Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#62695D]/40 pb-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded border border-[#62695D] bg-[#2C352D] px-2 py-0.5 font-mono text-[11px] uppercase tracking-widest text-[#D7FF00]">
              CAPSTONE / PORTFOLIO
            </span>
          </div>
          <h1 className="flex items-center gap-2.5 text-3xl font-black tracking-tight text-[#F3F0E6]">
            <FolderKanban className="h-7 w-7 text-[#D7FF00]" />
            Hands-on Projects
          </h1>
          <p className="mt-1 max-w-2xl text-xs text-[#B8B9AA] md:text-sm">
            Validate and demonstrate your roadmap knowledge with practical coding implementations
            and production deployments.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-[#B8B9AA]">
          <span className="rounded border border-[#62695D] bg-[#252D26] px-2.5 py-1">
            <strong className="text-[#D7FF00]">{roadmaps.length}</strong> Projects Tracked
          </span>
        </div>
      </div>

      {/* Projects Grid or Empty State */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-2xl border border-[#62695D] bg-[#252D26] p-5"
            >
              <Skeleton className="mb-4 h-4 w-20 bg-[#2C352D]" />
              <Skeleton className="mb-2 h-6 w-3/4 bg-[#2C352D]" />
              <Skeleton className="h-4 w-full bg-[#2C352D]" />
            </div>
          ))}
        </div>
      ) : roadmaps.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="h-10 w-10 text-[#D7FF00]" />}
          title="No projects tracked yet"
          description="Create your first learning roadmap to automatically unlock milestone capstones and practical implementations."
          actionLabel="Create Roadmap"
          onAction={() => {
            window.location.href = "/roadmaps/create";
          }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {roadmaps.map((r) => (
            <Link
              key={r._id}
              href={`/roadmaps/${r._id}`}
              className="group flex flex-col justify-between rounded-2xl border border-[#62695D] bg-[#252D26] p-5 shadow-sm transition-all hover:border-[#D7FF00]/60 hover:shadow-lg hover:shadow-black/30"
            >
              <div>
                <div className="mb-3.5 flex items-center justify-between">
                  <span
                    className={`rounded border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${
                      r.progress === 100
                        ? "border-[#D7FF00]/40 bg-[#D7FF00]/15 text-[#D7FF00]"
                        : r.progress > 0
                          ? "border-[#EDE8D8]/40 bg-[#EDE8D8]/15 text-[#EDE8D8]"
                          : "border-[#62695D] bg-[#2C352D] text-[#B8B9AA]"
                    }`}
                  >
                    {r.progress === 100 ? "Completed" : r.progress > 0 ? "In Progress" : "Planned"}
                  </span>
                  <span className="font-mono text-[11px] text-[#B8B9AA]">
                    {r.difficulty || "Intermediate"}
                  </span>
                </div>

                <h3 className="mb-2 text-base font-bold leading-snug text-[#F3F0E6] transition-colors group-hover:text-[#D7FF00]">
                  {r.title}
                </h3>
                <p className="mb-3 flex items-center gap-1.5 font-mono text-xs text-[#EDE8D8]">
                  <GitBranch className="h-3 w-3 text-[#D7FF00]" />
                  {r.category || "General Engineering"}
                </p>
                <p className="line-clamp-2 text-xs leading-relaxed text-[#B8B9AA]">
                  {r.description ||
                    "Comprehensive hands-on implementation and architecture design."}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between border-t border-[#62695D]/50 pt-3.5 font-mono text-xs text-[#B8B9AA]">
                <span>
                  {r.completedTopics || 0} / {r.totalTopics || 0} Milestones
                </span>
                <span className="flex items-center gap-1 text-[#D7FF00] group-hover:underline">
                  Inspect <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
