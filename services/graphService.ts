import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Roadmap from "@/models/Roadmap";
import RoadmapNode, { IRoadmapNodeDocument } from "@/models/RoadmapNode";
import RoadmapEdge, { IRoadmapEdgeDocument } from "@/models/RoadmapEdge";
import RoadmapViewport from "@/models/RoadmapViewport";
import {
  RoadmapGraphData,
  IRoadmapNode,
  IRoadmapEdge,
  IRoadmapViewport,
  GraphBatchSavePayload,
} from "@/types/roadmap";
import { RoadmapNodeInput, UpdateRoadmapNodeInput } from "@/lib/validations/roadmap-node";
import { RoadmapEdgeInput, RoadmapViewportInput } from "@/lib/validations/roadmap-edge";

function transformNode(doc: IRoadmapNodeDocument): IRoadmapNode {
  return {
    _id: doc._id.toString(),
    id: doc._id.toString(),
    roadmapId: doc.roadmapId.toString(),
    type: doc.type,
    title: doc.title,
    description: doc.description || "",
    category: doc.category || "General",
    difficulty: doc.difficulty || "Beginner",
    estimatedHours: doc.estimatedHours || 1,
    status: doc.status || "Not Started",
    priority: doc.priority || "Medium",
    positionX: doc.positionX || 0,
    positionY: doc.positionY || 0,
    metadata: doc.metadata || {},
    createdAt: doc.createdAt?.toISOString(),
    updatedAt: doc.updatedAt?.toISOString(),
  };
}

function transformEdge(doc: IRoadmapEdgeDocument): IRoadmapEdge {
  return {
    _id: doc._id.toString(),
    id: doc._id.toString(),
    roadmapId: doc.roadmapId.toString(),
    sourceNodeId: doc.sourceNodeId,
    targetNodeId: doc.targetNodeId,
    label: doc.label || "",
    type: doc.type || "smoothstep",
    animated: doc.animated || false,
    createdAt: doc.createdAt?.toISOString(),
    updatedAt: doc.updatedAt?.toISOString(),
  };
}

export async function getRoadmapGraph(roadmapId: string): Promise<RoadmapGraphData | null> {
  await connectToDatabase();

  const roadmapDoc = await Roadmap.findById(roadmapId).lean();
  if (!roadmapDoc) return null;

  const nodeDocs = await RoadmapNode.find({ roadmapId })
    .sort({ createdAt: 1 })
    .lean<IRoadmapNodeDocument[]>();

  const edgeDocs = await RoadmapEdge.find({ roadmapId }).lean<IRoadmapEdgeDocument[]>();

  const viewportDoc = await RoadmapViewport.findOne({ roadmapId }).lean();

  let nodes = nodeDocs.map(transformNode);
  let edges = edgeDocs.map(transformEdge);

  // If this roadmap has zero nodes (e.g. from Phase 1 seed), generate initial topic nodes along a clean path
  if (nodes.length === 0 && roadmapDoc.totalTopics && roadmapDoc.totalTopics > 0) {
    const starterNodes: IRoadmapNode[] = [];
    const starterEdges: IRoadmapEdge[] = [];
    const count = Math.min(roadmapDoc.totalTopics, 6);

    for (let i = 0; i < count; i++) {
      const isCompleted = i < (roadmapDoc.completedTopics || 0);
      const isCurrent = i === (roadmapDoc.completedTopics || 0);
      const createdNode = await RoadmapNode.create({
        roadmapId,
        type: i === count - 1 ? "milestone" : "topic",
        title: `${roadmapDoc.title} – Milestone ${i + 1}`,
        description: `Core module #${i + 1} for ${roadmapDoc.title}. Covers theoretical concepts and hands-on implementation.`,
        category: roadmapDoc.category,
        difficulty: roadmapDoc.difficulty,
        estimatedHours: 8,
        status: isCompleted ? "Completed" : isCurrent ? "In Progress" : "Not Started",
        priority: "High",
        positionX: 100 + (i % 2 === 0 ? 0 : 80),
        positionY: 100 + i * 160,
        metadata: {
          notes: "Initial module generated from Phase 1 curriculum parameters.",
        },
      });

      const tNode = transformNode(createdNode);
      starterNodes.push(tNode);

      if (i > 0) {
        const prevId = starterNodes[i - 1]._id;
        const currId = tNode._id;
        const createdEdge = await RoadmapEdge.create({
          roadmapId,
          sourceNodeId: prevId,
          targetNodeId: currId,
          type: "smoothstep",
          animated: isCurrent,
        });
        starterEdges.push(transformEdge(createdEdge));
      }
    }

    nodes = starterNodes;
    edges = starterEdges;
  }

  const viewport: IRoadmapViewport = viewportDoc
    ? {
        roadmapId,
        x: viewportDoc.x,
        y: viewportDoc.y,
        zoom: viewportDoc.zoom,
        updatedAt: viewportDoc.updatedAt?.toISOString(),
      }
    : {
        roadmapId,
        x: 0,
        y: 0,
        zoom: 1,
      };

  return {
    roadmap: {
      _id: roadmapDoc._id.toString(),
      title: roadmapDoc.title,
      description: roadmapDoc.description || "",
      category: roadmapDoc.category as any,
      difficulty: roadmapDoc.difficulty as any,
      estimatedDuration: roadmapDoc.estimatedDuration,
      icon: roadmapDoc.icon || "🚀",
      tags: roadmapDoc.tags || [],
      progress: roadmapDoc.progress || 0,
      totalTopics: roadmapDoc.totalTopics || 0,
      completedTopics: roadmapDoc.completedTopics || 0,
      userId: roadmapDoc.userId,
      createdAt: roadmapDoc.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: roadmapDoc.updatedAt?.toISOString() || new Date().toISOString(),
    },
    nodes,
    edges,
    viewport,
  };
}

