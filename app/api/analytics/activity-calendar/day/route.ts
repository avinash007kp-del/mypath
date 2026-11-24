import { NextRequest } from "next/server";
import { getDayDetails } from "@/services/analytics";
import { dayDetailsQuerySchema } from "@/lib/validations/analytics";
import { successResponse, handleApiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = dayDetailsQuerySchema.parse({
      date: searchParams.get("date"),
      roadmapId: searchParams.get("roadmapId") || "All",
    });

    const data = await getDayDetails(query);
    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
