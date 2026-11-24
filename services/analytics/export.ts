import { connectToDatabase } from "@/lib/mongodb";
import StudySession from "@/models/StudySession";
import { AnalyticsExportRow } from "@/types/analytics";
import { AnalyticsQueryInput } from "@/lib/validations/analytics";
import { calculateDateRanges, buildRoadmapScope, formatLocalDate } from "./utils";

export async function getAnalyticsExportData(
  filters: AnalyticsQueryInput
): Promise<AnalyticsExportRow[]> {
  await connectToDatabase();

  const { start, end } = calculateDateRanges(filters.dateRange, filters.startDate, filters.endDate);

  const roadmapScope = buildRoadmapScope(filters.roadmapId);

  const sessions = await StudySession.find({
    status: "completed",
    ...roadmapScope,
    $or: [{ startedAt: { $gte: start, $lte: end } }, { sessionDate: { $gte: start, $lte: end } }],
  })
    .populate("roadmapId", "title")
    .sort({ startedAt: -1 })
    .lean<any[]>();

  return sessions.map((s) => ({
    date: formatLocalDate(new Date(s.sessionDate || s.startedAt)),
    roadmap: s.roadmapId?.title || "General Study",
    topic: s.title || "Deep Work Study Session",
    durationMinutes: s.durationMinutes || 0,
    sessionCount: 1,
    status: s.status || "completed",
  }));
}
