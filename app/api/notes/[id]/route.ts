import { NextRequest } from "next/server";
import { getNoteById, updateNote, deleteNote } from "@/services/lmsService";
import { updateLearningNoteSchema } from "@/lib/validations/lms";
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

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    if (!isValidObjectId(id)) return errorResponse("Invalid note ID format", 400);

    const note = await getNoteById(id);
    if (!note) return errorResponse("Note not found", 404);
    return successResponse(note);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    if (!isValidObjectId(id)) return errorResponse("Invalid note ID format", 400);

    const body = await req.json();
    const validated = updateLearningNoteSchema.parse(body);

    const updated = await updateNote(id, validated);
    if (!updated) return errorResponse("Note not found", 404);
    return successResponse(updated, 200, "Note updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    if (!isValidObjectId(id)) return errorResponse("Invalid note ID format", 400);

    const deleted = await deleteNote(id);
    if (!deleted) return errorResponse("Note not found", 404);
    return successResponse(null, 200, "Note deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
