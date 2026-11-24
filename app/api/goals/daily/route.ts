import { NextRequest } from "next/server";
import { getDailyGoal, updateDailyGoal } from "@/services/lmsService";
import { dailyGoalSchema } from "@/lib/validations/lms";
import { successResponse, handleApiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

    const goal = await getDailyGoal(date);
    return successResponse(goal);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = dailyGoalSchema.parse(body);

    const goal = await updateDailyGoal(validated.date, validated);
    return successResponse(goal, 200, "Daily goal saved successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
