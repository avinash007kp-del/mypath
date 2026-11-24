"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Clock,
  BookOpen,
  Calendar,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  Tag,
  Workflow,
} from "lucide-react";
import { IRoadmap } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatRelativeTime } from "@/lib/utils";

interface RoadmapCardProps {
  roadmap: IRoadmap;
  onDeleteRequest?: (roadmap: IRoadmap) => void;
}

export function RoadmapCard({ roadmap, onDeleteRequest }: RoadmapCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const getDifficultyVariant = (
    difficulty: IRoadmap["difficulty"]
  ): "beginner" | "intermediate" | "advanced" => {
    switch (difficulty) {
      case "Beginner":
        return "beginner";
      case "Intermediate":
        return "intermediate";
      case "Advanced":
        return "advanced";
      default:
        return "beginner";
    }
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-[#65685B] bg-[#171C18] p-5 transition-all duration-150 hover:border-[#D7FF00] hover:bg-[#202720] hover:shadow-xl hover:shadow-black/40">
      <div>
        {/* Top bar: Category + Menu */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 select-none text-xl">{roadmap.icon || "🚀"}</span>
            <Badge variant="default">{roadmap.category}</Badge>
            <Badge variant={getDifficultyVariant(roadmap.difficulty)}>{roadmap.difficulty}</Badge>
          </div>

          {/* Actions dropdown */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-lg p-1.5 text-[#A5A79B] transition-colors hover:bg-[#202720] hover:text-[#F3F0E6]"
              aria-label="Actions"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-8 z-30 w-40 rounded-xl border border-[#65685B] bg-[#171C18] py-1 shadow-2xl">
                  <Link
                    href={`/roadmaps/${roadmap._id}`}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#EDE8D8] hover:bg-[#202720] hover:text-[#D7FF00]"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View Details
                  </Link>
                  <Link
                    href={`/roadmaps/${roadmap._id}/editor`}
                    className="flex items-center gap-2 px-3 py-1.5 font-space text-xs font-bold text-[#D7FF00] hover:bg-[#202720]"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Workflow className="h-3.5 w-3.5 text-[#D7FF00]" />
                    Visual Editor
                  </Link>
                  <Link
                    href={`/roadmaps/${roadmap._id}/edit`}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#EDE8D8] hover:bg-[#202720] hover:text-[#D7FF00]"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    Edit Settings
                  </Link>
                  {onDeleteRequest && (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onDeleteRequest(roadmap);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Title */}
        <Link href={`/roadmaps/${roadmap._id}`}>
          <h3 className="line-clamp-1 font-space text-base font-bold text-[#F3F0E6] transition-colors group-hover:text-[#D7FF00]">
            {roadmap.title}
          </h3>
        </Link>

        {/* Description */}
        <p className="mt-1.5 line-clamp-2 font-sans text-xs leading-relaxed text-[#A5A79B]">
          {roadmap.description || "No description provided for this roadmap."}
        </p>

        {/* Tags */}
        {roadmap.tags && roadmap.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {roadmap.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 rounded border border-[#65685B]/60 bg-[#202720] px-2 py-0.5 font-mono text-[11px] text-[#A5A79B]"
              >
                <Tag className="h-2.5 w-2.5 text-[#D7FF00]" />
                {tag}
              </span>
            ))}
            {roadmap.tags.length > 3 && (
              <span className="self-center text-[10px] text-[#A5A79B]">
                +{roadmap.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer: Progress and metadata */}
      <div className="mt-5 space-y-3 border-t border-[#65685B]/50 pt-4">
        {/* Progress bar */}
        <div>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-[11px] text-[#A5A79B]">
              <BookOpen className="h-3.5 w-3.5 text-[#D7FF00]" />
              {roadmap.completedTopics} of {roadmap.totalTopics} topics
            </span>
            <span className="font-mono font-bold text-[#D7FF00]">{roadmap.progress}%</span>
          </div>
          <ProgressBar value={roadmap.progress} size="sm" />
        </div>

        {/* Info stats */}
        <div className="flex items-center justify-between pt-1 font-mono text-[11px] text-[#A5A79B]">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-[#A5A79B]" />
            {roadmap.estimatedDuration}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-[#A5A79B]" />
            {formatRelativeTime(roadmap.updatedAt)}
          </span>
        </div>

        {/* Action bar */}
        <div className="flex items-center gap-2 pt-1">
          <Link
            href={`/roadmaps/${roadmap._id}/editor`}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#D7FF00] px-3 py-2 font-space text-xs font-bold uppercase tracking-wider text-[#111512] shadow-sm shadow-[#D7FF00]/15 transition-colors hover:bg-[#c4eb00]"
          >
            <Workflow className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Open Canvas</span>
          </Link>

          <Link
            href={`/roadmaps/${roadmap._id}`}
            className="rounded-xl border border-[#65685B] bg-[#202720] px-3 py-2 font-space text-xs font-semibold text-[#EDE8D8] transition-colors hover:bg-[#202720]/80"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}
