import { NextRequest } from "next/server";
import { deleteGraphEdge } from "@/services/graphService";
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
    edgeId: string;
  };
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { edgeId } = params;
    if (!isValidObjectId(edgeId)) {
      return errorResponse("Invalid edge ID format", 400);
    }

    const deleted = await deleteGraphEdge(edgeId);
    if (!deleted) {
      return errorResponse("Edge not found", 404);
    }

    return successResponse(null, 200, "Edge deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
