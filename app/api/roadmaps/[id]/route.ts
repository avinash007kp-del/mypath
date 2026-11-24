import { NextRequest } from "next/server";
import { getRoadmapById, updateRoadmap, deleteRoadmap } from "@/services/roadmapService";
import { updateRoadmapSchema } from "@/lib/validations/roadmap";
import {
  successResponse,
  errorResponse,
  isValidObjectId,
  handleApiError,
} from "@/lib/api-response";

export const dynamic = "force-dynamic";

interface Params {
  params: {
    id: string;
  };
}

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = params;

    if (!isValidObjectId(id)) {
      return errorResponse("Invalid roadmap ID format", 400);
    }

    const roadmap = await getRoadmapById(id);
    if (!roadmap) {
      return errorResponse("Roadmap not found", 404);
    }

    return successResponse(roadmap);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;

    if (!isValidObjectId(id)) {
      return errorResponse("Invalid roadmap ID format", 400);
    }

    const body = await request.json();
    const validatedData = updateRoadmapSchema.parse(body);

    const updated = await updateRoadmap(id, validatedData);
    if (!updated) {
      return errorResponse("Roadmap not found", 404);
    }

    return successResponse(updated, 200, "Roadmap updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = params;

    if (!isValidObjectId(id)) {
      return errorResponse("Invalid roadmap ID format", 400);
    }

    const deleted = await deleteRoadmap(id);
    if (!deleted) {
      return errorResponse("Roadmap not found", 404);
    }

    return successResponse(null, 200, "Roadmap deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
