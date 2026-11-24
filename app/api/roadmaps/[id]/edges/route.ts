import { NextRequest } from "next/server";
import { createGraphEdge } from "@/services/graphService";
import { roadmapEdgeSchema } from "@/lib/validations/roadmap-edge";
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

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    if (!isValidObjectId(id)) {
      return errorResponse("Invalid roadmap ID format", 400);
    }

    const body = await request.json();
    const validatedData = roadmapEdgeSchema.parse(body);

    const result = await createGraphEdge(id, validatedData);
    if (!result.edge) {
      return errorResponse(result.error || "Failed to create edge", 400);
    }

    return successResponse(result.edge, 201, "Edge created successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
