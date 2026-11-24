import { connectToDatabase } from "@/lib/mongodb";
import StudySession from "@/models/StudySession";
import Roadmap from "@/models/Roadmap";
import {
  LearningHoursData,
  WeeklyDistributionItem,
  MonthlyTrendItem,
  RoadmapDistributionItem,
  HeatmapDay,
} from "@/types/analytics";
import { AnalyticsQueryInput } from "@/lib/validations/analytics";
import { calculateDateRanges, buildRoadmapScope, formatLocalDate } from "./utils";

// Distinct palette matching MyPath dark green aesthetic
const PALETTE = [
  "#4E9F3D", // Accent Green
  "#D8E9A8", // Light Green
  "#1E5128", // Secondary Green
  "#38bdf8", // Sky Blue
  "#fbbf24", // Amber
  "#a855f7", // Purple
  "#f43f5e", // Rose
  "#2dd4bf", // Teal
  "#fb923c", // Orange
  "#94a3b8", // Slate
];

export async function getLearningHoursAnalytics(
  filters: AnalyticsQueryInput
): Promise<LearningHoursData> {
  await connectToDatabase();

  const { start, end } = calculateDateRanges(filters.dateRange, filters.startDate, filters.endDate);

  const roadmapScope = buildRoadmapScope(filters.roadmapId);

  // Fetch all completed study sessions in date range
  const sessions = await StudySession.find({
    status: "completed",
    ...roadmapScope,
    $or: [{ startedAt: { $gte: start, $lte: end } }, { sessionDate: { $gte: start, $lte: end } }],
  })
    .populate("roadmapId", "title category")
    .sort({ startedAt: 1 })
    .lean<any[]>();

  // Fetch all roadmaps for clean labeling
  const roadmaps = await Roadmap.find().select("title category").lean<any[]>();
  const roadmapMap = new Map<string, { title: string; category: string }>();
  roadmaps.forEach((r) => {
    roadmapMap.set(r._id.toString(), { title: r.title, category: r.category });
  });

  // 1. Weekly Distribution (Monday to Sunday)
  const weekdays = [
    { day: "Mon", fullDay: "Monday", weekdayIndex: 1 },
    { day: "Tue", fullDay: "Tuesday", weekdayIndex: 2 },
    { day: "Wed", fullDay: "Wednesday", weekdayIndex: 3 },
    { day: "Thu", fullDay: "Thursday", weekdayIndex: 4 },
    { day: "Fri", fullDay: "Friday", weekdayIndex: 5 },
    { day: "Sat", fullDay: "Saturday", weekdayIndex: 6 },
    { day: "Sun", fullDay: "Sunday", weekdayIndex: 0 },
  ];

  const weekdayMinutes = new Map<number, { minutes: number; count: number }>();
  weekdays.forEach((w) => weekdayMinutes.set(w.weekdayIndex, { minutes: 0, count: 0 }));

  sessions.forEach((s) => {
    const d = new Date(s.sessionDate || s.startedAt);
    const dayOfWeek = d.getDay();
    const curr = weekdayMinutes.get(dayOfWeek) || { minutes: 0, count: 0 };
    curr.minutes += s.durationMinutes || 0;
    curr.count += 1;
    weekdayMinutes.set(dayOfWeek, curr);
  });

  const weeklyDistribution: WeeklyDistributionItem[] = weekdays.map((w) => {
    const data = weekdayMinutes.get(w.weekdayIndex) || { minutes: 0, count: 0 };
    return {
      day: w.day,
      fullDay: w.fullDay,
      hours: Number((data.minutes / 60).toFixed(1)),
      minutes: data.minutes,
      sessionCount: data.count,
      date: "",
    };
  });

  // 2. Periodic Trend (Daily / Weekly / Monthly)
  const trendBuckets = new Map<string, { minutes: number; count: number }>();

  sessions.forEach((s) => {
    const d = new Date(s.sessionDate || s.startedAt);
    let key = "";

    if (filters.period === "daily") {
      key = formatLocalDate(d);
    } else if (filters.period === "monthly") {
      key = d.toLocaleString("default", { month: "short", year: "numeric" });
    } else {
      // Weekly bucket (e.g. "Week of Nov 10")
      const firstDayOfWeek = new Date(d);
      const day = firstDayOfWeek.getDay();
      const diff = firstDayOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      firstDayOfWeek.setDate(diff);
      key = `${firstDayOfWeek.toLocaleString("default", { month: "short" })} ${firstDayOfWeek.getDate()}`;
    }

    const curr = trendBuckets.get(key) || { minutes: 0, count: 0 };
    curr.minutes += s.durationMinutes || 0;
    curr.count += 1;
    trendBuckets.set(key, curr);
  });

  const monthlyTrend: MonthlyTrendItem[] = Array.from(trendBuckets.entries()).map(
    ([period, data]) => ({
      period,
      hours: Number((data.minutes / 60).toFixed(1)),
      sessions: data.count,
    })
  );

  // 3. Roadmap Distribution Donut
  const roadmapMinutes = new Map<string, { title: string; category: string; minutes: number }>();
  let totalOverallMinutes = 0;

  sessions.forEach((s) => {
    const rId = s.roadmapId?._id?.toString() || s.roadmapId?.toString() || "unassigned";
    const rMeta = roadmapMap.get(rId) || {
      title: s.roadmapId?.title || "General / Self Study",
      category: s.roadmapId?.category || "General",
    };

    const curr = roadmapMinutes.get(rId) || {
      title: rMeta.title,
      category: rMeta.category,
      minutes: 0,
    };
    curr.minutes += s.durationMinutes || 0;
    totalOverallMinutes += s.durationMinutes || 0;
    roadmapMinutes.set(rId, curr);
  });

  let paletteIndex = 0;
  const roadmapDistribution: RoadmapDistributionItem[] = Array.from(roadmapMinutes.entries())
    .map(([rId, data]) => {
      const hours = Number((data.minutes / 60).toFixed(1));
      const percentage =
        totalOverallMinutes > 0 ? Math.round((data.minutes / totalOverallMinutes) * 100) : 0;
      const color = PALETTE[paletteIndex % PALETTE.length];
      paletteIndex++;

      return {
        roadmapId: rId === "unassigned" ? undefined : rId,
        title: data.title,
        category: data.category,
        hours,
        percentage,
        color,
      };
    })
    .sort((a, b) => b.hours - a.hours);

  // 4. Heatmap Data (Last 90 to 365 Days)
  const heatmapMap = new Map<string, { minutes: number; count: number }>();
  sessions.forEach((s) => {
    const dStr = formatLocalDate(new Date(s.sessionDate || s.startedAt));
    const curr = heatmapMap.get(dStr) || { minutes: 0, count: 0 };
    curr.minutes += s.durationMinutes || 0;
    curr.count += 1;
    heatmapMap.set(dStr, curr);
  });

  // Build contiguous calendar days
  const heatmapData: HeatmapDay[] = [];
  const currDay = new Date(start);
  while (currDay <= end) {
    const dStr = formatLocalDate(currDay);
    const dayData = heatmapMap.get(dStr) || { minutes: 0, count: 0 };
    const mins = dayData.minutes;

    let intensity: 0 | 1 | 2 | 3 | 4 = 0;
    if (mins >= 120) intensity = 4;
    else if (mins >= 60) intensity = 3;
    else if (mins >= 30) intensity = 2;
    else if (mins > 0) intensity = 1;

    heatmapData.push({
      date: dStr,
      minutes: mins,
      hours: Number((mins / 60).toFixed(1)),
      count: dayData.count,
      intensity,
    });

    currDay.setDate(currDay.getDate() + 1);
  }

  const totalHours = Number((totalOverallMinutes / 60).toFixed(1));

  return {
    weeklyDistribution,
    monthlyTrend,
    roadmapDistribution,
    totalHours,
    heatmapData,
  };
}