export async function createGraphNode(
  roadmapId: string,
  data: RoadmapNodeInput
): Promise<IRoadmapNode> {
  await connectToDatabase();

  const node = await RoadmapNode.create({
    ...data,
    roadmapId: new mongoose.Types.ObjectId(roadmapId),
  });

  // Sync roadmap topic count
  const allNodes = await RoadmapNode.find({ roadmapId });
  const total = allNodes.length;
  const completed = allNodes.filter((n) => n.status === "Completed").length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  await Roadmap.findByIdAndUpdate(roadmapId, {
    totalTopics: total,
    completedTopics: completed,
    progress,
  });

  return transformNode(node);
}

export async function updateGraphNode(
  nodeId: string,
  data: UpdateRoadmapNodeInput
): Promise<IRoadmapNode | null> {
  await connectToDatabase();

  const updated = await RoadmapNode.findByIdAndUpdate(nodeId, { $set: data }, { new: true });
  if (!updated) return null;

  // Sync roadmap topic progress
  const roadmapId = updated.roadmapId;
  const allNodes = await RoadmapNode.find({ roadmapId });
  const total = allNodes.length;
  const completed = allNodes.filter((n) => n.status === "Completed").length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  await Roadmap.findByIdAndUpdate(roadmapId, {
    totalTopics: total,
    completedTopics: completed,
    progress,
  });

  return transformNode(updated);
}

export async function deleteGraphNode(nodeId: string): Promise<boolean> {
  await connectToDatabase();

  const node = await RoadmapNode.findById(nodeId);
  if (!node) return false;

  const roadmapId = node.roadmapId;

  // Delete node
  await RoadmapNode.findByIdAndDelete(nodeId);

  // Delete connected edges (both as source and target)
  await RoadmapEdge.deleteMany({
    roadmapId,
    $or: [{ sourceNodeId: nodeId }, { targetNodeId: nodeId }],
  });

  // Recalculate roadmap stats
  const allNodes = await RoadmapNode.find({ roadmapId });
  const total = allNodes.length;
  const completed = allNodes.filter((n) => n.status === "Completed").length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  await Roadmap.findByIdAndUpdate(roadmapId, {
    totalTopics: total,
    completedTopics: completed,
    progress,
  });

  return true;
}

export async function checkHasPath(
  roadmapId: string,
  startNodeId: string,
  targetNodeId: string
): Promise<boolean> {
  // BFS search to see if targetNodeId is reachable from startNodeId
  const edges = await RoadmapEdge.find({ roadmapId }).lean<IRoadmapEdgeDocument[]>();
  const adj = new Map<string, string[]>();

  for (const e of edges) {
    if (!adj.has(e.sourceNodeId)) adj.set(e.sourceNodeId, []);
    adj.get(e.sourceNodeId)!.push(e.targetNodeId);
  }

  const visited = new Set<string>();
  const queue = [startNodeId];

  while (queue.length > 0) {
    const curr = queue.shift()!;
    if (curr === targetNodeId) return true;
    if (visited.has(curr)) continue;
    visited.add(curr);

    const neighbors = adj.get(curr) || [];
    for (const next of neighbors) {
      if (!visited.has(next)) {
        queue.push(next);
      }
    }
  }

  return false;
}

export async function createGraphEdge(
  roadmapId: string,
  data: RoadmapEdgeInput
): Promise<{ edge: IRoadmapEdge | null; error?: string }> {
  await connectToDatabase();

  // Validate self connection
  if (data.sourceNodeId === data.targetNodeId) {
    return { edge: null, error: "A node cannot connect to itself." };
  }

  // Check duplicate connection
  const existing = await RoadmapEdge.findOne({
    roadmapId,
    sourceNodeId: data.sourceNodeId,
    targetNodeId: data.targetNodeId,
  });
  if (existing) {
    return { edge: transformEdge(existing) };
  }

  // Cycle check: If there is already a path from target to source, adding source -> target creates a cycle!
  const hasCycle = await checkHasPath(roadmapId, data.targetNodeId, data.sourceNodeId);
  if (hasCycle) {
    return {
      edge: null,
      error: "Connecting these nodes would create a circular prerequisite dependency cycle.",
    };
  }

  const created = await RoadmapEdge.create({
    roadmapId: new mongoose.Types.ObjectId(roadmapId),
    sourceNodeId: data.sourceNodeId,
    targetNodeId: data.targetNodeId,
    label: data.label || "",
    type: data.type || "smoothstep",
    animated: data.animated || false,
  });

  return { edge: transformEdge(created) };
}

