import { NextRequest } from "next/server";
import { generateRoadmapSchema } from "@/lib/validations/ai";
import { generateRoadmapService } from "@/services/ai/roadmap-generator";
import { successResponse, handleApiError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = generateRoadmapSchema.parse(body);

    const result = await generateRoadmapService(validatedData);
    return successResponse(result, 201, "Roadmap generated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
