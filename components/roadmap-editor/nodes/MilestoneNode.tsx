"use client";

import React from "react";
import { NodeProps, Node } from "@xyflow/react";
import { Trophy, Calendar, CheckCircle2 } from "lucide-react";
import { BaseNodeWrapper } from "./BaseNodeWrapper";
import { IRoadmapNode } from "@/types/roadmap";
import { cn } from "@/lib/utils";

export function MilestoneNode({ data, selected }: NodeProps<Node<IRoadmapNode>>) {
  const isCompleted = data.status === "Completed";
  const targetDate = data.metadata?.targetDate as string | undefined;

  return (
    <BaseNodeWrapper
      selected={selected}
      className={cn(
        "w-64 border border-[#62695D] bg-[#252D26] p-4 shadow-sm",
        isCompleted && "border-[#D7FF00]/80 bg-[#2C352D]"
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#62695D] bg-[#2C352D] text-[#D7FF00]">
            <Trophy className="h-4 w-4" />
          </div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#D7FF00]">
            Milestone Target
          </span>
        </div>

        {isCompleted && (
          <span className="inline-flex items-center gap-1 rounded border border-[#D7FF00]/40 bg-[#202720] px-2 py-0.5 font-mono text-[10px] font-bold text-[#D7FF00]">
            <CheckCircle2 className="h-3 w-3" />
            Achieved
          </span>
        )}
      </div>

      <h4 className="text-sm font-bold leading-snug text-[#F3F0E6]">
        {data.title || "Major Milestone"}
      </h4>

      {data.description && (
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#B8B9AA]">
          {data.description}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-[#62695D]/40 pt-2.5 font-mono text-[11px] text-[#EDE8D8]">
        <span className="flex items-center gap-1 text-[#B8B9AA]">
          <Calendar className="h-3 w-3 text-[#D7FF00]" />
          {targetDate || "Milestone Goal"}
        </span>
        <span className="font-semibold text-[#F3F0E6]">{data.status || "Not Started"}</span>
      </div>
    </BaseNodeWrapper>
  );
}
