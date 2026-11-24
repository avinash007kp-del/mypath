import { NextRequest } from "next/server";
import { getResourceById, updateResource, deleteResource } from "@/services/lmsService";
import { updateLearningResourceSchema } from "@/lib/validations/lms";
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
    if (!isValidObjectId(id)) return errorResponse("Invalid resource ID format", 400);

    const resource = await getResourceById(id);
    if (!resource) return errorResponse("Resource not found", 404);
    return successResponse(resource);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    if (!isValidObjectId(id)) return errorResponse("Invalid resource ID format", 400);

    const body = await req.json();
    const validated = updateLearningResourceSchema.parse(body);

    const updated = await updateResource(id, validated);
    if (!updated) return errorResponse("Resource not found", 404);
    return successResponse(updated, 200, "Resource updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    if (!isValidObjectId(id)) return errorResponse("Invalid resource ID format", 400);

    const deleted = await deleteResource(id);
    if (!deleted) return errorResponse("Resource not found", 404);
    return successResponse(null, 200, "Resource deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
