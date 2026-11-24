import { NextRequest } from "next/server";
import { updateDailyGoal } from "@/services/lmsService";
import { updateDailyGoalSchema } from "@/lib/validations/lms";
import { successResponse, handleApiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

interface Params {
  params: { id: string };
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = params; // id can be date "YYYY-MM-DD"
    const body = await req.json();
    const validated = updateDailyGoalSchema.parse(body);

    const goal = await updateDailyGoal(id, validated as any);
    return successResponse(goal, 200, "Daily goal updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
