"use client";

import React, { useState } from "react";
import {
  BookOpen,
  CornerDownRight,
  Trophy,
  FolderGit2,
  Link2,
  CheckSquare2,
  ChevronLeft,
  ChevronRight,
  Plus,
  GripVertical,
} from "lucide-react";
import { RoadmapNodeType } from "@/types/roadmap";
import { cn } from "@/lib/utils";

interface NodeLibraryProps {
  onQuickAddNode: (type: RoadmapNodeType) => void;
}

interface NodeDefinition {
  type: RoadmapNodeType;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badge: string;
}

const nodeDefinitions: NodeDefinition[] = [
  {
    type: "topic",
    name: "Topic",
    description: "Main concept or skill module",
    icon: BookOpen,
    accentColor: "border-[#62695D] text-[#D7FF00] bg-[#2C352D]",
    badge: "Core",
  },
  {
    type: "subtopic",
    name: "Subtopic",
    description: "Granular lesson or subtask",
    icon: CornerDownRight,
    accentColor: "border-[#62695D] text-[#EDE8D8] bg-[#202720]",
    badge: "Detail",
  },
  {
    type: "milestone",
    name: "Milestone",
    description: "Major target milestone",
    icon: Trophy,
    accentColor: "border-[#62695D] text-[#D7FF00] bg-[#2C352D]",
    badge: "Goal",
  },
  {
    type: "project",
    name: "Project",
    description: "Hands-on build & portfolio item",
    icon: FolderGit2,
    accentColor: "border-[#62695D] text-[#EDE8D8] bg-[#202720]",
    badge: "Build",
  },
  {
    type: "resource",
    name: "Resource",
    description: "Link, book, article, or docs",
    icon: Link2,
    accentColor: "border-[#62695D] text-[#EDE8D8] bg-[#202720]",
    badge: "Ref",
  },
  {
    type: "assessment",
    name: "Assessment",
    description: "Knowledge check, quiz, or test",
    icon: CheckSquare2,
    accentColor: "border-[#62695D] text-[#EDE8D8] bg-[#202720]",
    badge: "Quiz",
  },
];

export function NodeLibrary({ onQuickAddNode }: NodeLibraryProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const onDragStart = (event: React.DragEvent, nodeType: RoadmapNodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside
      className={cn(
        "relative z-20 flex h-full shrink-0 select-none flex-col border-r border-[#62695D] bg-[#252D26] transition-all duration-300",
        isCollapsed ? "w-12" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex h-12 items-center justify-between border-b border-[#62695D]/40 px-3">
        {!isCollapsed && (
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#F3F0E6]">
              Node Library
            </span>
            <span className="py-0.2 rounded border border-[#62695D] bg-[#202720] px-1.5 font-mono text-[10px] text-[#D7FF00]">
              6 Types
            </span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto rounded-lg p-1 text-[#B8B9AA] transition-colors hover:bg-[#2C352D] hover:text-[#F3F0E6]"
          title={isCollapsed ? "Expand Node Library" : "Collapse Node Library"}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Library Items */}
      {!isCollapsed ? (
        <div className="custom-scrollbar flex-1 space-y-2.5 overflow-y-auto p-3">
          <p className="text-[11px] leading-relaxed text-[#B8B9AA]">
            Drag cards onto canvas, or click <Plus className="inline h-3 w-3 text-[#D7FF00]" /> to
            add instantly.
          </p>

          <div className="space-y-2 pt-1">
            {nodeDefinitions.map((def) => {
              const Icon = def.icon;
              return (
                <div
                  key={def.type}
                  draggable
                  onDragStart={(e) => onDragStart(e, def.type)}
                  className="group relative flex cursor-grab items-start gap-2.5 rounded-xl border border-[#62695D] bg-[#202720] p-2.5 shadow-sm transition-all hover:border-[#D7FF00]/60 hover:bg-[#2C352D] active:cursor-grabbing"
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                      def.accentColor
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1 pr-6">
                    <div className="flex items-center gap-1.5">
                      <h4 className="truncate text-xs font-bold text-[#F3F0E6] transition-colors group-hover:text-[#D7FF00]">
                        {def.name}
                      </h4>
                      <span className="py-0.2 rounded border border-[#62695D] bg-[#252D26] px-1 font-mono text-[9px] text-[#B8B9AA]">
                        {def.badge}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-[10px] leading-snug text-[#B8B9AA]">
                      {def.description}
                    </p>
                  </div>

                  {/* Quick Add Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickAddNode(def.type);
                    }}
                    className="absolute right-2 top-2.5 rounded-md p-1 text-[#B8B9AA] transition-colors hover:bg-[#252D26] hover:text-[#D7FF00]"
                    title={`Add ${def.name} to canvas center`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Collapsed View: icons only */
        <div className="flex flex-1 flex-col items-center space-y-2 py-3">
          {nodeDefinitions.map((def) => {
            const Icon = def.icon;
            return (
              <div
                key={def.type}
                draggable
                onDragStart={(e) => onDragStart(e, def.type)}
                onClick={() => onQuickAddNode(def.type)}
                className="flex h-8 w-8 cursor-grab items-center justify-center rounded-xl border border-[#62695D] bg-[#202720] text-[#B8B9AA] transition-all hover:border-[#D7FF00] hover:text-[#D7FF00] active:cursor-grabbing"
                title={`Drag or click to add ${def.name}`}
              >
                <Icon className="h-4 w-4" />
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
}
