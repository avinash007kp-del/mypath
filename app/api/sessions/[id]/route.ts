import { NextRequest } from "next/server";
import { completeStudySession, deleteStudySession } from "@/services/lmsService";
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

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    if (!isValidObjectId(id)) return errorResponse("Invalid session ID format", 400);

    const body = await req.json();
    const session = await completeStudySession(id, {
      durationMinutes: body.durationMinutes,
      reflection: body.reflection,
    });

    if (!session) return errorResponse("Session not found", 404);
    return successResponse(session, 200, "Study session completed");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    if (!isValidObjectId(id)) return errorResponse("Invalid session ID format", 400);

    const deleted = await deleteStudySession(id);
    if (!deleted) return errorResponse("Session not found", 404);
    return successResponse(null, 200, "Session deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
