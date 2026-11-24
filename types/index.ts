export type RoadmapCategory =
  | "Web Development"
  | "AI & Machine Learning"
  | "Data Science"
  | "Computer Science"
  | "Embedded Systems"
  | "Robotics"
  | "Mobile Development"
  | "Other";

export type RoadmapDifficulty = "Beginner" | "Intermediate" | "Advanced";

export interface IRoadmap {
  _id: string;
  title: string;
  description: string;
  category: RoadmapCategory;
  difficulty: RoadmapDifficulty;
  estimatedDuration: string;
  icon: string;
  tags: string[];
  progress: number;
  totalTopics: number;
  completedTopics: number;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapFormData {
  title: string;
  description?: string;
  category: RoadmapCategory;
  difficulty: RoadmapDifficulty;
  estimatedDuration: string;
  icon?: string;
  tags: string[];
  totalTopics?: number;
  completedTopics?: number;
}

export interface DashboardStats {
  totalRoadmaps: number;
  topicsCompleted: number;
  topicsInProgress: number;
  totalLearningHours: number;
}

export interface ActivityDay {
  day: string;
  date: string;
  hours: number;
  topicsCovered: number;
}

export interface LearningActivityData {
  weeklyData: ActivityDay[];
  totalHours: number;
  activeDaysCount: number;
  weeklyTrendPercent: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export * from "./roadmap";
export * from "./lms";
export * from "./analytics";
export * from "./ai";
