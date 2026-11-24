import {
  ApiResponse,
  IRoadmap,
  DashboardStats,
  LearningActivityData,
  RoadmapGraphData,
  IRoadmapNode,
  IRoadmapEdge,
  IRoadmapViewport,
  GraphBatchSavePayload,
  ILearningNote,
  ILearningResource,
  IMilestone,
  IDailyGoal,
  IStudySession,
  ILearningProgress,
  DashboardLMSOverview,
} from "@/types";
import { RoadmapInput, UpdateRoadmapInput } from "@/lib/validations/roadmap";
import { RoadmapNodeInput, UpdateRoadmapNodeInput } from "@/lib/validations/roadmap-node";
import { RoadmapEdgeInput, RoadmapViewportInput } from "@/lib/validations/roadmap-edge";

export async function fetchRoadmaps(params?: {
  search?: string;
  category?: string;
  difficulty?: string;
  sortBy?: string;
  order?: string;
}): Promise<IRoadmap[]> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.category && params.category !== "All") query.set("category", params.category);
  if (params?.difficulty && params.difficulty !== "All") query.set("difficulty", params.difficulty);
  if (params?.sortBy) query.set("sortBy", params.sortBy);
  if (params?.order) query.set("order", params.order);

  const res = await fetch(`/api/roadmaps?${query.toString()}`, {
    cache: "no-store",
  });
  const data: ApiResponse<IRoadmap[]> = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to fetch roadmaps");
  }
  return data.data || [];
}

export async function fetchRoadmapById(id: string): Promise<IRoadmap> {
  const res = await fetch(`/api/roadmaps/${id}`, {
    cache: "no-store",
  });
  const data: ApiResponse<IRoadmap> = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to fetch roadmap details");
  }
  return data.data!;
}

export async function createRoadmapApi(payload: RoadmapInput): Promise<IRoadmap> {
  const res = await fetch("/api/roadmaps", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data: ApiResponse<IRoadmap> = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to create roadmap");
  }
  return data.data!;
}

export async function updateRoadmapApi(id: string, payload: UpdateRoadmapInput): Promise<IRoadmap> {
  const res = await fetch(`/api/roadmaps/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data: ApiResponse<IRoadmap> = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to update roadmap");
  }
  return data.data!;
}

export async function deleteRoadmapApi(id: string): Promise<void> {
  const res = await fetch(`/api/roadmaps/${id}`, {
    method: "DELETE",
  });
  const data: ApiResponse<null> = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to delete roadmap");
  }
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch("/api/dashboard/stats", {
    cache: "no-store",
  });
  const data: ApiResponse<DashboardStats> = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to fetch dashboard stats");
  }
  return (
    data.data || {
      totalRoadmaps: 0,
      topicsCompleted: 0,
      topicsInProgress: 0,
      totalLearningHours: 0,
    }
  );
}

export async function fetchDashboardActivity(): Promise<LearningActivityData> {
  const res = await fetch("/api/dashboard/activity", {
    cache: "no-store",
  });
  const data: ApiResponse<LearningActivityData> = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to fetch learning activity");
  }
  return (
    data.data || {
      weeklyData: [],
      totalHours: 0,
      activeDaysCount: 0,
      weeklyTrendPercent: 0,
    }
  );
}

export async function triggerSeedData(): Promise<{ message: string; count?: number }> {
  const res = await fetch("/api/seed", {
    method: "POST",
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to seed sample data");
  }
  return data;
}

export async function fetchRoadmapGraph(roadmapId: string): Promise<RoadmapGraphData> {
  const res = await fetch(`/api/roadmaps/${roadmapId}/graph`, {
    cache: "no-store",
  });
  const data: ApiResponse<RoadmapGraphData> = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to fetch roadmap graph");
  }
  return data.data!;
}

export async function saveRoadmapGraphBatch(
  roadmapId: string,
  payload: GraphBatchSavePayload
): Promise<RoadmapGraphData> {
  const res = await fetch(`/api/roadmaps/${roadmapId}/graph`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data: ApiResponse<RoadmapGraphData> = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to save roadmap graph");
  }
  return data.data!;
}

export async function createGraphNodeApi(
  roadmapId: string,
  payload: RoadmapNodeInput
): Promise<IRoadmapNode> {
  const res = await fetch(`/api/roadmaps/${roadmapId}/nodes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data: ApiResponse<IRoadmapNode> = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to create node");
  }
  return data.data!;
}

