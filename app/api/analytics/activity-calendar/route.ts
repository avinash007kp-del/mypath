import { NextRequest } from "next/server";
import { getActivityCalendarAnalytics } from "@/services/analytics";
import { activityCalendarQuerySchema } from "@/lib/validations/analytics";
import { successResponse, handleApiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = activityCalendarQuerySchema.parse({
      year: searchParams.get("year") || undefined,
      roadmapId: searchParams.get("roadmapId") || "All",
      filterType: searchParams.get("filterType") || "all",
    });

    const data = await getActivityCalendarAnalytics(query);
    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
