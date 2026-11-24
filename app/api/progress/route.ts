import { NextRequest } from "next/server";
import { getTopicProgress, updateTopicProgress } from "@/services/lmsService";
import { learningProgressSchema } from "@/lib/validations/lms";
import {
  successResponse,
  errorResponse,
  handleApiError,
  isValidObjectId,
} from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roadmapId = searchParams.get("roadmapId");
    const nodeId = searchParams.get("nodeId");

    if (!roadmapId || !nodeId) {
      return errorResponse("roadmapId and nodeId are required", 400);
    }

    const progress = await getTopicProgress(roadmapId, nodeId);
    return successResponse(progress);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = learningProgressSchema.parse(body);

    const progress = await updateTopicProgress(validated.roadmapId, validated.nodeId, {
      status: validated.status as any,
      progressPercentage: validated.progressPercentage as any,
      learningMinutesToAdd: validated.totalLearningMinutes,
    });

    return successResponse(progress, 200, "Progress updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
