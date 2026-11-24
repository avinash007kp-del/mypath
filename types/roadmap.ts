import { IRoadmap } from "./index";
import type { Node } from "@xyflow/react";

export type RoadmapNodeType =
  "topic" | "subtopic" | "milestone" | "project" | "resource" | "assessment";

export type NodeStatus = "Not Started" | "In Progress" | "Completed" | "On Hold";

export type NodePriority = "Low" | "Medium" | "High";

export interface NodeMetadata {
  targetDate?: string;
  resourceUrl?: string;
  resourceType?: string;
  notes?: string;
  prerequisites?: string[];
  tags?: string[];
  [key: string]: unknown;
}

export interface IRoadmapNode {
  _id: string;
  id?: string;
  roadmapId: string;
  type: RoadmapNodeType;
  title: string;
  description: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedHours: number;
  status: NodeStatus;
  priority: NodePriority;
  positionX: number;
  positionY: number;
  metadata: NodeMetadata;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface IRoadmapEdge {
  _id: string;
  id?: string;
  roadmapId: string;
  sourceNodeId: string;
  targetNodeId: string;
  label?: string;
  type?: string;
  animated?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IRoadmapViewport {
  roadmapId: string;
  x: number;
  y: number;
  zoom: number;
  updatedAt?: string;
}

export interface RoadmapGraphData {
  roadmap: IRoadmap;
  nodes: IRoadmapNode[];
  edges: IRoadmapEdge[];
  viewport?: IRoadmapViewport;
}

export type SaveStatus = "Saved" | "Saving..." | "Unsaved changes" | "Save failed";

export interface GraphBatchSavePayload {
  nodes: Array<{
    _id?: string;
    type: RoadmapNodeType;
    title: string;
    description?: string;
    category?: string;
    difficulty?: "Beginner" | "Intermediate" | "Advanced";
    estimatedHours?: number;
    status?: NodeStatus;
    priority?: NodePriority;
    positionX: number;
    positionY: number;
    metadata?: NodeMetadata;
  }>;
  edges: Array<{
    _id?: string;
    sourceNodeId: string;
    targetNodeId: string;
    label?: string;
    type?: string;
    animated?: boolean;
  }>;
  viewport?: {
    x: number;
    y: number;
    zoom: number;
  };
}

export type AppNode = Node<IRoadmapNode>;
