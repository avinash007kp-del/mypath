import { getLMSDashboardOverview } from "@/services/lmsService";
import { successResponse, handleApiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const overview = await getLMSDashboardOverview();
    return successResponse(overview);
  } catch (error) {
    return handleApiError(error);
  }
}
