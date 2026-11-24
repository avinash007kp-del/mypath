import { NextRequest } from "next/server";
import { breakdownTopicSchema } from "@/lib/validations/ai";
import {
  breakdownTopicService,
  addSubtasksToDailyGoals,
  addSubtopicsToRoadmapNode,
} from "@/services/ai/topic-breakdown";
import { successResponse, handleApiError, errorResponse } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check if this is an action request (add to goals or add to node)
    if (body.action === "add-to-goals") {
      const { date, subtasks, topicTitle, roadmapId, nodeId } = body;
      if (!subtasks || !Array.isArray(subtasks) || subtasks.length === 0) {
        return errorResponse("Subtasks array is required", 400);
      }
      const goalDate = date || new Date().toISOString().split("T")[0];
      const updatedGoal = await addSubtasksToDailyGoals(
        goalDate,
        subtasks,
        topicTitle || "Topic",
        roadmapId,
        nodeId
      );
      return successResponse(updatedGoal, 200, "Subtasks added to daily study goals");
    }

    if (body.action === "add-to-node") {
      const { nodeId, subtasks } = body;
      if (!nodeId || !subtasks || !Array.isArray(subtasks)) {
        return errorResponse("NodeId and subtasks array are required", 400);
      }
      const updatedNode = await addSubtopicsToRoadmapNode(nodeId, subtasks);
      return successResponse(updatedNode, 200, "Subtopics saved to roadmap node");
    }

    // Default: generate breakdown
    const validatedData = breakdownTopicSchema.parse(body);
    const result = await breakdownTopicService(validatedData);
    return successResponse(result, 200, "Topic breakdown generated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
