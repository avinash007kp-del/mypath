import { connectToDatabase } from "@/lib/mongodb";
import StudySession from "@/models/StudySession";
import { LearningHabitsAnalytics } from "@/types/analytics";
import { AnalyticsQueryInput } from "@/lib/validations/analytics";
import { calculateDateRanges, buildRoadmapScope } from "./utils";

export async function getLearningHabitsAnalytics(
  filters: AnalyticsQueryInput
): Promise<LearningHabitsAnalytics> {
  await connectToDatabase();

  const { start, end } = calculateDateRanges(filters.dateRange, filters.startDate, filters.endDate);

  const roadmapScope = buildRoadmapScope(filters.roadmapId);

  // Fetch all completed study sessions in range
  const sessions = await StudySession.find({
    status: "completed",
    ...roadmapScope,
    $or: [{ startedAt: { $gte: start, $lte: end } }, { sessionDate: { $gte: start, $lte: end } }],
  })
    .select("startedAt sessionDate durationMinutes")
    .lean<any[]>();

  const totalSessions = sessions.length;
  if (totalSessions === 0) {
    return {
      mostProductiveWeekday: "N/A",
      averageSessionDurationMinutes: 0,
      totalSessions: 0,
      longestSessionMinutes: 0,
      preferredStudyTime: "Morning",
      timeDistribution: {
        morning: { hours: 0, percent: 0, range: "05:00 - 12:00" },
        afternoon: { hours: 0, percent: 0, range: "12:00 - 17:00" },
        evening: { hours: 0, percent: 0, range: "17:00 - 05:00" },
      },
    };
  }

  let totalMinutes = 0;
  let longestSessionMinutes = 0;

  // Weekday minutes aggregator
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const weekdayMinutes = [0, 0, 0, 0, 0, 0, 0];

  // Time of Day distribution
  let morningMinutes = 0;
  let afternoonMinutes = 0;
  let eveningMinutes = 0;

  sessions.forEach((s) => {
    const duration = s.durationMinutes || 0;
    totalMinutes += duration;
    if (duration > longestSessionMinutes) {
      longestSessionMinutes = duration;
    }

    const d = new Date(s.startedAt || s.sessionDate);
    const day = d.getDay();
    weekdayMinutes[day] += duration;

    // Local hour
    const hour = d.getHours();
    if (hour >= 5 && hour < 12) {
      morningMinutes += duration;
    } else if (hour >= 12 && hour < 17) {
      afternoonMinutes += duration;
    } else {
      eveningMinutes += duration;
    }
  });

  const averageSessionDurationMinutes = Math.round(totalMinutes / totalSessions);

  // Most productive weekday
  let maxWeekdayIndex = 1; // default Monday
  let maxMins = -1;
  weekdayMinutes.forEach((mins, idx) => {
    if (mins > maxMins) {
      maxMins = mins;
      maxWeekdayIndex = idx;
    }
  });
  const mostProductiveWeekday = maxMins > 0 ? weekdays[maxWeekdayIndex] : "N/A";

  // Preferred study time
  let preferredStudyTime: "Morning" | "Afternoon" | "Evening" = "Morning";
  if (afternoonMinutes >= morningMinutes && afternoonMinutes >= eveningMinutes) {
    preferredStudyTime = "Afternoon";
  } else if (eveningMinutes >= morningMinutes && eveningMinutes >= afternoonMinutes) {
    preferredStudyTime = "Evening";
  }

  const morningHours = Number((morningMinutes / 60).toFixed(1));
  const afternoonHours = Number((afternoonMinutes / 60).toFixed(1));
  const eveningHours = Number((eveningMinutes / 60).toFixed(1));

  const morningPercent = totalMinutes > 0 ? Math.round((morningMinutes / totalMinutes) * 100) : 0;
  const afternoonPercent =
    totalMinutes > 0 ? Math.round((afternoonMinutes / totalMinutes) * 100) : 0;
  const eveningPercent = totalMinutes > 0 ? Math.round((eveningMinutes / totalMinutes) * 100) : 0;

  return {
    mostProductiveWeekday,
    averageSessionDurationMinutes,
    totalSessions,
    longestSessionMinutes,
    preferredStudyTime,
    timeDistribution: {
      morning: { hours: morningHours, percent: morningPercent, range: "05:00 - 12:00" },
      afternoon: { hours: afternoonHours, percent: afternoonPercent, range: "12:00 - 17:00" },
      evening: { hours: eveningHours, percent: eveningPercent, range: "17:00 - 05:00" },
    },
  };
}
