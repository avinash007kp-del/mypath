import { getDashboardStats } from "@/services/dashboardService";
import { successResponse, handleApiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = await getDashboardStats();
    return successResponse(stats);
  } catch (error) {
    return handleApiError(error);
  }
}
