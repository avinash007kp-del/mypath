"use client";

import React from "react";
import { NodeProps, Node } from "@xyflow/react";
import { Link2, ExternalLink } from "lucide-react";
import { BaseNodeWrapper } from "./BaseNodeWrapper";
import { IRoadmapNode } from "@/types/roadmap";

export function ResourceNode({ data, selected }: NodeProps<Node<IRoadmapNode>>) {
  const resourceUrl = data.metadata?.resourceUrl as string | undefined;
  const resourceType = (data.metadata?.resourceType as string) || "Documentation";

  return (
    <BaseNodeWrapper
      selected={selected}
      className="w-56 border-l-4 border-l-[#EDE8D8] bg-[#252D26] p-3"
    >
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="flex h-5 w-5 items-center justify-center rounded border border-[#62695D] bg-[#2C352D] text-[#EDE8D8]">
            <Link2 className="h-3 w-3" />
          </div>
          <span className="font-mono text-[10px] uppercase text-[#EDE8D8]">{resourceType}</span>
        </div>
        {resourceUrl && <ExternalLink className="h-3 w-3 text-[#B8B9AA] hover:text-[#D7FF00]" />}
      </div>

      <h4 className="line-clamp-2 text-xs font-bold text-[#F3F0E6]">
        {data.title || "External Resource"}
      </h4>

      {data.description && (
        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-[#B8B9AA]">
          {data.description}
        </p>
      )}
    </BaseNodeWrapper>
  );
}