export async function updateGraphNodeApi(
  roadmapId: string,
  nodeId: string,
  payload: UpdateRoadmapNodeInput
): Promise<IRoadmapNode> {
  const res = await fetch(`/api/roadmaps/${roadmapId}/nodes/${nodeId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data: ApiResponse<IRoadmapNode> = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to update node");
  }
  return data.data!;
}

export async function deleteGraphNodeApi(roadmapId: string, nodeId: string): Promise<void> {
  const res = await fetch(`/api/roadmaps/${roadmapId}/nodes/${nodeId}`, {
    method: "DELETE",
  });
  const data: ApiResponse<null> = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to delete node");
  }
}

export async function createGraphEdgeApi(
  roadmapId: string,
  payload: RoadmapEdgeInput
): Promise<IRoadmapEdge> {
  const res = await fetch(`/api/roadmaps/${roadmapId}/edges`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data: ApiResponse<IRoadmapEdge> = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to create edge");
  }
  return data.data!;
}

export async function deleteGraphEdgeApi(roadmapId: string, edgeId: string): Promise<void> {
  const res = await fetch(`/api/roadmaps/${roadmapId}/edges/${edgeId}`, {
    method: "DELETE",
  });
  const data: ApiResponse<null> = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to delete edge");
  }
}

export async function saveGraphViewportApi(
  roadmapId: string,
  payload: RoadmapViewportInput
): Promise<IRoadmapViewport> {
  const res = await fetch(`/api/roadmaps/${roadmapId}/viewport`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data: ApiResponse<IRoadmapViewport> = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to update viewport");
  }
  return data.data!;
}

// ==============================================================================
// LMS APIs (Phase 3)
// ==============================================================================

export async function fetchTopicProgress(
  roadmapId: string,
  nodeId: string
): Promise<ILearningProgress | null> {
  const res = await fetch(
    `/api/progress?roadmapId=${encodeURIComponent(roadmapId)}&nodeId=${encodeURIComponent(nodeId)}`,
    { cache: "no-store" }
  );
  const data: ApiResponse<ILearningProgress> = await res.json();
  return data.data || null;
}

export async function updateTopicProgressApi(payload: {
  roadmapId: string;
  nodeId: string;
  status: string;
  progressPercentage: number;
  totalLearningMinutes?: number;
}): Promise<ILearningProgress> {
  const res = await fetch("/api/progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data: ApiResponse<ILearningProgress> = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to update topic progress");
  }
  return data.data!;
}

export async function fetchNotes(params?: {
  search?: string;
  roadmapId?: string;
  nodeId?: string;
  tag?: string;
}): Promise<ILearningNote[]> {
  const q = new URLSearchParams();
  if (params?.search) q.set("search", params.search);
  if (params?.roadmapId && params.roadmapId !== "All") q.set("roadmapId", params.roadmapId);
  if (params?.nodeId) q.set("nodeId", params.nodeId);
  if (params?.tag) q.set("tag", params.tag);

  const res = await fetch(`/api/notes?${q.toString()}`, { cache: "no-store" });
  const data: ApiResponse<ILearningNote[]> = await res.json();
  return data.data || [];
}

export async function fetchNoteById(id: string): Promise<ILearningNote> {
  const res = await fetch(`/api/notes/${id}`, { cache: "no-store" });
  const data: ApiResponse<ILearningNote> = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Failed to fetch note");
  return data.data!;
}

export async function createNoteApi(payload: {
  title: string;
  content: string;
  roadmapId?: string;
  nodeId?: string;
  tags?: string[];
}): Promise<ILearningNote> {
  const res = await fetch("/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data: ApiResponse<ILearningNote> = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Failed to create note");
  return data.data!;
}

export async function updateNoteApi(
  id: string,
  payload: Partial<ILearningNote>
): Promise<ILearningNote> {
  const res = await fetch(`/api/notes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data: ApiResponse<ILearningNote> = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Failed to update note");
  return data.data!;
}

export async function deleteNoteApi(id: string): Promise<void> {
  const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Failed to delete note");
}

export async function fetchResources(params?: {
  search?: string;
  roadmapId?: string;
  nodeId?: string;
  type?: string;
  status?: string;
  isFavorite?: boolean;
}): Promise<ILearningResource[]> {
  const q = new URLSearchParams();
  if (params?.search) q.set("search", params.search);
  if (params?.roadmapId && params.roadmapId !== "All") q.set("roadmapId", params.roadmapId);
  if (params?.nodeId) q.set("nodeId", params.nodeId);
  if (params?.type && params.type !== "All") q.set("type", params.type);
  if (params?.status && params.status !== "All") q.set("status", params.status);
  if (params?.isFavorite !== undefined) q.set("isFavorite", String(params.isFavorite));

  const res = await fetch(`/api/resources?${q.toString()}`, { cache: "no-store" });
  const data: ApiResponse<ILearningResource[]> = await res.json();
  return data.data || [];
}

export async function fetchResourceById(id: string): Promise<ILearningResource> {
  const res = await fetch(`/api/resources/${id}`, { cache: "no-store" });
  const data: ApiResponse<ILearningResource> = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Failed to fetch resource");
  return data.data!;
}

export async function createResourceApi(
  payload: Partial<ILearningResource>
): Promise<ILearningResource> {
  const res = await fetch("/api/resources", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data: ApiResponse<ILearningResource> = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Failed to add resource");
  return data.data!;
}

export async function updateResourceApi(
  id: string,
  payload: Partial<ILearningResource>
): Promise<ILearningResource> {
  const res = await fetch(`/api/resources/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data: ApiResponse<ILearningResource> = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Failed to update resource");
  return data.data!;
}

export async function deleteResourceApi(id: string): Promise<void> {
  const res = await fetch(`/api/resources/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Failed to delete resource");
}

export async function fetchMilestones(params?: {
  roadmapId?: string;
  status?: string;
  priority?: string;
}): Promise<IMilestone[]> {
  const q = new URLSearchParams();
  if (params?.roadmapId && params.roadmapId !== "All") q.set("roadmapId", params.roadmapId);
  if (params?.status && params.status !== "All") q.set("status", params.status);
  if (params?.priority && params.priority !== "All") q.set("priority", params.priority);

  const res = await fetch(`/api/milestones?${q.toString()}`, { cache: "no-store" });
  const data: ApiResponse<IMilestone[]> = await res.json();
  return data.data || [];
}

export async function createMilestoneApi(payload: Partial<IMilestone>): Promise<IMilestone> {
  const res = await fetch("/api/milestones", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data: ApiResponse<IMilestone> = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Failed to create milestone");
  return data.data!;
}

export async function updateMilestoneApi(
  id: string,
  payload: Partial<IMilestone>
): Promise<IMilestone> {
  const res = await fetch(`/api/milestones/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data: ApiResponse<IMilestone> = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Failed to update milestone");
  return data.data!;
}

export async function deleteMilestoneApi(id: string): Promise<void> {
  const res = await fetch(`/api/milestones/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Failed to delete milestone");
}

export async function fetchDailyGoal(dateStr?: string): Promise<IDailyGoal> {
  const date = dateStr || new Date().toISOString().split("T")[0];
  const res = await fetch(`/api/goals/daily?date=${date}`, { cache: "no-store" });
  const data: ApiResponse<IDailyGoal> = await res.json();
  return data.data!;
}

export async function saveDailyGoalApi(payload: Partial<IDailyGoal>): Promise<IDailyGoal> {
  const res = await fetch("/api/goals/daily", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data: ApiResponse<IDailyGoal> = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Failed to save daily goal");
  return data.data!;
}

export async function fetchStudySessions(params?: {
  roadmapId?: string;
  nodeId?: string;
  status?: string;
}): Promise<IStudySession[]> {
  const q = new URLSearchParams();
  if (params?.roadmapId && params.roadmapId !== "All") q.set("roadmapId", params.roadmapId);
  if (params?.nodeId) q.set("nodeId", params.nodeId);
  if (params?.status) q.set("status", params.status);

  const res = await fetch(`/api/sessions?${q.toString()}`, { cache: "no-store" });
  const data: ApiResponse<IStudySession[]> = await res.json();
  return data.data || [];
}

export async function fetchActiveStudySession(): Promise<IStudySession | null> {
  const res = await fetch("/api/sessions?active=true", { cache: "no-store" });
  const data: ApiResponse<IStudySession | null> = await res.json();
  return data.data || null;
}

export async function startStudySessionApi(payload: {
  roadmapId?: string;
  nodeId?: string;
  title?: string;
}): Promise<IStudySession> {
  const res = await fetch("/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data: ApiResponse<IStudySession> = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Failed to start study session");
  return data.data!;
}

export async function completeStudySessionApi(
  id: string,
  payload: { durationMinutes?: number; reflection?: string }
): Promise<IStudySession> {
  const res = await fetch(`/api/sessions/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data: ApiResponse<IStudySession> = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Failed to complete study session");
  return data.data!;
}

export async function logManualStudySessionApi(payload: {
  roadmapId?: string;
  nodeId?: string;
  title: string;
  sessionDate: string;
  durationMinutes: number;
  reflection?: string;
}): Promise<IStudySession> {
  const res = await fetch("/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, isManual: true }),
  });
  const data: ApiResponse<IStudySession> = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Failed to log study session");
  return data.data!;
}

export async function deleteStudySessionApi(id: string): Promise<void> {
  const res = await fetch(`/api/sessions/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Failed to delete study session");
}

export async function fetchLMSDashboardOverview(): Promise<DashboardLMSOverview> {
  const res = await fetch("/api/dashboard/lms", { cache: "no-store" });
  const data: ApiResponse<DashboardLMSOverview> = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Failed to fetch LMS dashboard");
  return data.data!;
}

// ==============================================================================
// Analytics APIs (Phase 4)
// ==============================================================================

import {
  OverviewStats,
  LearningHoursData,
  RoadmapProgressAnalytics,
  WeeklyProgressAnalytics,
  ActivityCalendarDayDetails,
  LearningHabitsAnalytics,
  AnalyticsExportRow,
  HeatmapDay,
  AnalyticsFilterState,
} from "@/types/analytics";

function buildAnalyticsQueryString(filters?: Partial<AnalyticsFilterState>): string {
  const q = new URLSearchParams();
  if (filters?.dateRange) q.set("dateRange", filters.dateRange);
  if (filters?.startDate) q.set("startDate", filters.startDate);
  if (filters?.endDate) q.set("endDate", filters.endDate);
  if (filters?.roadmapId && filters.roadmapId !== "All") q.set("roadmapId", filters.roadmapId);
  if (filters?.period) q.set("period", filters.period);
  return q.toString();
}

export async function fetchAnalyticsOverview(
  filters?: Partial<AnalyticsFilterState>
): Promise<OverviewStats> {
  const qs = buildAnalyticsQueryString(filters);
  const res = await fetch(`/api/analytics/overview?${qs}`, { cache: "no-store" });
  const data: ApiResponse<OverviewStats> = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Failed to load overview analytics");
  return data.data!;
}

export async function fetchLearningHoursAnalytics(
  filters?: Partial<AnalyticsFilterState>
): Promise<LearningHoursData> {
  const qs = buildAnalyticsQueryString(filters);
  const res = await fetch(`/api/analytics/learning-hours?${qs}`, { cache: "no-store" });
  const data: ApiResponse<LearningHoursData> = await res.json();
  if (!res.ok || !data.success)
    throw new Error(data.error || "Failed to load learning hours analytics");
  return data.data!;
}

export async function fetchRoadmapProgressAnalytics(
  filters?: Partial<AnalyticsFilterState>
): Promise<RoadmapProgressAnalytics> {
  const qs = buildAnalyticsQueryString(filters);
  const res = await fetch(`/api/analytics/roadmap-progress?${qs}`, { cache: "no-store" });
  const data: ApiResponse<RoadmapProgressAnalytics> = await res.json();
  if (!res.ok || !data.success)
    throw new Error(data.error || "Failed to load roadmap progress analytics");
  return data.data!;
}

export async function fetchWeeklyProgressAnalytics(
  filters?: Partial<AnalyticsFilterState>
): Promise<WeeklyProgressAnalytics> {
  const qs = buildAnalyticsQueryString(filters);
  const res = await fetch(`/api/analytics/weekly-progress?${qs}`, { cache: "no-store" });
  const data: ApiResponse<WeeklyProgressAnalytics> = await res.json();
  if (!res.ok || !data.success)
    throw new Error(data.error || "Failed to load weekly progress analytics");
  return data.data!;
}

export async function fetchActivityCalendarAnalytics(params?: {
  year?: number;
  roadmapId?: string;
  filterType?: "all" | "sessions" | "topics";
}): Promise<{
  days: HeatmapDay[];
  totalYearMinutes: number;
  totalYearHours: number;
  activeDaysCount: number;
}> {
  const q = new URLSearchParams();
  if (params?.year) q.set("year", String(params.year));
  if (params?.roadmapId && params.roadmapId !== "All") q.set("roadmapId", params.roadmapId);
  if (params?.filterType) q.set("filterType", params.filterType);

  const res = await fetch(`/api/analytics/activity-calendar?${q.toString()}`, {
    cache: "no-store",
  });
  const data: ApiResponse<{
    days: HeatmapDay[];
    totalYearMinutes: number;
    totalYearHours: number;
    activeDaysCount: number;
  }> = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Failed to load activity calendar");
  return data.data!;
}

export async function fetchActivityCalendarDayDetails(params: {
  date: string;
  roadmapId?: string;
}): Promise<ActivityCalendarDayDetails> {
  const q = new URLSearchParams();
  q.set("date", params.date);
  if (params.roadmapId && params.roadmapId !== "All") q.set("roadmapId", params.roadmapId);

  const res = await fetch(`/api/analytics/activity-calendar/day?${q.toString()}`, {
    cache: "no-store",
  });
  const data: ApiResponse<ActivityCalendarDayDetails> = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Failed to load day details");
  return data.data!;
}

export async function fetchLearningHabitsAnalytics(
  filters?: Partial<AnalyticsFilterState>
): Promise<LearningHabitsAnalytics> {
  const qs = buildAnalyticsQueryString(filters);
  const res = await fetch(`/api/analytics/learning-habits?${qs}`, { cache: "no-store" });
  const data: ApiResponse<LearningHabitsAnalytics> = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Failed to load learning habits");
  return data.data!;
}

export async function fetchAnalyticsExportData(
  filters?: Partial<AnalyticsFilterState>
): Promise<AnalyticsExportRow[]> {
  const qs = buildAnalyticsQueryString(filters);
  const res = await fetch(`/api/analytics/export?${qs}`, { cache: "no-store" });
  const data: ApiResponse<AnalyticsExportRow[]> = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Failed to load export data");
  return data.data!;
}

// ==============================================================================
// AI Assistant APIs (Phase 5)
// ==============================================================================

import {
  IAIConversation,
  IAIMessage,
  IGeneratedRoadmap,
  NextTopicResponse,
  ResourceSuggestionResponse,
  TopicBreakdownResponse,
  PersonalizedLearningPlanResponse,
  TopicExplanationResponse,
  QuizResponse,
  SubtaskItem,
} from "@/types/ai";
import {
  AIChatInput,
  GenerateRoadmapInput,
  SaveGeneratedRoadmapInput,
  SuggestResourcesInput,
  BreakdownTopicInput,
  GenerateLearningPlanInput,
  ExplainTopicInput,
  GenerateQuizInput,
} from "@/lib/validations/ai";

export async function sendAIChatMessage(payload: AIChatInput): Promise<{
  conversation: IAIConversation;
  userMessage: IAIMessage;
  assistantMessage: IAIMessage;
  isFallback: boolean;
}> {
  const res = await fetch("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Failed to send AI message");
  return data.data;
}

export async function generateAIRoadmapApi(
  payload: GenerateRoadmapInput
): Promise<{ roadmap: IGeneratedRoadmap; isFallback: boolean }> {
  const res = await fetch("/api/ai/generate-roadmap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Failed to generate roadmap");
  return data.data;
}

export async function saveAIRoadmapApi(
  payload: SaveGeneratedRoadmapInput
): Promise<{ roadmapId: string }> {
  const res = await fetch("/api/ai/save-roadmap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success)
    throw new Error(data.error || "Failed to convert roadmap to canvas");
  return data.data;
}

export async function fetchAINextTopicApi(params?: {
  roadmapId?: string;
  quickWins?: boolean;
}): Promise<NextTopicResponse> {
  const q = new URLSearchParams();
  if (params?.roadmapId && params.roadmapId !== "All") q.set("roadmapId", params.roadmapId);
  if (params?.quickWins) q.set("quickWins", "true");

  const res = await fetch(`/api/ai/recommend-next-topic?${q.toString()}`, {
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok || !data.success)
    throw new Error(data.error || "Failed to fetch next topic recommendations");
  return data.data;
}

export async function fetchAIResourcesApi(
  payload: SuggestResourcesInput
): Promise<ResourceSuggestionResponse> {
  const res = await fetch("/api/ai/suggest-resources", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Failed to suggest resources");
  return data.data;
}

export async function breakdownTopicApi(
  payload: BreakdownTopicInput
): Promise<TopicBreakdownResponse> {
  const res = await fetch("/api/ai/breakdown-topic", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Failed to break down topic");
  return data.data;
}

export async function addSubtasksToDailyGoalsApi(payload: {
  date?: string;
  subtasks: SubtaskItem[];
  topicTitle: string;
  roadmapId?: string;
  nodeId?: string;
}): Promise<any> {
  const res = await fetch("/api/ai/breakdown-topic", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, action: "add-to-goals" }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Failed to add tasks to daily goals");
  return data.data;
}

export async function addSubtopicsToRoadmapNodeApi(payload: {
  nodeId: string;
  subtasks: SubtaskItem[];
}): Promise<any> {
  const res = await fetch("/api/ai/breakdown-topic", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, action: "add-to-node" }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Failed to save subtopics to node");
  return data.data;
}

export async function generateLearningPlanApi(
  payload: GenerateLearningPlanInput
): Promise<PersonalizedLearningPlanResponse> {
  const res = await fetch("/api/ai/generate-learning-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Failed to generate learning plan");
  return data.data;
}

export async function explainTopicApi(
  payload: ExplainTopicInput
): Promise<TopicExplanationResponse> {
  const res = await fetch("/api/ai/explain-topic", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Failed to explain topic");
  return data.data;
}

export async function generateQuizApi(payload: GenerateQuizInput): Promise<QuizResponse> {
  const res = await fetch("/api/ai/generate-quiz", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Failed to generate quiz");
  return data.data;
}

export async function fetchConversationsApi(limit: number = 20): Promise<IAIConversation[]> {
  const res = await fetch(`/api/ai/conversations?limit=${limit}`, { cache: "no-store" });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Failed to fetch conversations");
  return data.data || [];
}

export async function fetchConversationByIdApi(
  id: string
): Promise<{ conversation: IAIConversation; messages: IAIMessage[] }> {
  const res = await fetch(`/api/ai/conversations/${id}`, { cache: "no-store" });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Failed to load conversation");
  return data.data;
}

export async function deleteConversationApi(id: string): Promise<void> {
  const res = await fetch(`/api/ai/conversations/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Failed to delete conversation");
}

export async function fetchUserProfileApi(): Promise<any> {
  const res = await fetch("/api/profile", { cache: "no-store" });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Failed to load scholar profile");
  return data.data;
}

export async function updateUserProfileApi(payload: any): Promise<any> {
  const res = await fetch("/api/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Failed to update scholar profile");
  return data.data;
}
