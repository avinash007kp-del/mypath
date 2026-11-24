import { NextRequest } from "next/server";
import { saveGraphViewport } from "@/services/graphService";
import { roadmapViewportSchema } from "@/lib/validations/roadmap-edge";
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

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    if (!isValidObjectId(id)) {
      return errorResponse("Invalid roadmap ID format", 400);
    }

    const body = await request.json();
    const validatedData = roadmapViewportSchema.parse(body);

    const saved = await saveGraphViewport(id, validatedData);
    return successResponse(saved, 200, "Viewport updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
