import { NextRequest } from "next/server";
import { getResources, createResource } from "@/services/lmsService";
import { learningResourceSchema } from "@/lib/validations/lms";
import { successResponse, handleApiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const roadmapId = searchParams.get("roadmapId") || undefined;
    const nodeId = searchParams.get("nodeId") || undefined;
    const type = searchParams.get("type") || undefined;
    const status = searchParams.get("status") || undefined;
    const isFavorite = searchParams.get("isFavorite") === "true" ? true : undefined;

    const resources = await getResources({ search, roadmapId, nodeId, type, status, isFavorite });
    return successResponse(resources);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = learningResourceSchema.parse(body);

    const resource = await createResource(validated);
    return successResponse(resource, 201, "Resource added successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
