"use client";

import React from "react";
import { EdgeProps, getSmoothStepPath, EdgeLabelRenderer, BaseEdge } from "@xyflow/react";
import { X } from "lucide-react";

export function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
  animated,
  label,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16,
  });

  const onEdgeClick = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    if (data?.onDelete && typeof data.onDelete === "function") {
      data.onDelete(id);
    }
  };

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: selected ? "#D7FF00" : animated ? "#D7FF00" : "#62695D",
          strokeWidth: selected ? 2.5 : 2,
        }}
      />
      <EdgeLabelRenderer>
        {selected && (
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
            }}
            className="nodrag nopan z-20"
          >
            <button
              onClick={onEdgeClick}
              className="flex h-5 w-5 scale-100 items-center justify-center rounded-full border border-red-500/60 bg-[#252D26] text-red-400 shadow-md transition-all hover:scale-110 hover:bg-red-500 hover:text-white"
              title="Delete connection"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
        {label && !selected && (
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
            }}
            className="nodrag nopan z-10 rounded border border-[#62695D] bg-[#202720] px-2 py-0.5 font-mono text-[10px] text-[#EDE8D8] shadow-sm"
          >
            {label}
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
}
