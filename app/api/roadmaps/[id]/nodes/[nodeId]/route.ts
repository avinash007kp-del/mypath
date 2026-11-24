import { NextRequest } from "next/server";
import { updateGraphNode, deleteGraphNode } from "@/services/graphService";
import { updateRoadmapNodeSchema } from "@/lib/validations/roadmap-node";
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
    nodeId: string;
  };
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { nodeId } = params;
    if (!isValidObjectId(nodeId)) {
      return errorResponse("Invalid node ID format", 400);
    }

    const body = await request.json();
    const validatedData = updateRoadmapNodeSchema.parse(body);

    const updated = await updateGraphNode(nodeId, validatedData);
    if (!updated) {
      return errorResponse("Node not found", 404);
    }

    return successResponse(updated, 200, "Node updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { nodeId } = params;
    if (!isValidObjectId(nodeId)) {
      return errorResponse("Invalid node ID format", 400);
    }

    const deleted = await deleteGraphNode(nodeId);
    if (!deleted) {
      return errorResponse("Node not found", 404);
    }

    return successResponse(null, 200, "Node deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
