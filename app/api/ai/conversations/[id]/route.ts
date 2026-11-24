import { NextRequest } from "next/server";
import { getConversationWithMessages, deleteConversation } from "@/services/ai/chat-service";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const data = await getConversationWithMessages(params.id);
    if (!data) {
      return errorResponse("Conversation not found", 404);
    }
    return successResponse(data, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    await deleteConversation(params.id);
    return successResponse(null, 200, "Conversation deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
