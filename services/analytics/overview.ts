import { connectToDatabase } from "@/lib/mongodb";
import StudySession from "@/models/StudySession";
import Roadmap from "@/models/Roadmap";
import RoadmapNode from "@/models/RoadmapNode";
import DailyGoal from "@/models/DailyGoal";
import { OverviewStats } from "@/types/analytics";
import { AnalyticsQueryInput } from "@/lib/validations/analytics";
import { calculateDateRanges, buildRoadmapScope, formatLocalDate } from "./utils";
import { calculateStreakStats } from "./streaks";

export async function getOverviewAnalytics(filters: AnalyticsQueryInput): Promise<OverviewStats> {
  await connectToDatabase();

  const { start, end, prevStart, prevEnd, totalDays } = calculateDateRanges(
    filters.dateRange,
    filters.startDate,
    filters.endDate
  );

  const roadmapScope = buildRoadmapScope(filters.roadmapId);

  // 1. Current Period Study Hours Aggregation
  const currentHoursPromise = StudySession.aggregate([
    {
      $match: {
        status: "completed",
        ...roadmapScope,
        $or: [
          { startedAt: { $gte: start, $lte: end } },
          { sessionDate: { $gte: start, $lte: end } },
        ],
      },
    },
    {
      $group: {
        _id: null,
        totalMinutes: { $sum: "$durationMinutes" },
      },
    },
  ]);

  // Previous Period Study Hours Aggregation
  const prevHoursPromise = StudySession.aggregate([
    {
      $match: {
        status: "completed",
        ...roadmapScope,
        $or: [
          { startedAt: { $gte: prevStart, $lte: prevEnd } },
          { sessionDate: { $gte: prevStart, $lte: prevEnd } },
        ],
      },
    },
    {
      $group: {
        _id: null,
        totalMinutes: { $sum: "$durationMinutes" },
      },
    },
  ]);

  // 2. Topics Completed (Only counting eligible learning topics, excluding resource/milestone)
  const nodeQuery = {
    ...roadmapScope,
    type: { $in: ["topic", "subtopic", "project"] },
  };
  const totalEligibleTopicsPromise = RoadmapNode.countDocuments(nodeQuery);
  const completedTopicsPromise = RoadmapNode.countDocuments({
    ...nodeQuery,
    status: "Completed",
  });

  // 3. Roadmap Counts
  const roadmapsPromise = Roadmap.find(roadmapScope).select("progress").lean();

  // 4. Streaks
  const streakPromise = calculateStreakStats(filters.roadmapId);

  // 5. Daily Goals in Date Range
  const startStr = formatLocalDate(start);
  const endStr = formatLocalDate(end);
  const goalsPromise = DailyGoal.find({
    date: { $gte: startStr, $lte: endStr },
  }).lean();

  // Run all in parallel
  const [
    currentHoursRes,
    prevHoursRes,
    totalTopics,
    topicsCompleted,
    roadmaps,
    streakStats,
    goals,
  ] = await Promise.all([
    currentHoursPromise,
    prevHoursPromise,
    totalEligibleTopicsPromise,
    completedTopicsPromise,
    roadmapsPromise,
    streakPromise,
    goalsPromise,
  ]);

  // Card 1 Calculations
  const totalMinutes = currentHoursRes[0]?.totalMinutes || 0;
  const prevMinutes = prevHoursRes[0]?.totalMinutes || 0;
  const totalLearningHours = Number((totalMinutes / 60).toFixed(1));
  const previousPeriodHours = Number((prevMinutes / 60).toFixed(1));

  let hoursChangePercent = 0;
  let hoursTrend: "up" | "down" | "neutral" = "neutral";
  if (prevMinutes > 0) {
    hoursChangePercent = Number((((totalMinutes - prevMinutes) / prevMinutes) * 100).toFixed(1));
    hoursTrend = hoursChangePercent > 0 ? "up" : hoursChangePercent < 0 ? "down" : "neutral";
  } else if (totalMinutes > 0) {
    hoursChangePercent = 100;
    hoursTrend = "up";
  }

  // Card 2 Calculations
  const topicsCompletionPercent =
    totalTopics > 0 ? Math.round((topicsCompleted / totalTopics) * 100) : 0;

  // Card 3 Calculations
  const totalRoadmaps = roadmaps.length;
  let activeRoadmaps = 0;
  let completedRoadmaps = 0;
  let pausedRoadmaps = 0;

  roadmaps.forEach((r) => {
    if (r.progress === 100) completedRoadmaps++;
    else if (r.progress > 0) activeRoadmaps++;
    else pausedRoadmaps++;
  });

  // Card 5 Calculations (Daily Average including zero days)
  const dailyAverageMinutes = Math.round(totalMinutes / Math.max(1, totalDays));
  const weeklyAverageHours = Number(((dailyAverageMinutes * 7) / 60).toFixed(1));

  // Card 6 Calculations (Goal Completion)
  const totalGoalsCount = goals.length;
  let completedGoalsCount = 0;
  goals.forEach((g) => {
    const isTargetHit = g.completedMinutes >= g.targetMinutes && g.targetMinutes > 0;
    const allTasksDone = g.tasks && g.tasks.length > 0 && g.tasks.every((t) => t.completed);
    if (isTargetHit || allTasksDone) {
      completedGoalsCount++;
    }
  });

  const missedGoalsCount = Math.max(0, totalGoalsCount - completedGoalsCount);
  const dailyGoalCompletionRate =
    totalGoalsCount > 0 ? Math.round((completedGoalsCount / totalGoalsCount) * 100) : 0;

  // Weekly Goal Rate (target 10h/week normalized)
  const targetPeriodHours = (totalDays / 7) * 10;
  const weeklyGoalCompletionRate = Math.min(
    100,
    Math.round((totalLearningHours / Math.max(1, targetPeriodHours)) * 100)
  );

  return {
    totalLearningHours,
    previousPeriodHours,
    hoursChangePercent,
    hoursTrend,
    topicsCompleted,
    totalTopics,
    topicsCompletionPercent,
    activeRoadmaps,
    completedRoadmaps,
    pausedRoadmaps,
    totalRoadmaps,
    currentStreak: streakStats.currentStreak,
    longestStreak: streakStats.longestStreak,
    bestAchievement: streakStats.bestAchievement,
    dailyAverageMinutes,
    weeklyAverageHours,
    zeroDaysIncluded: true,
    dailyGoalCompletionRate,
    weeklyGoalCompletionRate,
    completedGoalsCount,
    missedGoalsCount,
    totalGoalsCount,
  };
}
