import { connectToDatabase } from "@/lib/mongodb";
import StudySession from "@/models/StudySession";
import Activity from "@/models/Activity";
import { formatLocalDate } from "./utils";

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  bestAchievement: string;
}

export async function calculateStreakStats(roadmapId?: string): Promise<StreakStats> {
  await connectToDatabase();

  const query: Record<string, unknown> = { status: "completed" };
  if (roadmapId && roadmapId !== "All") {
    query.roadmapId = roadmapId;
  }

  // Fetch all completed study session dates
  const sessions = await StudySession.find(query)
    .select("sessionDate startedAt durationMinutes")
    .lean();

  const activityQuery: Record<string, unknown> = { hours: { $gt: 0 } };
  if (roadmapId && roadmapId !== "All") {
    activityQuery.roadmapId = roadmapId;
  }
  const activities = await Activity.find(activityQuery).select("date hours").lean();

  const activeDaysSet = new Set<string>();

  sessions.forEach((s) => {
    const d = s.sessionDate || s.startedAt;
    if (d) {
      activeDaysSet.add(formatLocalDate(new Date(d)));
    }
  });

  activities.forEach((a) => {
    if (a.date) {
      activeDaysSet.add(formatLocalDate(new Date(a.date)));
    }
  });

  const totalActiveDays = activeDaysSet.size;
  if (totalActiveDays === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalActiveDays: 0,
      bestAchievement: "Start your first study session to ignite your streak!",
    };
  }

  // Sort dates chronologically
  const sortedDays = Array.from(activeDaysSet).sort();

  // Calculate longest streak
  let longestStreak = 0;
  let runningStreak = 0;
  let prevDate: Date | null = null;

  for (const dayStr of sortedDays) {
    const currDate = new Date(dayStr + "T00:00:00");
    if (!prevDate) {
      runningStreak = 1;
    } else {
      const diffMs = currDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        runningStreak++;
      } else if (diffDays > 1) {
        runningStreak = 1;
      }
    }
    if (runningStreak > longestStreak) {
      longestStreak = runningStreak;
    }
    prevDate = currDate;
  }

  // Calculate current streak
  let currentStreak = 0;
  const todayStr = formatLocalDate(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatLocalDate(yesterday);

  if (activeDaysSet.has(todayStr) || activeDaysSet.has(yesterdayStr)) {
    let checkDate = new Date();
    if (!activeDaysSet.has(todayStr)) {
      checkDate = yesterday;
    }

    while (true) {
      const checkStr = formatLocalDate(checkDate);
      if (activeDaysSet.has(checkStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Dynamic achievement text
  let bestAchievement = "Beginner Explorer";
  if (longestStreak >= 30) {
    bestAchievement = "Legendary 30-Day Master";
  } else if (longestStreak >= 14) {
    bestAchievement = "Fortnight Focus Champion";
  } else if (longestStreak >= 7) {
    bestAchievement = "7-Day Consistency Warrior";
  } else if (longestStreak >= 3) {
    bestAchievement = "3-Day Habit Builder";
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    totalActiveDays,
    bestAchievement,
  };
}
