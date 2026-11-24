import { NextRequest } from "next/server";
import { aiChatSchema } from "@/lib/validations/ai";
import { sendChatMessageService } from "@/services/ai/chat-service";
import { successResponse, handleApiError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = aiChatSchema.parse(body);

    const result = await sendChatMessageService(validatedData);
    return successResponse(result, 200, "Message sent successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
