import { NextRequest } from "next/server";
import {
  getStudySessions,
  getActiveStudySession,
  startStudySession,
  logManualStudySession,
} from "@/services/lmsService";
import { studySessionSchema } from "@/lib/validations/lms";
import { successResponse, handleApiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get("active") === "true";
    const roadmapId = searchParams.get("roadmapId") || undefined;
    const nodeId = searchParams.get("nodeId") || undefined;
    const status = searchParams.get("status") || undefined;

    if (active) {
      const activeSession = await getActiveStudySession();
      return successResponse(activeSession);
    }

    const sessions = await getStudySessions({ roadmapId, nodeId, status });
    return successResponse(sessions);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // If manual past entry with sessionDate
    if (body.isManual || body.sessionDate) {
      const validated = studySessionSchema.parse(body);
      const session = await logManualStudySession({
        roadmapId: validated.roadmapId,
        nodeId: validated.nodeId,
        title: validated.title,
        sessionDate: validated.sessionDate || new Date().toISOString(),
        durationMinutes: validated.durationMinutes || 30,
        reflection: validated.reflection,
      });
      return successResponse(session, 201, "Study session logged successfully");
    }

    // Start live timer session
    const session = await startStudySession({
      roadmapId: body.roadmapId,
      nodeId: body.nodeId,
      title: body.title,
    });
    return successResponse(session, 201, "Study timer started");
  } catch (error) {
    return handleApiError(error);
  }
}
