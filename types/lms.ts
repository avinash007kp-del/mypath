export type ResourceType =
  | "YouTube video"
  | "Documentation"
  | "Online course"
  | "Book"
  | "Article"
  | "GitHub repository"
  | "PDF"
  | "Other";

export type ResourceStatus = "Pending" | "In Progress" | "Completed";

export type MilestoneStatus = "Upcoming" | "In Progress" | "Completed" | "Overdue";

export type MilestonePriority = "Low" | "Medium" | "High";

export type SessionStatus = "active" | "paused" | "completed";

export type ProgressPercentage = 0 | 25 | 50 | 75 | 100;

export interface ILearningNote {
  _id: string;
  userId?: string;
  roadmapId?: string;
  roadmapTitle?: string;
  nodeId?: string;
  nodeTitle?: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ILearningResource {
  _id: string;
  userId?: string;
  roadmapId?: string;
  roadmapTitle?: string;
  nodeId?: string;
  nodeTitle?: string;
  title: string;
  url: string;
  description: string;
  type: ResourceType;
  author: string;
  tags: string[];
  rating: number; // 1-5
  isFavorite: boolean;
  status: ResourceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface IMilestone {
  _id: string;
  userId?: string;
  roadmapId: string;
  roadmapTitle?: string;
  nodeId?: string;
  nodeTitle?: string;
  title: string;
  description: string;
  targetDate: string;
  priority: MilestonePriority;
  status: MilestoneStatus;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IDailyGoalTask {
  id: string;
  title: string;
  targetMinutes: number;
  completedMinutes: number;
  completed: boolean;
  roadmapId?: string;
  roadmapTitle?: string;
  nodeId?: string;
  nodeTitle?: string;
}

export interface IDailyGoal {
  _id: string;
  userId?: string;
  date: string; // "YYYY-MM-DD"
  targetMinutes: number;
  completedMinutes: number;
  tasks: IDailyGoalTask[];
  createdAt: string;
  updatedAt: string;
}

export interface IStudySession {
  _id: string;
  userId?: string;
  roadmapId?: string;
  roadmapTitle?: string;
  nodeId?: string;
  nodeTitle?: string;
  title: string;
  startedAt: string;
  endedAt?: string;
  durationMinutes: number;
  reflection: string;
  status: SessionStatus;
  sessionDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface ILearningProgress {
  _id: string;
  userId?: string;
  roadmapId: string;
  nodeId: string;
  status: "Not Started" | "In Progress" | "Completed" | "On Hold";
  progressPercentage: ProgressPercentage;
  startedAt?: string;
  completedAt?: string;
  totalLearningMinutes: number;
  updatedAt: string;
}

export interface DashboardLMSOverview {
  totalRoadmaps: number;
  topicsCompleted: number;
  topicsInProgress: number;
  totalLearningHours: number;
  todayGoal: {
    targetMinutes: number;
    completedMinutes: number;
    remainingMinutes: number;
    completionPercentage: number;
    tasksTotal: number;
    tasksCompleted: number;
  };
  weeklyGoal: {
    targetHours: number;
    actualHours: number;
    remainingHours: number;
    completionPercentage: number;
  };
  learningStreak: {
    currentStreak: number;
    longestStreak: number;
    lastActiveDate?: string;
  };
  upcomingMilestones: IMilestone[];
  recentNotes: ILearningNote[];
  recentSessions: IStudySession[];
  activeSession: IStudySession | null;
}
