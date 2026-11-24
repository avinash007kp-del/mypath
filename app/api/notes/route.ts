import { NextRequest } from "next/server";
import { getNotes, createNote } from "@/services/lmsService";
import { learningNoteSchema } from "@/lib/validations/lms";
import { successResponse, handleApiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const roadmapId = searchParams.get("roadmapId") || undefined;
    const nodeId = searchParams.get("nodeId") || undefined;
    const tag = searchParams.get("tag") || undefined;

    const notes = await getNotes({ search, roadmapId, nodeId, tag });
    return successResponse(notes);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = learningNoteSchema.parse(body);

    const note = await createNote(validated);
    return successResponse(note, 201, "Note created successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
