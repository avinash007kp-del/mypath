import { NextRequest } from "next/server";
import { createGraphNode } from "@/services/graphService";
import { roadmapNodeSchema } from "@/lib/validations/roadmap-node";
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
    const validatedData = roadmapNodeSchema.parse(body);

    const node = await createGraphNode(id, validatedData);
    return successResponse(node, 201, "Node created successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
