import { NextRequest } from "next/server";
import { saveGeneratedRoadmapSchema } from "@/lib/validations/ai";
import { convertGeneratedRoadmapToVisualRoadmap } from "@/services/ai/roadmap-generator";
import { successResponse, handleApiError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = saveGeneratedRoadmapSchema.parse(body);

    const result = await convertGeneratedRoadmapToVisualRoadmap(
      validatedData.generatedRoadmapId,
      validatedData.customTitle
    );

    return successResponse(
      result,
      200,
      "Roadmap saved and converted to visual canvas successfully"
    );
  } catch (error) {
    return handleApiError(error);
  }
}
