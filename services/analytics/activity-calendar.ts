import { connectToDatabase } from "@/lib/mongodb";
import StudySession from "@/models/StudySession";
import LearningProgress from "@/models/LearningProgress";
import DailyGoal from "@/models/DailyGoal";
import LearningNote from "@/models/LearningNote";
import Roadmap from "@/models/Roadmap";
import { HeatmapDay, ActivityCalendarDayDetails } from "@/types/analytics";
import { ActivityCalendarQueryInput, DayDetailsQueryInput } from "@/lib/validations/analytics";
import { buildRoadmapScope, formatLocalDate } from "./utils";

export async function getActivityCalendarAnalytics(query: ActivityCalendarQueryInput): Promise<{
  days: HeatmapDay[];
  totalYearMinutes: number;
  totalYearHours: number;
  activeDaysCount: number;
}> {
  await connectToDatabase();

  const now = new Date();
  const year = query.year || now.getFullYear();

  // Trailing 365 days / 12 months from end of selected year
  const end = new Date(
    year,
    now.getFullYear() === year ? now.getMonth() : 11,
    now.getFullYear() === year ? now.getDate() : 31,
    23,
    59,
    59,
    999
  );
  const start = new Date(end);
  start.setDate(start.getDate() - 364);
  start.setHours(0, 0, 0, 0);

  const roadmapScope = buildRoadmapScope(query.roadmapId);

  // Fetch completed sessions
  const sessions = await StudySession.find({
    status: "completed",
    ...roadmapScope,
    $or: [{ startedAt: { $gte: start, $lte: end } }, { sessionDate: { $gte: start, $lte: end } }],
  })
    .select("startedAt sessionDate durationMinutes")
    .lean<any[]>();

  // Optional: Fetch topic completions if filtering by topics or all
  const topicCompletions = await LearningProgress.find({
    status: "Completed",
    completedAt: { $gte: start, $lte: end },
    ...roadmapScope,
  })
    .select("completedAt totalLearningMinutes")
    .lean<any[]>();

  const dayMap = new Map<string, { minutes: number; count: number }>();

  if (query.filterType === "all" || query.filterType === "sessions") {
    sessions.forEach((s) => {
      const d = s.sessionDate || s.startedAt;
      if (!d) return;
      const dStr = formatLocalDate(new Date(d));
      const curr = dayMap.get(dStr) || { minutes: 0, count: 0 };
      curr.minutes += s.durationMinutes || 0;
      curr.count += 1;
      dayMap.set(dStr, curr);
    });
  }

  if (query.filterType === "all" || query.filterType === "topics") {
    topicCompletions.forEach((t) => {
      if (!t.completedAt) return;
      const dStr = formatLocalDate(new Date(t.completedAt));
      const curr = dayMap.get(dStr) || { minutes: 0, count: 0 };
      if (query.filterType === "topics") {
        curr.minutes += t.totalLearningMinutes || 30; // default topic value
        curr.count += 1;
      }
      dayMap.set(dStr, curr);
    });
  }

  const days: HeatmapDay[] = [];
  let totalYearMinutes = 0;
  let activeDaysCount = 0;

  const cursor = new Date(start);
  while (cursor <= end) {
    const dStr = formatLocalDate(cursor);
    const dayData = dayMap.get(dStr) || { minutes: 0, count: 0 };
    const mins = dayData.minutes;

    if (mins > 0) activeDaysCount++;
    totalYearMinutes += mins;

    let intensity: 0 | 1 | 2 | 3 | 4 = 0;
    if (mins >= 120) intensity = 4;
    else if (mins >= 60) intensity = 3;
    else if (mins >= 30) intensity = 2;
    else if (mins > 0) intensity = 1;

    days.push({
      date: dStr,
      minutes: mins,
      hours: Number((mins / 60).toFixed(1)),
      count: dayData.count,
      intensity,
    });

    cursor.setDate(cursor.getDate() + 1);
  }

  return {
    days,
    totalYearMinutes,
    totalYearHours: Number((totalYearMinutes / 60).toFixed(1)),
    activeDaysCount,
  };
}

/**
 * Detailed Day Inspection on Click
 */
export async function getDayDetails(
  query: DayDetailsQueryInput
): Promise<ActivityCalendarDayDetails> {
  await connectToDatabase();

  const { date, roadmapId } = query;
  const startOfDay = new Date(date + "T00:00:00");
  const endOfDay = new Date(date + "T23:59:59.999");
  const roadmapScope = buildRoadmapScope(roadmapId);

  // 1. Fetch study sessions for this date
  const sessions = await StudySession.find({
    status: "completed",
    ...roadmapScope,
    $or: [
      { startedAt: { $gte: startOfDay, $lte: endOfDay } },
      { sessionDate: { $gte: startOfDay, $lte: endOfDay } },
    ],
  })
    .populate("roadmapId", "title")
    .lean<any[]>();

  // 2. Fetch completed topics for this date
  const completedNodes = await LearningProgress.find({
    status: "Completed",
    completedAt: { $gte: startOfDay, $lte: endOfDay },
    ...roadmapScope,
  })
    .populate("roadmapId", "title")
    .lean<any[]>();

  // 3. Fetch daily goal tasks for this date
  const dailyGoal = await DailyGoal.findOne({ date }).lean<any>();
  const completedTasks = (dailyGoal?.tasks || [])
    .filter((t: any) => t.completed)
    .map((t: any) => ({
      title: t.title,
      roadmapTitle: t.roadmapTitle,
    }));

  // 4. Fetch notes created on this date
  const notes = await LearningNote.find({
    createdAt: { $gte: startOfDay, $lte: endOfDay },
    ...roadmapScope,
  })
    .populate("roadmapId", "title")
    .select("title roadmapId")
    .lean<any[]>();

  let totalMinutes = 0;
  const roadmapsSet = new Set<string>();

  const formattedSessions = sessions.map((s) => {
    totalMinutes += s.durationMinutes || 0;
    const rTitle = s.roadmapId?.title || "General Study";
    roadmapsSet.add(rTitle);
    return {
      _id: s._id.toString(),
      title: s.title || "Study Session",
      durationMinutes: s.durationMinutes || 0,
      roadmapTitle: rTitle,
      reflection: s.reflection || "",
    };
  });

  const topicsStudied = completedNodes.map((c) => {
    const rTitle = c.roadmapId?.title || "Roadmap Topic";
    roadmapsSet.add(rTitle);
    return {
      title: c.nodeTitle || "Learning Topic",
      roadmapTitle: rTitle,
    };
  });

  const notesCreated = notes.map((n) => ({
    _id: n._id.toString(),
    title: n.title,
    roadmapTitle: n.roadmapId?.title,
  }));

  return {
    date,
    totalMinutes,
    totalHours: Number((totalMinutes / 60).toFixed(1)),
    sessionCount: formattedSessions.length,
    sessions: formattedSessions,
    topicsStudied,
    roadmapsWorkedOn: Array.from(roadmapsSet),
    completedTasks,
    notesCreated,
  };
}
