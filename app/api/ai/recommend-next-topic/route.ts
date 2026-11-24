import { NextRequest } from "next/server";
import { recommendNextTopicsService } from "@/services/ai/next-topic-recommender";
import { successResponse, handleApiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roadmapId = searchParams.get("roadmapId") || undefined;
    const prioritizeQuickWins = searchParams.get("quickWins") === "true";

    const result = await recommendNextTopicsService(roadmapId, prioritizeQuickWins);

    return successResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const roadmapId = body.roadmapId || undefined;
    const prioritizeQuickWins = Boolean(body.prioritizeQuickWins);

    const result = await recommendNextTopicsService(roadmapId, prioritizeQuickWins);

    return successResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
