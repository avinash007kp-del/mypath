import { NextRequest } from "next/server";
import { getRoadmapProgressAnalytics } from "@/services/analytics";
import { analyticsQuerySchema } from "@/lib/validations/analytics";
import { successResponse, handleApiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = analyticsQuerySchema.parse({
      dateRange: searchParams.get("dateRange") || "30d",
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      roadmapId: searchParams.get("roadmapId") || "All",
      period: searchParams.get("period") || "weekly",
    });

    const data = await getRoadmapProgressAnalytics(query);
    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
