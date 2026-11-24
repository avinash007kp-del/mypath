import { NextRequest } from "next/server";
import { generateQuizSchema } from "@/lib/validations/ai";
import { generateQuizService } from "@/services/ai/quiz-generator";
import { successResponse, handleApiError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = generateQuizSchema.parse(body);

    const result = await generateQuizService(validatedData);
    return successResponse(result, 200, "Quiz generated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
