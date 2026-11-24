import { NextRequest } from "next/server";
import { getAllRoadmaps, createRoadmap, RoadmapFilterQuery } from "@/services/roadmapService";
import { roadmapSchema } from "@/lib/validations/roadmap";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const category = searchParams.get("category") || undefined;
    const difficulty = searchParams.get("difficulty") || undefined;
    const sortBy = (searchParams.get("sortBy") as RoadmapFilterQuery["sortBy"]) || undefined;
    const order = (searchParams.get("order") as RoadmapFilterQuery["order"]) || undefined;

    const roadmaps = await getAllRoadmaps({
      search,
      category,
      difficulty,
      sortBy,
      order,
    });

    return successResponse(roadmaps);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = roadmapSchema.parse(body);

    const newRoadmap = await createRoadmap(validatedData);
    return successResponse(newRoadmap, 201, "Roadmap created successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
