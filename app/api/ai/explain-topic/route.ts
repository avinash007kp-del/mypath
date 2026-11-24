import { NextRequest } from "next/server";
import { explainTopicSchema } from "@/lib/validations/ai";
import { explainTopicService } from "@/services/ai/topic-explainer";
import { successResponse, handleApiError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = explainTopicSchema.parse(body);

    const result = await explainTopicService(validatedData);
    return successResponse(result, 200, "Topic explanation generated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
