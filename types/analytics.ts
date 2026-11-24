import { RoadmapCategory } from "./index";

export type DateRangePreset = "7d" | "30d" | "90d" | "year" | "all" | "custom";
export type TimePeriod = "daily" | "weekly" | "monthly";

export interface AnalyticsFilterState {
  dateRange: DateRangePreset;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  roadmapId?: string; // "All" or ObjectId
  period?: TimePeriod;
}

export interface OverviewStats {
  // Card 1: Total Learning Hours
  totalLearningHours: number;
  previousPeriodHours: number;
  hoursChangePercent: number; // positive or negative
  hoursTrend: "up" | "down" | "neutral";

  // Card 2: Topics Completed
  topicsCompleted: number;
  totalTopics: number;
  topicsCompletionPercent: number;

  // Card 3: Active Roadmaps
  activeRoadmaps: number;
  completedRoadmaps: number;
  pausedRoadmaps: number;
  totalRoadmaps: number;

  // Card 4: Current Learning Streak
  currentStreak: number;
  longestStreak: number;
  bestAchievement: string;

  // Card 5: Daily Average
  dailyAverageMinutes: number;
  weeklyAverageHours: number;
  zeroDaysIncluded: boolean;

  // Card 6: Goal Completion
  dailyGoalCompletionRate: number;
  weeklyGoalCompletionRate: number;
  completedGoalsCount: number;
  missedGoalsCount: number;
  totalGoalsCount: number;
}

export interface WeeklyDistributionItem {
  day: string; // "Mon", "Tue", etc.
  fullDay: string; // "Monday", etc.
  hours: number;
  minutes: number;
  sessionCount: number;
  date: string;
}

export interface MonthlyTrendItem {
  period: string; // "Week 1", "Jan 12", "Feb", etc.
  hours: number;
  sessions: number;
}

export interface RoadmapDistributionItem {
  roadmapId?: string;
  title: string;
  category: string;
  hours: number;
  percentage: number;
  color: string;
}

export interface HeatmapDay {
  date: string; // YYYY-MM-DD
  minutes: number;
  hours: number;
  count: number;
  intensity: 0 | 1 | 2 | 3 | 4; // 0 = none, 4 = heavy
}

export interface LearningHoursData {
  weeklyDistribution: WeeklyDistributionItem[];
  monthlyTrend: MonthlyTrendItem[];
  roadmapDistribution: RoadmapDistributionItem[];
  totalHours: number;
  heatmapData: HeatmapDay[];
}

export interface RoadmapProgressItem {
  _id: string;
  title: string;
  category: RoadmapCategory;
  difficulty: string;
  totalTopics: number;
  completedTopics: number;
  inProgressTopics: number;
  remainingTopics: number;
  completionPercentage: number;
  estimatedHours: number;
  actualHours: number;
  updatedAt: string;
  status: "In Progress" | "Completed" | "Not Started" | "On Hold";
}

export interface RoadmapProgressAnalytics {
  roadmaps: RoadmapProgressItem[];
  highestProgressRoadmap: RoadmapProgressItem | null;
  lowestProgressActiveRoadmap: RoadmapProgressItem | null;
  recentlyUpdatedRoadmap: RoadmapProgressItem | null;
  completedRoadmapsCount: number;
  statusDistribution: {
    notStarted: number;
    inProgress: number;
    completed: number;
    onHold: number;
  };
  topicCompletionTrend: Array<{
    period: string;
    count: number;
  }>;
}

export interface WeeklyProgressAnalytics {
  currentWeek: {
    targetHours: number;
    actualHours: number;
    remainingHours: number;
    completionPercentage: number;
    topicsCompleted: number;
    sessionsCompleted: number;
  };
  comparison: {
    hoursDiff: number;
    hoursPercentChange: number;
    topicsDiff: number;
    dailyAvgDiff: number;
    goalRateDiff: number;
  };
  weeklyActivity: Array<{
    day: string; // "Mon", "Tue"...
    currentWeekHours: number;
    previousWeekHours: number;
  }>;
  insights: {
    mostProductiveDay: string;
    leastActiveDay: string;
    mostStudiedRoadmap: string;
    totalStudyTimeHours: number;
    percentageChangeFromPrevWeek: number;
  };
}

export interface ActivityCalendarDayDetails {
  date: string;
  totalMinutes: number;
  totalHours: number;
  sessionCount: number;
  sessions: Array<{
    _id: string;
    title: string;
    durationMinutes: number;
    roadmapTitle?: string;
    reflection?: string;
  }>;
  topicsStudied: Array<{
    title: string;
    roadmapTitle?: string;
  }>;
  roadmapsWorkedOn: string[];
  completedTasks: Array<{
    title: string;
    roadmapTitle?: string;
  }>;
  notesCreated: Array<{
    _id: string;
    title: string;
    roadmapTitle?: string;
  }>;
}

export interface LearningHabitsAnalytics {
  mostProductiveWeekday: string;
  averageSessionDurationMinutes: number;
  totalSessions: number;
  longestSessionMinutes: number;
  preferredStudyTime: "Morning" | "Afternoon" | "Evening";
  timeDistribution: {
    morning: {
      hours: number;
      percent: number;
      range: "05:00 - 12:00";
    };
    afternoon: {
      hours: number;
      percent: number;
      range: "12:00 - 17:00";
    };
    evening: {
      hours: number;
      percent: number;
      range: "17:00 - 05:00";
    };
  };
}

export interface AnalyticsExportRow {
  date: string;
  roadmap: string;
  topic: string;
  durationMinutes: number;
  sessionCount: number;
  status: string;
}
