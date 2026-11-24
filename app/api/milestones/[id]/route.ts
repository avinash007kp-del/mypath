import { NextRequest } from "next/server";
import { getMilestoneById, updateMilestone, deleteMilestone } from "@/services/lmsService";
import { updateMilestoneSchema } from "@/lib/validations/lms";
import {
  successResponse,
  errorResponse,
  handleApiError,
  isValidObjectId,
} from "@/lib/api-response";

export const dynamic = "force-dynamic";

interface Params {
  params: { id: string };
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    if (!isValidObjectId(id)) return errorResponse("Invalid milestone ID format", 400);

    const milestone = await getMilestoneById(id);
    if (!milestone) return errorResponse("Milestone not found", 404);
    return successResponse(milestone);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    if (!isValidObjectId(id)) return errorResponse("Invalid milestone ID format", 400);

    const body = await req.json();
    const validated = updateMilestoneSchema.parse(body);

    const updated = await updateMilestone(id, validated);
    if (!updated) return errorResponse("Milestone not found", 404);
    return successResponse(updated, 200, "Milestone updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    if (!isValidObjectId(id)) return errorResponse("Invalid milestone ID format", 400);

    const deleted = await deleteMilestone(id);
    if (!deleted) return errorResponse("Milestone not found", 404);
    return successResponse(null, 200, "Milestone deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
