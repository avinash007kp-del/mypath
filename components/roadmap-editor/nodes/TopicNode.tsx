"use client";

import React from "react";
import { NodeProps, Node } from "@xyflow/react";
import { BookOpen, Clock, CheckCircle2, CircleDashed, Flame, PauseCircle } from "lucide-react";
import { BaseNodeWrapper } from "./BaseNodeWrapper";
import { IRoadmapNode } from "@/types/roadmap";
import { cn } from "@/lib/utils";

export function TopicNode({ data, selected }: NodeProps<Node<IRoadmapNode>>) {
  const status = data.status || "Not Started";

  const getStatusIcon = () => {
    switch (status) {
      case "Completed":
        return <CheckCircle2 className="h-3.5 w-3.5 text-[#D7FF00]" />;
      case "In Progress":
        return <Flame className="h-3.5 w-3.5 text-[#EDE8D8]" />;
      case "On Hold":
        return <PauseCircle className="h-3.5 w-3.5 text-[#B8B9AA]" />;
      default:
        return <CircleDashed className="h-3.5 w-3.5 text-[#62695D]" />;
    }
  };

  const getDifficultyColor = () => {
    switch (data.difficulty) {
      case "Advanced":
        return "text-[#F3F0E6] bg-[#2C352D] border-[#62695D]";
      case "Intermediate":
        return "text-[#EDE8D8] bg-[#202720] border-[#62695D]";
      default:
        return "text-[#D7FF00] bg-[#2C352D] border-[#62695D]";
    }
  };

  return (
    <BaseNodeWrapper selected={selected} className="w-64 border-l-4 border-l-[#D7FF00] p-3.5">
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-md border border-[#62695D] bg-[#2C352D] text-[#D7FF00]">
            <BookOpen className="h-3.5 w-3.5 text-[#D7FF00]" />
          </div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#B8B9AA]">
            {data.category || "Topic"}
          </span>
        </div>

        <span
          className={cn(
            "rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium",
            getDifficultyColor()
          )}
        >
          {data.difficulty || "Beginner"}
        </span>
      </div>

      <h4 className="line-clamp-2 text-sm font-bold leading-snug text-[#F3F0E6]">
        {data.title || "Untitled Topic"}
      </h4>

      {data.description && (
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#B8B9AA]">
          {data.description}
        </p>
      )}

      <div className="mt-3 border-t border-[#62695D]/50 pt-2.5">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            {getStatusIcon()}
            <span
              className={cn(
                "font-mono text-[11px] font-medium",
                status === "Completed" && "text-[#D7FF00]",
                status === "In Progress" && "text-[#EDE8D8]",
                status === "Not Started" && "text-[#B8B9AA]",
                status === "On Hold" && "text-[#B8B9AA]"
              )}
            >
              {status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {data.estimatedHours !== undefined && (
              <span className="flex items-center gap-1 font-mono text-[11px] text-[#B8B9AA]">
                <Clock className="h-3 w-3 text-[#B8B9AA]" />
                {data.estimatedHours}h
              </span>
            )}
            <span className="font-mono text-[10px] font-bold text-[#D7FF00]">
              {typeof data.metadata?.progressPercentage === "number"
                ? `${data.metadata.progressPercentage}%`
                : status === "Completed"
                  ? "100%"
                  : status === "In Progress"
                    ? "50%"
                    : "0%"}
            </span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="h-1 w-full overflow-hidden rounded-full border border-[#62695D]/40 bg-[#202720]">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              status === "Completed" ? "bg-[#D7FF00]" : "bg-[#EDE8D8]"
            )}
            style={{
              width: `${
                typeof data.metadata?.progressPercentage === "number"
                  ? data.metadata.progressPercentage
                  : status === "Completed"
                    ? 100
                    : status === "In Progress"
                      ? 50
                      : 0
              }%`,
            }}
          />
        </div>
      </div>
    </BaseNodeWrapper>
  );
}