export async function deleteGraphEdge(edgeId: string): Promise<boolean> {
  await connectToDatabase();
  const res = await RoadmapEdge.findByIdAndDelete(edgeId);
  return res !== null;
}

export async function saveGraphViewport(
  roadmapId: string,
  viewport: RoadmapViewportInput
): Promise<IRoadmapViewport> {
  await connectToDatabase();

  const doc = await RoadmapViewport.findOneAndUpdate(
    { roadmapId: new mongoose.Types.ObjectId(roadmapId) },
    { $set: { x: viewport.x, y: viewport.y, zoom: viewport.zoom } },
    { upsert: true, new: true }
  );

  return {
    roadmapId,
    x: doc.x,
    y: doc.y,
    zoom: doc.zoom,
    updatedAt: doc.updatedAt?.toISOString(),
  };
}

export async function saveGraphBatch(
  roadmapId: string,
  payload: GraphBatchSavePayload
): Promise<RoadmapGraphData | null> {
  await connectToDatabase();

  const roadmapObjId = new mongoose.Types.ObjectId(roadmapId);
  const roadmapDoc = await Roadmap.findById(roadmapId);
  if (!roadmapDoc) return null;

  // Save Viewport if provided
  if (payload.viewport) {
    await RoadmapViewport.findOneAndUpdate(
      { roadmapId: roadmapObjId },
      { $set: payload.viewport },
      { upsert: true }
    );
  }

  // Map old client IDs or ObjectIds
  const clientToMongoId = new Map<string, string>();

  // Sync Nodes:
  // For each incoming node: if it has a valid existing _id in DB, update; else insert
  const incomingNodeIds = new Set<string>();

  for (const n of payload.nodes) {
    if (n._id && mongoose.Types.ObjectId.isValid(n._id)) {
      const existing = await RoadmapNode.findOne({ _id: n._id, roadmapId: roadmapObjId });
      if (existing) {
        existing.type = n.type;
        existing.title = n.title;
        existing.description = n.description || "";
        existing.category = n.category || "General";
        existing.difficulty = n.difficulty || "Beginner";
        existing.estimatedHours = n.estimatedHours || 1;
        existing.status = n.status || "Not Started";
        existing.priority = n.priority || "Medium";
        existing.positionX = n.positionX;
        existing.positionY = n.positionY;
        existing.metadata = n.metadata || {};
        await existing.save();
        incomingNodeIds.add(existing._id.toString());
        clientToMongoId.set(n._id, existing._id.toString());
        continue;
      }
    }

    // New node to create
    const created = await RoadmapNode.create({
      roadmapId: roadmapObjId,
      type: n.type,
      title: n.title,
      description: n.description || "",
      category: n.category || "General",
      difficulty: n.difficulty || "Beginner",
      estimatedHours: n.estimatedHours || 1,
      status: n.status || "Not Started",
      priority: n.priority || "Medium",
      positionX: n.positionX,
      positionY: n.positionY,
      metadata: n.metadata || {},
    });

    incomingNodeIds.add(created._id.toString());
    if (n._id) {
      clientToMongoId.set(n._id, created._id.toString());
    }
  }

  // Delete any nodes that were deleted on client
  await RoadmapNode.deleteMany({
    roadmapId: roadmapObjId,
    _id: { $nin: Array.from(incomingNodeIds) },
  });

  // Sync Edges: replace with valid mapped edges
  await RoadmapEdge.deleteMany({ roadmapId: roadmapObjId });

  const edgesToInsert = [];
  for (const e of payload.edges) {
    const source = clientToMongoId.get(e.sourceNodeId) || e.sourceNodeId;
    const target = clientToMongoId.get(e.targetNodeId) || e.targetNodeId;

    if (
      source &&
      target &&
      source !== target &&
      incomingNodeIds.has(source) &&
      incomingNodeIds.has(target)
    ) {
      edgesToInsert.push({
        roadmapId: roadmapObjId,
        sourceNodeId: source,
        targetNodeId: target,
        label: e.label || "",
        type: e.type || "smoothstep",
        animated: e.animated || false,
      });
    }
  }

  if (edgesToInsert.length > 0) {
    await RoadmapEdge.insertMany(edgesToInsert);
  }

  // Recalculate roadmap stats
  const allNodes = await RoadmapNode.find({ roadmapId: roadmapObjId });
  const total = allNodes.length;
  const completed = allNodes.filter((n) => n.status === "Completed").length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  roadmapDoc.totalTopics = total;
  roadmapDoc.completedTopics = completed;
  roadmapDoc.progress = progress;
  await roadmapDoc.save();

  return getRoadmapGraph(roadmapId);
}
