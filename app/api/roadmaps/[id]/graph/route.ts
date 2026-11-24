import { NextRequest } from "next/server";
import { getRoadmapGraph, saveGraphBatch } from "@/services/graphService";
import { roadmapGraphBatchSchema } from "@/lib/validations/roadmap-edge";
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

    const graph = await getRoadmapGraph(id);
    if (!graph) {
      return errorResponse("Roadmap not found", 404);
    }

    return successResponse(graph);
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
    const validatedData = roadmapGraphBatchSchema.parse(body);

    const savedGraph = await saveGraphBatch(id, validatedData as any);
    if (!savedGraph) {
      return errorResponse("Roadmap not found", 404);
    }

    return successResponse(savedGraph, 200, "Roadmap graph saved successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
