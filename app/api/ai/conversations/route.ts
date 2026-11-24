import { NextRequest } from "next/server";
import { listConversations } from "@/services/ai/chat-service";
import { successResponse, handleApiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const conversations = await listConversations(limit);
    return successResponse(conversations, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
