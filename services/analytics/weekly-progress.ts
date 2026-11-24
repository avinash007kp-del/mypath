import { connectToDatabase } from "@/lib/mongodb";
import StudySession from "@/models/StudySession";
import LearningProgress from "@/models/LearningProgress";
import DailyGoal from "@/models/DailyGoal";
import Roadmap from "@/models/Roadmap";
import { WeeklyProgressAnalytics } from "@/types/analytics";
import { AnalyticsQueryInput } from "@/lib/validations/analytics";
import { buildRoadmapScope, formatLocalDate } from "./utils";

export async function getWeeklyProgressAnalytics(
  filters: AnalyticsQueryInput
): Promise<WeeklyProgressAnalytics> {
  await connectToDatabase();

  const roadmapScope = buildRoadmapScope(filters.roadmapId);

  // 1. Calculate Current Week and Previous Week boundaries (Monday to Sunday)
  const now = new Date();
  const currentDay = now.getDay();
  // Monday of current week:
  const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
  const currentWeekStart = new Date(now);
  currentWeekStart.setDate(now.getDate() + diffToMonday);
  currentWeekStart.setHours(0, 0, 0, 0);

  const currentWeekEnd = new Date(currentWeekStart);
  currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
  currentWeekEnd.setHours(23, 59, 59, 999);

  // Monday of previous week:
  const prevWeekStart = new Date(currentWeekStart);
  prevWeekStart.setDate(currentWeekStart.getDate() - 7);
  prevWeekStart.setHours(0, 0, 0, 0);

  const prevWeekEnd = new Date(prevWeekStart);
  prevWeekEnd.setDate(prevWeekStart.getDate() + 6);
  prevWeekEnd.setHours(23, 59, 59, 999);

  // 2. Fetch study sessions for Current Week and Previous Week
  const [
    currentWeekSessions,
    prevWeekSessions,
    currentWeekTopics,
    prevWeekTopics,
    currentGoals,
    prevGoals,
  ] = await Promise.all([
    StudySession.find({
      status: "completed",
      ...roadmapScope,
      $or: [
        { startedAt: { $gte: currentWeekStart, $lte: currentWeekEnd } },
        { sessionDate: { $gte: currentWeekStart, $lte: currentWeekEnd } },
      ],
    })
      .populate("roadmapId", "title")
      .lean<any[]>(),

    StudySession.find({
      status: "completed",
      ...roadmapScope,
      $or: [
        { startedAt: { $gte: prevWeekStart, $lte: prevWeekEnd } },
        { sessionDate: { $gte: prevWeekStart, $lte: prevWeekEnd } },
      ],
    })
      .populate("roadmapId", "title")
      .lean<any[]>(),

    LearningProgress.countDocuments({
      status: "Completed",
      completedAt: { $gte: currentWeekStart, $lte: currentWeekEnd },
      ...roadmapScope,
    }),

    LearningProgress.countDocuments({
      status: "Completed",
      completedAt: { $gte: prevWeekStart, $lte: prevWeekEnd },
      ...roadmapScope,
    }),

    DailyGoal.find({
      date: {
        $gte: formatLocalDate(currentWeekStart),
        $lte: formatLocalDate(currentWeekEnd),
      },
    }).lean(),

    DailyGoal.find({
      date: {
        $gte: formatLocalDate(prevWeekStart),
        $lte: formatLocalDate(prevWeekEnd),
      },
    }).lean(),
  ]);

  // Current Week Totals
  const currentTotalMins = currentWeekSessions.reduce(
    (acc, s) => acc + (s.durationMinutes || 0),
    0
  );
  const currentActualHours = Number((currentTotalMins / 60).toFixed(1));

  // Determine target hours from daily goals or default 12 hours
  const goalTargetMins = currentGoals.reduce((acc, g) => acc + (g.targetMinutes || 0), 0);
  const targetHours = goalTargetMins > 0 ? Number((goalTargetMins / 60).toFixed(1)) : 12;
  const remainingHours = Math.max(0, Number((targetHours - currentActualHours).toFixed(1)));
  const completionPercentage = Math.min(100, Math.round((currentActualHours / targetHours) * 100));

  // Previous Week Totals
  const prevTotalMins = prevWeekSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const prevActualHours = Number((prevTotalMins / 60).toFixed(1));

  // Comparison Metrics
  const hoursDiff = Number((currentActualHours - prevActualHours).toFixed(1));
  let hoursPercentChange = 0;
  if (prevActualHours > 0) {
    hoursPercentChange = Number(
      (((currentActualHours - prevActualHours) / prevActualHours) * 100).toFixed(1)
    );
  } else if (currentActualHours > 0) {
    hoursPercentChange = 100;
  }

  const topicsDiff = currentWeekTopics - prevWeekTopics;
  const currentDailyAvg = Number((currentTotalMins / 7 / 60).toFixed(1));
  const prevDailyAvg = Number((prevTotalMins / 7 / 60).toFixed(1));
  const dailyAvgDiff = Number((currentDailyAvg - prevDailyAvg).toFixed(1));

  const currentGoalRate =
    currentGoals.length > 0
      ? Math.round(
          (currentGoals.filter((g) => g.completedMinutes >= g.targetMinutes).length /
            currentGoals.length) *
            100
        )
      : 0;
  const prevGoalRate =
    prevGoals.length > 0
      ? Math.round(
          (prevGoals.filter((g) => g.completedMinutes >= g.targetMinutes).length /
            prevGoals.length) *
            100
        )
      : 0;
  const goalRateDiff = currentGoalRate - prevGoalRate;

  // 3. Weekly Activity Grouped Bar Data (Mon to Sun)
  const weekdays = [
    { day: "Mon", weekdayIndex: 1 },
    { day: "Tue", weekdayIndex: 2 },
    { day: "Wed", weekdayIndex: 3 },
    { day: "Thu", weekdayIndex: 4 },
    { day: "Fri", weekdayIndex: 5 },
    { day: "Sat", weekdayIndex: 6 },
    { day: "Sun", weekdayIndex: 0 },
  ];

  const currentDayMins = new Map<number, number>();
  const prevDayMins = new Map<number, number>();
  weekdays.forEach((w) => {
    currentDayMins.set(w.weekdayIndex, 0);
    prevDayMins.set(w.weekdayIndex, 0);
  });

  currentWeekSessions.forEach((s) => {
    const d = new Date(s.sessionDate || s.startedAt).getDay();
    currentDayMins.set(d, (currentDayMins.get(d) || 0) + (s.durationMinutes || 0));
  });

  prevWeekSessions.forEach((s) => {
    const d = new Date(s.sessionDate || s.startedAt).getDay();
    prevDayMins.set(d, (prevDayMins.get(d) || 0) + (s.durationMinutes || 0));
  });

  const weeklyActivity = weekdays.map((w) => ({
    day: w.day,
    currentWeekHours: Number(((currentDayMins.get(w.weekdayIndex) || 0) / 60).toFixed(1)),
    previousWeekHours: Number(((prevDayMins.get(w.weekdayIndex) || 0) / 60).toFixed(1)),
  }));

  // 4. Weekly Insights
  let mostProductiveDay = "None";
  let maxDayMins = -1;
  let leastActiveDay = "None";
  let minDayMins = 999999;

  weekdays.forEach((w) => {
    const mins = currentDayMins.get(w.weekdayIndex) || 0;
    if (mins > maxDayMins && mins > 0) {
      maxDayMins = mins;
      mostProductiveDay = w.day;
    }
    if (mins < minDayMins) {
      minDayMins = mins;
      leastActiveDay = w.day;
    }
  });

  // Most studied roadmap this week
  const roadmapCountMap = new Map<string, number>();
  currentWeekSessions.forEach((s) => {
    const name = s.roadmapId?.title || "General Study";
    roadmapCountMap.set(name, (roadmapCountMap.get(name) || 0) + (s.durationMinutes || 0));
  });

  let mostStudiedRoadmap = "General Study";
  let maxRoadmapMins = 0;
  roadmapCountMap.forEach((mins, name) => {
    if (mins > maxRoadmapMins) {
      maxRoadmapMins = mins;
      mostStudiedRoadmap = name;
    }
  });

  return {
    currentWeek: {
      targetHours,
      actualHours: currentActualHours,
      remainingHours,
      completionPercentage,
      topicsCompleted: currentWeekTopics,
      sessionsCompleted: currentWeekSessions.length,
    },
    comparison: {
      hoursDiff,
      hoursPercentChange,
      topicsDiff,
      dailyAvgDiff,
      goalRateDiff,
    },
    weeklyActivity,
    insights: {
      mostProductiveDay: mostProductiveDay === "None" ? "N/A" : mostProductiveDay,
      leastActiveDay: leastActiveDay === "None" ? "N/A" : leastActiveDay,
      mostStudiedRoadmap: currentWeekSessions.length > 0 ? mostStudiedRoadmap : "N/A",
      totalStudyTimeHours: currentActualHours,
      percentageChangeFromPrevWeek: hoursPercentChange,
    },
  };
}
