import { NextRequest } from "next/server";
import { getMilestones, createMilestone } from "@/services/lmsService";
import { milestoneSchema } from "@/lib/validations/lms";
import { successResponse, handleApiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roadmapId = searchParams.get("roadmapId") || undefined;
    const status = searchParams.get("status") || undefined;
    const priority = searchParams.get("priority") || undefined;

    const milestones = await getMilestones({ roadmapId, status, priority });
    return successResponse(milestones);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = milestoneSchema.parse(body);

    const milestone = await createMilestone(validated);
    return successResponse(milestone, 201, "Milestone created successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
