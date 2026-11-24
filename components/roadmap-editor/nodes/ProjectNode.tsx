"use client";

import React from "react";
import { NodeProps, Node } from "@xyflow/react";
import { FolderGit2, Terminal } from "lucide-react";
import { BaseNodeWrapper } from "./BaseNodeWrapper";
import { IRoadmapNode } from "@/types/roadmap";
import { cn } from "@/lib/utils";

export function ProjectNode({ data, selected }: NodeProps<Node<IRoadmapNode>>) {
  const status = data.status || "Not Started";

  return (
    <BaseNodeWrapper
      selected={selected}
      className="w-64 border-l-4 border-l-[#EDE8D8] bg-[#252D26] p-3.5"
    >
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-md border border-[#62695D] bg-[#2C352D] text-[#EDE8D8]">
            <FolderGit2 className="h-3.5 w-3.5" />
          </div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#EDE8D8]">
            Hands-on Project
          </span>
        </div>
        <span className="rounded border border-[#62695D] bg-[#202720] px-2 py-0.5 font-mono text-[10px] font-medium text-[#B8B9AA]">
          {data.priority || "Medium"}
        </span>
      </div>

      <h4 className="line-clamp-2 text-sm font-bold leading-snug text-[#F3F0E6]">
        {data.title || "Portfolio Project"}
      </h4>

      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#B8B9AA]">
        {data.description || "Practical implementation project to consolidate skills."}
      </p>

      <div className="mt-3 flex items-center justify-between border-t border-[#62695D]/40 pt-2.5 text-xs">
        <span
          className={cn(
            "font-mono text-[11px] font-medium",
            status === "Completed" && "text-[#D7FF00]",
            status === "In Progress" && "text-[#EDE8D8]",
            status === "Not Started" && "text-[#B8B9AA]"
          )}
        >
          ● {status}
        </span>
        <span className="flex items-center gap-1 font-mono text-[11px] text-[#B8B9AA]">
          <Terminal className="h-3 w-3 text-[#B8B9AA]" />
          {data.estimatedHours || 10}h build
        </span>
      </div>
    </BaseNodeWrapper>
  );
}
