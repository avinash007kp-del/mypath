import { connectToDatabase } from "@/lib/mongodb";
import Roadmap from "@/models/Roadmap";
import RoadmapNode from "@/models/RoadmapNode";
import RoadmapEdge from "@/models/RoadmapEdge";
import AIRecommendation from "@/models/AIRecommendation";
import { NextTopicResponse, NextTopicItem, RecommendationType } from "@/types/ai";
import { getLLMProvider } from "./providers/openai";

export async function recommendNextTopicsService(
  specificRoadmapId?: string,
  prioritizeQuickWins: boolean = false,
  userId?: string
): Promise<NextTopicResponse> {
  await connectToDatabase();

  const roadmapQuery = specificRoadmapId ? { _id: specificRoadmapId } : {};
  const roadmaps = await Roadmap.find(roadmapQuery).sort({ updatedAt: -1 }).limit(10).lean();

  if (roadmaps.length === 0) {
    return {
      summary:
        "No roadmaps found. Create or generate your first learning roadmap to receive personalized recommendations.",
      activeRoadmapsAnalyzed: 0,
      completedTopicsCount: 0,
      recommendations: [],
    };
  }

  const roadmapIds = roadmaps.map((r: any) => r._id.toString());
  const [nodes, edges] = await Promise.all([
    RoadmapNode.find({ roadmapId: { $in: roadmapIds } }).lean(),
    RoadmapEdge.find({ roadmapId: { $in: roadmapIds } }).lean(),
  ]);

  const roadmapMap = new Map<string, any>();
  for (const r of roadmaps as any[]) {
    roadmapMap.set(r._id.toString(), r);
  }

  // Node ID to Node map
  const nodeMap = new Map<string, any>();
  for (const n of nodes as any[]) {
    nodeMap.set(n._id.toString(), n);
  }

  // Map of targetNodeId -> sourceNodeIds (prerequisites)
  const incomingEdgesMap = new Map<string, string[]>();
  for (const e of edges as any[]) {
    const target = e.targetNodeId;
    const source = e.sourceNodeId;
    if (!incomingEdgesMap.has(target)) {
      incomingEdgesMap.set(target, []);
    }
    incomingEdgesMap.get(target)!.push(source);
  }

  // Find completed and candidate nodes
  let totalCompleted = 0;
  const candidates: Array<{
    node: any;
    prerequisitesMet: boolean;
    unmetPrerequisites: string[];
    isUnblocked: boolean;
  }> = [];

  for (const node of nodes as any[]) {
    if (node.status === "Completed") {
      totalCompleted++;
      continue;
    }

    // Ignore stage headers
    if (node.metadata?.isStageHeader) {
      continue;
    }

    const prereqSourceIds = incomingEdgesMap.get(node._id.toString()) || [];
    const unmetPrereqs: string[] = [];

    for (const sourceId of prereqSourceIds) {
      const sourceNode = nodeMap.get(sourceId);
      if (sourceNode && !sourceNode.metadata?.isStageHeader) {
        if (sourceNode.status !== "Completed") {
          unmetPrereqs.push(sourceNode.title);
        }
      }
    }

    const prerequisitesMet = unmetPrereqs.length === 0;

    candidates.push({
      node,
      prerequisitesMet,
      unmetPrerequisites: unmetPrereqs,
      isUnblocked: prerequisitesMet,
    });
  }

  // Filter to unblocked candidates, or candidates with at least status 'In Progress'
  const unblockedCandidates = candidates.filter(
    (c) => c.isUnblocked || c.node.status === "In Progress"
  );

  // Rank and score candidates
  const scoredItems: NextTopicItem[] = unblockedCandidates.map((c) => {
    const node = c.node;
    const roadmap = roadmapMap.get(node.roadmapId?.toString()) || { title: "Roadmap" };
    let score = 70;
    let type: RecommendationType = "next_topic";
    let rationale = "";

    const estimatedHours = node.estimatedHours || 2;
    const estimatedMinutes = estimatedHours * 60;

    if (node.status === "In Progress") {
      score += 25;
      type = "next_topic";
      rationale = `You've already started "${node.title}". Continuing this momentum will solidify your understanding and move you closer to roadmap completion.`;
    } else if (estimatedMinutes <= 60 && prioritizeQuickWins) {
      score += 20;
      type = "quick_win";
      rationale = `A focused quick win (~${estimatedMinutes} mins) that requires no unmet prerequisites. Great for maintaining study consistency today!`;
    } else if (node.priority === "High" || node.difficulty === "Advanced") {
      score += 15;
      type = "career_critical";
      rationale = `High-impact core skill that acts as a gateway for downstream advanced concepts in ${roadmap.title}.`;
    } else {
      score += 10;
      type = "next_topic";
      rationale = `All prerequisites for "${node.title}" are satisfied. It logically follows your completed topics in ${roadmap.title}.`;
    }

    if (prioritizeQuickWins && estimatedMinutes <= 45) {
      score += 15;
    }

    return {
      type,
      roadmapId: node.roadmapId.toString(),
      roadmapTitle: roadmap.title,
      nodeId: node._id.toString(),
      topicTitle: node.title,
      priorityScore: Math.min(score, 99),
      rationale,
      estimatedMinutes,
      difficulty: node.difficulty || "Intermediate",
      prerequisitesMet: c.prerequisitesMet,
      unmetPrerequisites: c.unmetPrerequisites,
      tags: [roadmap.category, node.difficulty].filter(Boolean),
    };
  });

  // Sort by priorityScore descending
  scoredItems.sort((a, b) => b.priorityScore - a.priorityScore);
  const topRecommendations = scoredItems.slice(0, 5);

  // If we have AI available, refine the summary & rationale with context
  let summary = `Analyzed ${roadmaps.length} active roadmap(s) and ${nodes.length} curriculum nodes. Identified ${topRecommendations.length} ready-to-learn topics based on completed prerequisites and study momentum.`;

  // Save recommendations to MongoDB for persistence
  try {
    for (const rec of topRecommendations) {
      await AIRecommendation.findOneAndUpdate(
        { nodeId: rec.nodeId, roadmapId: rec.roadmapId, status: "active" },
        {
          type: rec.type,
          roadmapTitle: rec.roadmapTitle,
          topicTitle: rec.topicTitle,
          score: rec.priorityScore,
          rationale: rec.rationale,
          estimatedMinutes: rec.estimatedMinutes,
          prerequisitesMet: rec.prerequisitesMet,
          unmetPrerequisites: rec.unmetPrerequisites,
          difficulty: rec.difficulty,
          userId,
        },
        { upsert: true, new: true }
      );
    }
  } catch (err) {
    console.warn("Failed to cache AI recommendations:", err);
  }

  return {
    summary,
    activeRoadmapsAnalyzed: roadmaps.length,
    completedTopicsCount: totalCompleted,
    recommendations: topRecommendations,
  };
}
