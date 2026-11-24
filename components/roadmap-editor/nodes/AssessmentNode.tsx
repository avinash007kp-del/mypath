"use client";

import React from "react";
import { NodeProps, Node } from "@xyflow/react";
import { CheckSquare2, Award, Clock } from "lucide-react";
import { BaseNodeWrapper } from "./BaseNodeWrapper";
import { IRoadmapNode } from "@/types/roadmap";
import { cn } from "@/lib/utils";

export function AssessmentNode({ data, selected }: NodeProps<Node<IRoadmapNode>>) {
  const isCompleted = data.status === "Completed";

  return (
    <BaseNodeWrapper
      selected={selected}
      className={cn(
        "w-56 border-l-4 border-l-[#D7FF00] bg-[#252D26] p-3",
        isCompleted && "border-l-[#D7FF00] bg-[#2C352D]"
      )}
    >
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="flex h-5 w-5 items-center justify-center rounded border border-[#62695D] bg-[#2C352D] text-[#D7FF00]">
            <CheckSquare2 className="h-3 w-3" />
          </div>
          <span className="font-mono text-[10px] uppercase text-[#D7FF00]">Knowledge Quiz</span>
        </div>
        <span
          className={cn(
            "rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium",
            isCompleted
              ? "border-[#D7FF00]/40 bg-[#202720] text-[#D7FF00]"
              : "border-[#62695D] bg-[#202720] text-[#B8B9AA]"
          )}
        >
          {isCompleted ? "Passed" : "Pending"}
        </span>
      </div>

      <h4 className="line-clamp-2 text-xs font-bold text-[#F3F0E6]">
        {data.title || "Module Assessment"}
      </h4>

      <div className="mt-2.5 flex items-center justify-between border-t border-[#62695D]/40 pt-2 font-mono text-[11px] text-[#B8B9AA]">
        <span className="flex items-center gap-1">
          <Award className="h-3 w-3 text-[#D7FF00]" />
          Quiz / Test
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-[#B8B9AA]" />
          {data.estimatedHours || 1}h
        </span>
      </div>
    </BaseNodeWrapper>
  );
}
