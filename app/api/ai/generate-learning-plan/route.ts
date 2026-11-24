import { NextRequest } from "next/server";
import { generateLearningPlanSchema } from "@/lib/validations/ai";
import { generateLearningPlanService } from "@/services/ai/learning-plan-generator";
import { successResponse, handleApiError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = generateLearningPlanSchema.parse(body);

    const result = await generateLearningPlanService(validatedData);
    return successResponse(result, 200, "Learning plan generated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
