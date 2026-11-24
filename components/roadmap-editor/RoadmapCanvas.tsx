"use client";

import React, { useCallback, useMemo, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  Connection,
  Edge,
  Node,
  OnConnect,
  OnNodesChange,
  OnEdgesChange,
  useReactFlow,
  Panel,
} from "@xyflow/react";
import { TopicNode } from "./nodes/TopicNode";
import { SubtopicNode } from "./nodes/SubtopicNode";
import { MilestoneNode } from "./nodes/MilestoneNode";
import { ProjectNode } from "./nodes/ProjectNode";
import { ResourceNode } from "./nodes/ResourceNode";
import { AssessmentNode } from "./nodes/AssessmentNode";
import { CustomEdge } from "./edges/CustomEdge";
import { IRoadmapNode, RoadmapNodeType } from "@/types/roadmap";
import { toast } from "sonner";

interface RoadmapCanvasProps {
  nodes: Node<IRoadmapNode>[];
  edges: Edge[];
  onNodesChange: OnNodesChange<Node<IRoadmapNode>>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  onNodeSelect: (node: Node<IRoadmapNode> | null) => void;
  onAddNodeAtPosition: (type: RoadmapNodeType, position: { x: number; y: number }) => void;
  onDeleteEdge: (edgeId: string) => void;
  onViewportChange?: () => void;
  reactFlowWrapperRef: React.RefObject<HTMLDivElement>;
}

export function RoadmapCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeSelect,
  onAddNodeAtPosition,
  onDeleteEdge,
  onViewportChange,
  reactFlowWrapperRef,
}: RoadmapCanvasProps) {
  const { screenToFlowPosition } = useReactFlow();

  const nodeTypes = useMemo(
    () => ({
      topic: TopicNode,
      subtopic: SubtopicNode,
      milestone: MilestoneNode,
      project: ProjectNode,
      resource: ResourceNode,
      assessment: AssessmentNode,
    }),
    []
  );

  const edgeTypes = useMemo(
    () => ({
      smoothstep: CustomEdge,
      default: CustomEdge,
    }),
    []
  );

  // Drag over handler for node library drops
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // Drop handler
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow") as RoadmapNodeType;
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      onAddNodeAtPosition(type, position);
    },
    [screenToFlowPosition, onAddNodeAtPosition]
  );

  // Attach delete callback to custom edge data
  const edgesWithData = useMemo(() => {
    return edges.map((e) => ({
      ...e,
      data: {
        ...e.data,
        onDelete: onDeleteEdge,
      },
    }));
  }, [edges, onDeleteEdge]);

  return (
    <div
      ref={reactFlowWrapperRef}
      className="relative h-full w-full flex-1 overflow-hidden bg-[#1B211C]"
    >
      <ReactFlow
        nodes={nodes}
        edges={edgesWithData}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onNodeClick={(_, node) => onNodeSelect(node)}
        onPaneClick={() => onNodeSelect(null)}
        onMoveEnd={onViewportChange}
        fitView
        snapToGrid={true}
        snapGrid={[16, 16]}
        minZoom={0.2}
        maxZoom={2.5}
        deleteKeyCode={["Backspace", "Delete"]}
        multiSelectionKeyCode={["Control", "Meta"]}
        selectNodesOnDrag={false}
        proOptions={{ hideAttribution: true }}
        className="bg-[#1B211C]"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.5}
          color="#62695D"
          className="opacity-40"
        />

        <Controls
          showInteractive={false}
          className="m-4 !border-[#62695D] !bg-[#252D26] !text-[#F3F0E6] shadow-xl"
        />

        <MiniMap
          nodeStrokeColor="#D7FF00"
          nodeColor={(n) => {
            const nodeData = n.data as IRoadmapNode | undefined;
            if (nodeData?.status === "Completed") return "#D7FF00";
            if (nodeData?.status === "In Progress") return "#EDE8D8";
            if (nodeData?.type === "milestone") return "#D7FF00";
            if (nodeData?.type === "project") return "#EDE8D8";
            return "#2C352D";
          }}
          nodeBorderRadius={6}
          maskColor="rgba(27, 33, 28, 0.85)"
          className="m-4 hidden !border-[#62695D] !bg-[#252D26] shadow-xl sm:block"
        />

        {/* Floating Quick Legend Panel */}
        <Panel
          position="bottom-left"
          className="m-4 hidden select-none items-center gap-3 rounded-xl border border-[#62695D] bg-[#252D26]/95 p-2 font-mono text-[11px] text-[#B8B9AA] shadow-lg backdrop-blur-md lg:flex"
        >
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#D7FF00]" />
            <span className="text-[#F3F0E6]">Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#EDE8D8]" />
            <span className="text-[#EDE8D8]">In Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#62695D]" />
            <span>Not Started</span>
          </div>
          <div className="h-3 w-[1px] bg-[#62695D]" />
          <span className="text-[10px] text-[#B8B9AA]">Drag handle to connect</span>
        </Panel>
      </ReactFlow>
    </div>
  );
}
