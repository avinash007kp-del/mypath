"use client";

import React from "react";
import { NodeProps, Node } from "@xyflow/react";
import { Check, CornerDownRight } from "lucide-react";
import { BaseNodeWrapper } from "./BaseNodeWrapper";
import { IRoadmapNode } from "@/types/roadmap";
import { cn } from "@/lib/utils";

export function SubtopicNode({ data, selected }: NodeProps<Node<IRoadmapNode>>) {
  const isCompleted = data.status === "Completed";

  return (
    <BaseNodeWrapper
      selected={selected}
      className={cn(
        "w-52 border-dashed border-[#62695D] bg-[#252D26] p-2.5",
        isCompleted && "border-[#D7FF00]/60 bg-[#2C352D]"
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
            isCompleted
              ? "border-[#D7FF00] bg-[#D7FF00] text-[#1B211C]"
              : "border-[#62695D] bg-[#202720] text-transparent"
          )}
        >
          <Check className="h-3 w-3 stroke-[3]" />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "truncate text-xs font-semibold leading-tight",
              isCompleted ? "text-[#B8B9AA] line-through decoration-[#D7FF00]" : "text-[#F3F0E6]"
            )}
          >
            {data.title || "Untitled Subtopic"}
          </p>
          <span className="mt-0.5 flex items-center gap-0.5 font-mono text-[10px] text-[#B8B9AA]">
            <CornerDownRight className="h-2.5 w-2.5 text-[#D7FF00]" />
            Subtopic
          </span>
        </div>
      </div>
    </BaseNodeWrapper>
  );
}
