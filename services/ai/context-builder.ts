import { connectToDatabase } from "@/lib/mongodb";
import Roadmap from "@/models/Roadmap";
import RoadmapNode from "@/models/RoadmapNode";
import DailyGoal from "@/models/DailyGoal";
import StudySession from "@/models/StudySession";
import Milestone from "@/models/Milestone";

export interface UserLearningContext {
  activeRoadmaps: Array<{
    id: string;
    title: string;
    category: string;
    progress: number;
    completedTopics: number;
    totalTopics: number;
  }>;
  completedTopics: string[];
  inProgressTopics: string[];
  notStartedTopics: string[];
  todaysGoal?: {
    targetMinutes: number;
    completedMinutes: number;
    tasksCount: number;
    completedTasksCount: number;
  };
  totalLearningHours: number;
  upcomingMilestones: Array<{
    title: string;
    targetDate: string;
    completed: boolean;
  }>;
}

export async function getUserLearningContext(
  specificRoadmapId?: string
): Promise<UserLearningContext> {
  await connectToDatabase();

  const roadmapQuery = specificRoadmapId ? { _id: specificRoadmapId } : {};
  const [roadmaps, studySessions, milestones, todayGoal] = await Promise.all([
    Roadmap.find(roadmapQuery).sort({ updatedAt: -1 }).limit(10).lean(),
    StudySession.find().sort({ sessionDate: -1 }).limit(30).lean(),
    Milestone.find({ completed: false }).sort({ targetDate: 1 }).limit(5).lean(),
    DailyGoal.findOne({ date: new Date().toISOString().split("T")[0] }).lean(),
  ]);

  const roadmapIds = roadmaps.map((r: any) => r._id.toString());
  const nodes = await RoadmapNode.find({ roadmapId: { $in: roadmapIds } }).lean();

  const completedTopics: string[] = [];
  const inProgressTopics: string[] = [];
  const notStartedTopics: string[] = [];

  for (const node of nodes as any[]) {
    if (node.status === "Completed") {
      completedTopics.push(node.title);
    } else if (node.status === "In Progress") {
      inProgressTopics.push(node.title);
    } else {
      notStartedTopics.push(node.title);
    }
  }

  const totalMinutes = (studySessions as any[]).reduce(
    (acc, s) => acc + (s.durationMinutes || 0),
    0
  );
  const totalLearningHours = Number((totalMinutes / 60).toFixed(1));

  const activeRoadmaps = (roadmaps as any[]).map((r) => ({
    id: r._id.toString(),
    title: r.title,
    category: r.category,
    progress: r.progress || 0,
    completedTopics: r.completedTopics || 0,
    totalTopics: r.totalTopics || 0,
  }));

  const upcomingMilestones = (milestones as any[]).map((m) => ({
    title: m.title,
    targetDate: m.targetDate ? new Date(m.targetDate).toISOString().split("T")[0] : "",
    completed: m.completed || false,
  }));

  let todaysGoalSummary = undefined;
  if (todayGoal) {
    const tasks = (todayGoal as any).tasks || [];
    todaysGoalSummary = {
      targetMinutes: (todayGoal as any).targetMinutes || 60,
      completedMinutes: (todayGoal as any).completedMinutes || 0,
      tasksCount: tasks.length,
      completedTasksCount: tasks.filter((t: any) => t.completed).length,
    };
  }

  return {
    activeRoadmaps,
    completedTopics: completedTopics.slice(0, 20),
    inProgressTopics: inProgressTopics.slice(0, 15),
    notStartedTopics: notStartedTopics.slice(0, 25),
    todaysGoal: todaysGoalSummary,
    totalLearningHours,
    upcomingMilestones,
  };
}

export function formatContextForPrompt(ctx: UserLearningContext): string {
  let promptContext = "User Learning Context:\n";

  if (ctx.activeRoadmaps.length > 0) {
    promptContext += `- Active Roadmaps:\n`;
    for (const r of ctx.activeRoadmaps) {
      promptContext += `  * ${r.title} (${r.category}) - ${r.progress}% complete (${r.completedTopics}/${r.totalTopics} topics done)\n`;
    }
  } else {
    promptContext += `- No active roadmaps currently.\n`;
  }

  if (ctx.completedTopics.length > 0) {
    promptContext += `- Mastered / Completed Topics: ${ctx.completedTopics.join(", ")}\n`;
  }

  if (ctx.inProgressTopics.length > 0) {
    promptContext += `- Currently In Progress: ${ctx.inProgressTopics.join(", ")}\n`;
  }

  if (ctx.todaysGoal) {
    promptContext += `- Today's Study Goal: ${ctx.todaysGoal.completedMinutes}/${ctx.todaysGoal.targetMinutes} minutes logged (${ctx.todaysGoal.completedTasksCount}/${ctx.todaysGoal.tasksCount} tasks completed)\n`;
  }

  promptContext += `- Total Study Hours Logged: ${ctx.totalLearningHours} hours\n`;

  if (ctx.upcomingMilestones.length > 0) {
    promptContext += `- Next Milestones: ${ctx.upcomingMilestones.map((m) => `${m.title} (due ${m.targetDate})`).join("; ")}\n`;
  }

  return promptContext;
}
