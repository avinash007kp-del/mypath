import { getDashboardActivity } from "@/services/dashboardService";
import { successResponse, handleApiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const activity = await getDashboardActivity();
    return successResponse(activity);
  } catch (error) {
    return handleApiError(error);
  }
}
