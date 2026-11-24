"use client";

import React from "react";
import { Trophy, Calendar, AlertCircle, CheckCircle2, Trash2, Clock, Bookmark } from "lucide-react";
import { IMilestone } from "@/types/lms";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface MilestoneCardProps {
  milestone: IMilestone;
  onToggleStatus?: (milestone: IMilestone) => void;
  onDelete?: (id: string) => void;
}

export function MilestoneCard({ milestone, onToggleStatus, onDelete }: MilestoneCardProps) {
  const isCompleted = milestone.status === "Completed";
  const isOverdue = milestone.status === "Overdue";

  const getPriorityBadge = () => {
    switch (milestone.priority) {
      case "High":
        return "text-red-400 bg-[#252D26] border-red-800/60 font-bold";
      case "Medium":
        return "text-[#D7FF00] bg-[#252D26] border-[#62695D]";
      default:
        return "text-[#B8B9AA] bg-[#252D26] border-[#62695D]";
    }
  };

  return (
    <div
      className={cn(
        "group flex flex-col justify-between rounded-xl border border-[#62695D] bg-[#252D26] p-4 transition-all hover:border-[#D7FF00] hover:bg-[#2C352D]",
        isOverdue && "border-red-600/60 bg-[#252D26]",
        isCompleted && "border-[#62695D] bg-[#252D26]"
      )}
    >
      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-lg border",
                isOverdue
                  ? "border-red-800 bg-[#202720] text-red-400"
                  : isCompleted
                    ? "border-[#D7FF00] bg-[#202720] text-[#D7FF00]"
                    : "border-[#62695D] bg-[#202720] text-[#D7FF00]"
              )}
            >
              <Trophy className="h-4 w-4" />
            </div>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 font-mono text-[10px]",
                getPriorityBadge()
              )}
            >
              {milestone.priority} Priority
            </span>
          </div>

          <div className="flex items-center gap-1">
            {isOverdue && (
              <span className="flex items-center gap-1 rounded-full border border-red-700/60 bg-[#202720] px-2 py-0.5 font-mono text-[10px] font-bold text-red-400">
                <AlertCircle className="h-3 w-3" />
                Overdue
              </span>
            )}
            {isCompleted && (
              <span className="flex items-center gap-1 rounded-full border border-[#D7FF00]/60 bg-[#202720] px-2 py-0.5 font-mono text-[10px] font-bold text-[#D7FF00]">
                <CheckCircle2 className="h-3 w-3" />
                Done
              </span>
            )}
          </div>
        </div>

        <h4 className="mt-1 line-clamp-1 font-mono text-sm font-bold text-[#F3F0E6] transition-colors group-hover:text-[#D7FF00]">
          {milestone.title}
        </h4>

        {milestone.description && (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#B8B9AA]">
            {milestone.description}
          </p>
        )}

        {milestone.roadmapTitle && (
          <div className="mt-2.5 flex items-center gap-1 font-mono text-[11px] text-[#D7FF00]">
            <Bookmark className="h-3 w-3 text-[#D7FF00]" />
            <span className="max-w-[200px] truncate">{milestone.roadmapTitle}</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[#62695D]/40 pt-3 text-xs">
        <span
          className={cn(
            "flex items-center gap-1 font-mono text-[11px]",
            isOverdue ? "font-bold text-red-400" : "text-[#B8B9AA]"
          )}
        >
          <Calendar className="h-3.5 w-3.5 text-[#D7FF00]" />
          {formatDate(milestone.targetDate)}
        </span>

        <div className="flex items-center gap-2">
          {onToggleStatus && (
            <button
              onClick={() => onToggleStatus(milestone)}
              className={cn(
                "flex items-center gap-1 rounded-md border px-2.5 py-1 font-mono text-[11px] font-bold transition-colors",
                isCompleted
                  ? "border-[#D7FF00] bg-[#2C352D] text-[#D7FF00]"
                  : "border-[#62695D] bg-[#202720] text-[#B8B9AA] hover:text-[#EDE8D8]"
              )}
            >
              <CheckCircle2 className="h-3 w-3 text-[#D7FF00]" />
              {isCompleted ? "Completed" : "Mark Done"}
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(milestone._id)}
              className="rounded p-1 text-[#B8B9AA] transition-colors hover:bg-red-500/10 hover:text-red-400"
              title="Delete milestone"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
