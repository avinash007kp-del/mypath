import { NextRequest } from "next/server";
import { suggestResourcesSchema } from "@/lib/validations/ai";
import { suggestResourcesService } from "@/services/ai/resource-suggester";
import { successResponse, handleApiError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = suggestResourcesSchema.parse(body);

    const result = await suggestResourcesService(validatedData);
    return successResponse(result, 200, "Resources suggested successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
