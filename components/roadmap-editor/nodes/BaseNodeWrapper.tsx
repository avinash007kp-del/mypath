import React from "react";
import { Handle, Position } from "@xyflow/react";
import { cn } from "@/lib/utils";

interface BaseNodeWrapperProps {
  selected?: boolean;
  className?: string;
  children: React.ReactNode;
  showHandles?: boolean;
}

export function BaseNodeWrapper({
  selected,
  className,
  children,
  showHandles = true,
}: BaseNodeWrapperProps) {
  return (
    <div
      className={cn(
        "relative select-none rounded-2xl border border-[#62695D] bg-[#252D26] text-[#F3F0E6] shadow-sm transition-all duration-150",
        "hover:border-[#D7FF00]/60 hover:shadow-lg hover:shadow-black/40",
        selected && "border-[#D7FF00] shadow-md shadow-[#D7FF00]/15 ring-1 ring-[#D7FF00]",
        className
      )}
    >
      {showHandles && (
        <>
          {/* Target Handles (Inputs) */}
          <Handle
            type="target"
            position={Position.Top}
            id="t-top"
            className="!top-[-5px] !border-[#1B211C] !bg-[#D7FF00]"
          />
          <Handle
            type="target"
            position={Position.Left}
            id="t-left"
            className="!left-[-5px] !border-[#1B211C] !bg-[#D7FF00]"
          />

          {/* Source Handles (Outputs) */}
          <Handle
            type="source"
            position={Position.Right}
            id="s-right"
            className="!right-[-5px] !border-[#1B211C] !bg-[#D7FF00]"
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="s-bottom"
            className="!bottom-[-5px] !border-[#1B211C] !bg-[#D7FF00]"
          />
        </>
      )}
      {children}
    </div>
  );
}
