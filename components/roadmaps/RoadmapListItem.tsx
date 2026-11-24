"use client";

import React from "react";
import Link from "next/link";
import { Clock, BookOpen, Edit2, Trash2, Eye, Tag, Workflow } from "lucide-react";
import { IRoadmap } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatRelativeTime } from "@/lib/utils";

interface RoadmapListItemProps {
  roadmap: IRoadmap;
  onDeleteRequest?: (roadmap: IRoadmap) => void;
}

export function RoadmapListItem({ roadmap, onDeleteRequest }: RoadmapListItemProps) {
  return (
    <div className="group flex flex-col justify-between gap-4 rounded-xl border border-[#62695D] bg-[#252D26] p-4 transition-all hover:border-[#D7FF00] hover:bg-[#2C352D] md:flex-row md:items-center">
      {/* Left side details */}
      <div className="flex min-w-0 flex-1 items-start gap-3.5">
        <span className="mt-0.5 shrink-0 select-none text-2xl">{roadmap.icon || "🚀"}</span>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <Link href={`/roadmaps/${roadmap._id}`}>
              <h4 className="truncate font-mono text-base font-bold text-[#F3F0E6] transition-colors group-hover:text-[#D7FF00]">
                {roadmap.title}
              </h4>
            </Link>
            <Badge variant="default">{roadmap.category}</Badge>
            <Badge
              variant={
                roadmap.difficulty === "Beginner"
                  ? "beginner"
                  : roadmap.difficulty === "Intermediate"
                    ? "intermediate"
                    : "advanced"
              }
            >
              {roadmap.difficulty}
            </Badge>
          </div>
          <p className="line-clamp-1 text-xs text-[#B8B9AA]">
            {roadmap.description || "No description provided."}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-[11px] text-[#B8B9AA]">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-[#D7FF00]" />
              {roadmap.estimatedDuration}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3 text-[#D7FF00]" />
              {roadmap.completedTopics}/{roadmap.totalTopics} topics
            </span>
            <span>Updated {formatRelativeTime(roadmap.updatedAt)}</span>
            {roadmap.tags?.slice(0, 2).map((t, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded border border-[#62695D]/60 bg-[#202720] px-1.5 py-0.5 font-mono text-[10px] text-[#B8B9AA]"
              >
                <Tag className="h-2 w-2 text-[#D7FF00]" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right side: progress + actions */}
      <div className="flex shrink-0 items-center justify-between gap-4 md:justify-end">
        <div className="w-28 sm:w-36">
          <div className="mb-1 flex justify-between font-mono text-xs">
            <span className="text-[11px] text-[#B8B9AA]">Progress</span>
            <span className="text-xs font-bold text-[#D7FF00]">{roadmap.progress}%</span>
          </div>
          <ProgressBar value={roadmap.progress} size="sm" />
        </div>

        <div className="flex items-center gap-1.5">
          <Link
            href={`/roadmaps/${roadmap._id}/editor`}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#62695D] bg-[#202720] text-[#D7FF00] transition-colors hover:bg-[#D7FF00] hover:text-[#1B211C]"
            title="Open Interactive Editor"
          >
            <Workflow className="h-3.5 w-3.5" />
          </Link>
          <Link
            href={`/roadmaps/${roadmap._id}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#62695D] bg-[#202720] text-[#B8B9AA] transition-colors hover:border-[#D7FF00] hover:text-[#EDE8D8]"
            title="View Details"
          >
            <Eye className="h-3.5 w-3.5" />
          </Link>
          <Link
            href={`/roadmaps/${roadmap._id}/edit`}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#62695D] bg-[#202720] text-[#B8B9AA] transition-colors hover:border-[#D7FF00] hover:text-[#EDE8D8]"
            title="Edit"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Link>
          {onDeleteRequest && (
            <button
              onClick={() => onDeleteRequest(roadmap)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-900/30 bg-red-950/20 text-red-400 hover:bg-red-900/40"
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
