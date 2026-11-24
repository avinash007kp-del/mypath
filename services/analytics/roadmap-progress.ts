import { connectToDatabase } from "@/lib/mongodb";
import Roadmap from "@/models/Roadmap";
import RoadmapNode from "@/models/RoadmapNode";
import StudySession from "@/models/StudySession";
import LearningProgress from "@/models/LearningProgress";
import { RoadmapProgressAnalytics, RoadmapProgressItem } from "@/types/analytics";
import { AnalyticsQueryInput } from "@/lib/validations/analytics";
import { calculateDateRanges, buildRoadmapScope, formatLocalDate } from "./utils";

export async function getRoadmapProgressAnalytics(
  filters: AnalyticsQueryInput
): Promise<RoadmapProgressAnalytics> {
  await connectToDatabase();

  const { start, end } = calculateDateRanges(filters.dateRange, filters.startDate, filters.endDate);

  const roadmapScope = buildRoadmapScope(filters.roadmapId);

  // 1. Fetch roadmaps
  const roadmaps = await Roadmap.find(roadmapScope)
    .sort({ progress: -1, updatedAt: -1 })
    .lean<any[]>();

  // 2. Fetch actual study hours per roadmap
  const sessionHoursByRoadmap = await StudySession.aggregate([
    { $match: { status: "completed", roadmapId: { $ne: null } } },
    {
      $group: {
        _id: "$roadmapId",
        totalMins: { $sum: "$durationMinutes" },
      },
    },
  ]);

  const hoursMap = new Map<string, number>();
  sessionHoursByRoadmap.forEach((item) => {
    if (item._id) {
      hoursMap.set(item._id.toString(), Number((item.totalMins / 60).toFixed(1)));
    }
  });

  // 3. Fetch nodes per roadmap to calculate accurate topic breakdown
  const nodes = await RoadmapNode.find({
    ...roadmapScope,
    type: { $in: ["topic", "subtopic", "project"] },
  })
    .select("roadmapId status estimatedHours")
    .lean<any[]>();

  const nodeStatsMap = new Map<
    string,
    {
      total: number;
      completed: number;
      inProgress: number;
      notStarted: number;
      onHold: number;
      estimatedHours: number;
    }
  >();

  nodes.forEach((n) => {
    const rId = n.roadmapId.toString();
    const curr = nodeStatsMap.get(rId) || {
      total: 0,
      completed: 0,
      inProgress: 0,
      notStarted: 0,
      onHold: 0,
      estimatedHours: 0,
    };

    curr.total += 1;
    curr.estimatedHours += n.estimatedHours || 1;

    if (n.status === "Completed") curr.completed += 1;
    else if (n.status === "In Progress") curr.inProgress += 1;
    else if (n.status === "On Hold") curr.onHold += 1;
    else curr.notStarted += 1;

    nodeStatsMap.set(rId, curr);
  });

  // Map into structured roadmap items
  const roadmapItems: RoadmapProgressItem[] = roadmaps.map((r) => {
    const rId = r._id.toString();
    const stats = nodeStatsMap.get(rId) || {
      total: r.totalTopics || 0,
      completed: r.completedTopics || 0,
      inProgress: Math.max(0, (r.totalTopics || 0) - (r.completedTopics || 0)),
      notStarted: 0,
      onHold: 0,
      estimatedHours: 10,
    };

    const completionPercentage =
      stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : r.progress || 0;

    let status: "In Progress" | "Completed" | "Not Started" | "On Hold" = "Not Started";
    if (completionPercentage === 100) status = "Completed";
    else if (completionPercentage > 0) status = "In Progress";

    return {
      _id: rId,
      title: r.title,
      category: r.category,
      difficulty: r.difficulty,
      totalTopics: stats.total,
      completedTopics: stats.completed,
      inProgressTopics: stats.inProgress,
      remainingTopics: Math.max(0, stats.total - stats.completed),
      completionPercentage,
      estimatedHours: stats.estimatedHours,
      actualHours: hoursMap.get(rId) || 0,
      updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
      status,
    };
  });

  // Highlights
  const completedRoadmaps = roadmapItems.filter((r) => r.completionPercentage === 100);
  const activeRoadmaps = roadmapItems.filter(
    (r) => r.completionPercentage > 0 && r.completionPercentage < 100
  );

  const highestProgressRoadmap = roadmapItems.length > 0 ? roadmapItems[0] : null;
  const lowestProgressActiveRoadmap =
    activeRoadmaps.length > 0 ? activeRoadmaps[activeRoadmaps.length - 1] : null;

  const recentlyUpdatedRoadmap =
    roadmapItems.length > 0
      ? [...roadmapItems].sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )[0]
      : null;

  // 4. Status Distribution (Global count across all eligible nodes)
  let totalNotStarted = 0;
  let totalInProgress = 0;
  let totalCompleted = 0;
  let totalOnHold = 0;

  nodes.forEach((n) => {
    if (n.status === "Completed") totalCompleted++;
    else if (n.status === "In Progress") totalInProgress++;
    else if (n.status === "On Hold") totalOnHold++;
    else totalNotStarted++;
  });

  // 5. Topic Completion Trend (Over time from LearningProgress / completedAt)
  const completions = await LearningProgress.find({
    status: "Completed",
    completedAt: { $gte: start, $lte: end },
    ...roadmapScope,
  })
    .select("completedAt")
    .sort({ completedAt: 1 })
    .lean<any[]>();

  const trendMap = new Map<string, number>();

  completions.forEach((c) => {
    if (!c.completedAt) return;
    const d = new Date(c.completedAt);
    let key = "";

    if (filters.period === "monthly") {
      key = d.toLocaleString("default", { month: "short", year: "numeric" });
    } else {
      // Weekly bucket
      const firstDayOfWeek = new Date(d);
      const day = firstDayOfWeek.getDay();
      const diff = firstDayOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      firstDayOfWeek.setDate(diff);
      key = `${firstDayOfWeek.toLocaleString("default", { month: "short" })} ${firstDayOfWeek.getDate()}`;
    }

    trendMap.set(key, (trendMap.get(key) || 0) + 1);
  });

  const topicCompletionTrend = Array.from(trendMap.entries()).map(([period, count]) => ({
    period,
    count,
  }));

  return {
    roadmaps: roadmapItems,
    highestProgressRoadmap,
    lowestProgressActiveRoadmap,
    recentlyUpdatedRoadmap,
    completedRoadmapsCount: completedRoadmaps.length,
    statusDistribution: {
      notStarted: totalNotStarted,
      inProgress: totalInProgress,
      completed: totalCompleted,
      onHold: totalOnHold,
    },
    topicCompletionTrend,
  };
}
