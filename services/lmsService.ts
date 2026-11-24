import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Roadmap from "@/models/Roadmap";
import RoadmapNode from "@/models/RoadmapNode";
import Activity from "@/models/Activity";
import LearningNote, { ILearningNoteDocument } from "@/models/LearningNote";
import LearningResource, { ILearningResourceDocument } from "@/models/LearningResource";
import Milestone, { IMilestoneDocument } from "@/models/Milestone";
import DailyGoal, { IDailyGoalDocument } from "@/models/DailyGoal";
import StudySession, { IStudySessionDocument } from "@/models/StudySession";
import LearningProgress, { ILearningProgressDocument } from "@/models/LearningProgress";
import {
  ILearningNote,
  ILearningResource,
  IMilestone,
  IDailyGoal,
  IStudySession,
  ILearningProgress,
  DashboardLMSOverview,
  ProgressPercentage,
} from "@/types/lms";

// ==============================================================================
// 1. PROGRESS TRACKING SERVICE
// ==============================================================================

export async function getTopicProgress(
  roadmapId: string,
  nodeId: string
): Promise<ILearningProgress | null> {
  await connectToDatabase();
  const doc = await LearningProgress.findOne({
    roadmapId,
    nodeId,
  }).lean<ILearningProgressDocument>();
  if (!doc) return null;
  return {
    _id: doc._id.toString(),
    userId: doc.userId,
    roadmapId: doc.roadmapId.toString(),
    nodeId: doc.nodeId,
    status: doc.status,
    progressPercentage: doc.progressPercentage,
    startedAt: doc.startedAt?.toISOString(),
    completedAt: doc.completedAt?.toISOString(),
    totalLearningMinutes: doc.totalLearningMinutes || 0,
    updatedAt: doc.updatedAt?.toISOString() || new Date().toISOString(),
  };
}

export async function updateTopicProgress(
  roadmapId: string,
  nodeId: string,
  data: {
    status: "Not Started" | "In Progress" | "Completed" | "On Hold";
    progressPercentage: ProgressPercentage;
    learningMinutesToAdd?: number;
  }
): Promise<ILearningProgress> {
  await connectToDatabase();

  const now = new Date();
  const updatePayload: Record<string, unknown> = {
    status: data.status,
    progressPercentage: data.progressPercentage,
  };

  if (data.status === "In Progress" || data.progressPercentage > 0) {
    updatePayload.startedAt = now;
  }
  if (data.status === "Completed" || data.progressPercentage === 100) {
    updatePayload.completedAt = now;
    updatePayload.status = "Completed";
    updatePayload.progressPercentage = 100;
  } else if (data.status === "Not Started") {
    updatePayload.progressPercentage = 0;
    updatePayload.completedAt = null;
  }

  if (data.learningMinutesToAdd && data.learningMinutesToAdd > 0) {
    updatePayload.$inc = { totalLearningMinutes: data.learningMinutesToAdd };
  }

  // Upsert LearningProgress
  const progressDoc = await LearningProgress.findOneAndUpdate(
    { roadmapId, nodeId },
    updatePayload,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Sync to RoadmapNode document
  if (mongoose.Types.ObjectId.isValid(nodeId)) {
    await RoadmapNode.findByIdAndUpdate(nodeId, {
      status: updatePayload.status,
    });
  }

  // Recalculate Roadmap statistics (excluding milestone, resource, assessment)
  const learningNodes = await RoadmapNode.find({
    roadmapId,
    type: { $in: ["topic", "subtopic"] },
  }).lean();

  const totalTopics = learningNodes.length > 0 ? learningNodes.length : 1;
  const completedTopics = learningNodes.filter((n) => n.status === "Completed").length;
  const progress = Math.min(100, Math.round((completedTopics / totalTopics) * 100));

  await Roadmap.findByIdAndUpdate(roadmapId, {
    totalTopics: learningNodes.length,
    completedTopics,
    progress,
  });

  // If newly completed, record activity in Activity log
  if (data.status === "Completed" || data.progressPercentage === 100) {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    await Activity.create({
      date: today,
      hours: 1.0,
      topicsCovered: 1,
      roadmapId: new mongoose.Types.ObjectId(roadmapId),
      notes: `Completed topic milestone`,
    });
  }

  return {
    _id: progressDoc._id.toString(),
    userId: progressDoc.userId,
    roadmapId: progressDoc.roadmapId.toString(),
    nodeId: progressDoc.nodeId,
    status: progressDoc.status,
    progressPercentage: progressDoc.progressPercentage,
    startedAt: progressDoc.startedAt?.toISOString(),
    completedAt: progressDoc.completedAt?.toISOString(),
    totalLearningMinutes: progressDoc.totalLearningMinutes || 0,
    updatedAt: progressDoc.updatedAt?.toISOString() || new Date().toISOString(),
  };
}

// ==============================================================================
// 2. NOTES MANAGEMENT SERVICE
// ==============================================================================

export async function getNotes(filters: {
  search?: string;
  roadmapId?: string;
  nodeId?: string;
  tag?: string;
}): Promise<ILearningNote[]> {
  await connectToDatabase();

  const query: Record<string, unknown> = {};

  if (filters.roadmapId && filters.roadmapId !== "All") {
    query.roadmapId = filters.roadmapId;
  }
  if (filters.nodeId) {
    query.nodeId = filters.nodeId;
  }
  if (filters.tag) {
    query.tags = filters.tag;
  }
  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: "i" } },
      { content: { $regex: filters.search, $options: "i" } },
      { tags: { $in: [new RegExp(filters.search, "i")] } },
    ];
  }

  const docs = await LearningNote.find(query)
    .sort({ updatedAt: -1 })
    .populate("roadmapId", "title")
    .lean<any[]>();

  return docs.map((doc) => ({
    _id: doc._id.toString(),
    userId: doc.userId,
    roadmapId: doc.roadmapId?._id?.toString() || doc.roadmapId?.toString(),
    roadmapTitle: doc.roadmapId?.title || undefined,
    nodeId: doc.nodeId,
    title: doc.title,
    content: doc.content || "",
    tags: doc.tags || [],
    createdAt: doc.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: doc.updatedAt?.toISOString() || new Date().toISOString(),
  }));
}

export async function getNoteById(id: string): Promise<ILearningNote | null> {
  await connectToDatabase();
  const doc = await LearningNote.findById(id).populate("roadmapId", "title").lean<any>();
  if (!doc) return null;

  return {
    _id: doc._id.toString(),
    userId: doc.userId,
    roadmapId: doc.roadmapId?._id?.toString() || doc.roadmapId?.toString(),
    roadmapTitle: doc.roadmapId?.title || undefined,
    nodeId: doc.nodeId,
    title: doc.title,
    content: doc.content || "",
    tags: doc.tags || [],
    createdAt: doc.createdAt?.toISOString(),
    updatedAt: doc.updatedAt?.toISOString(),
  };
}

export async function createNote(data: {
  roadmapId?: string;
  nodeId?: string;
  title: string;
  content: string;
  tags?: string[];
}): Promise<ILearningNote> {
  await connectToDatabase();

  const note = await LearningNote.create({
    roadmapId:
      data.roadmapId && mongoose.Types.ObjectId.isValid(data.roadmapId)
        ? new mongoose.Types.ObjectId(data.roadmapId)
        : undefined,
    nodeId: data.nodeId,
    title: data.title,
    content: data.content,
    tags: data.tags || [],
  });

  return getNoteById(note._id.toString()) as Promise<ILearningNote>;
}

export async function updateNote(
  id: string,
  data: Partial<{
    title: string;
    content: string;
    tags: string[];
    roadmapId?: string;
    nodeId?: string;
  }>
): Promise<ILearningNote | null> {
  await connectToDatabase();

  const update: Record<string, unknown> = {};
  if (data.title !== undefined) update.title = data.title;
  if (data.content !== undefined) update.content = data.content;
  if (data.tags !== undefined) update.tags = data.tags;
  if (data.roadmapId !== undefined) {
    update.roadmapId =
      data.roadmapId && mongoose.Types.ObjectId.isValid(data.roadmapId)
        ? new mongoose.Types.ObjectId(data.roadmapId)
        : undefined;
  }
  if (data.nodeId !== undefined) update.nodeId = data.nodeId;

  const updated = await LearningNote.findByIdAndUpdate(id, { $set: update }, { new: true });
  if (!updated) return null;

  return getNoteById(id);
}

export async function deleteNote(id: string): Promise<boolean> {
  await connectToDatabase();
  const res = await LearningNote.findByIdAndDelete(id);
  return res !== null;
}

// ==============================================================================
// 3. LEARNING RESOURCES SERVICE
// ==============================================================================

export async function getResources(filters: {
  search?: string;
  roadmapId?: string;
  nodeId?: string;
  type?: string;
  isFavorite?: boolean;
  status?: string;
}): Promise<ILearningResource[]> {
  await connectToDatabase();

  const query: Record<string, unknown> = {};
  if (filters.roadmapId && filters.roadmapId !== "All") query.roadmapId = filters.roadmapId;
  if (filters.nodeId) query.nodeId = filters.nodeId;
  if (filters.type && filters.type !== "All") query.type = filters.type;
  if (filters.status && filters.status !== "All") query.status = filters.status;
  if (filters.isFavorite !== undefined) query.isFavorite = filters.isFavorite;

  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: "i" } },
      { description: { $regex: filters.search, $options: "i" } },
      { author: { $regex: filters.search, $options: "i" } },
      { tags: { $in: [new RegExp(filters.search, "i")] } },
    ];
  }

  const docs = await LearningResource.find(query)
    .sort({ isFavorite: -1, updatedAt: -1 })
    .populate("roadmapId", "title")
    .lean<any[]>();

  return docs.map((doc) => ({
    _id: doc._id.toString(),
    userId: doc.userId,
    roadmapId: doc.roadmapId?._id?.toString() || doc.roadmapId?.toString(),
    roadmapTitle: doc.roadmapId?.title,
    nodeId: doc.nodeId,
    title: doc.title,
    url: doc.url,
    description: doc.description || "",
    type: doc.type,
    author: doc.author || "",
    tags: doc.tags || [],
    rating: doc.rating || 5,
    isFavorite: doc.isFavorite || false,
    status: doc.status || "Pending",
    createdAt: doc.createdAt?.toISOString(),
    updatedAt: doc.updatedAt?.toISOString(),
  }));
}

export async function getResourceById(id: string): Promise<ILearningResource | null> {
  await connectToDatabase();
  const doc = await LearningResource.findById(id).populate("roadmapId", "title").lean<any>();
  if (!doc) return null;

  return {
    _id: doc._id.toString(),
    userId: doc.userId,
    roadmapId: doc.roadmapId?._id?.toString() || doc.roadmapId?.toString(),
    roadmapTitle: doc.roadmapId?.title,
    nodeId: doc.nodeId,
    title: doc.title,
    url: doc.url,
    description: doc.description || "",
    type: doc.type,
    author: doc.author || "",
    tags: doc.tags || [],
    rating: doc.rating || 5,
    isFavorite: doc.isFavorite || false,
    status: doc.status || "Pending",
    createdAt: doc.createdAt?.toISOString(),
    updatedAt: doc.updatedAt?.toISOString(),
  };
}

export async function createResource(data: any): Promise<ILearningResource> {
  await connectToDatabase();
  const created = await LearningResource.create({
    ...data,
    roadmapId:
      data.roadmapId && mongoose.Types.ObjectId.isValid(data.roadmapId)
        ? new mongoose.Types.ObjectId(data.roadmapId)
        : undefined,
  });
  return getResourceById(created._id.toString()) as Promise<ILearningResource>;
}

export async function updateResource(id: string, data: any): Promise<ILearningResource | null> {
  await connectToDatabase();
  const updatePayload = { ...data };
  if (data.roadmapId !== undefined) {
    updatePayload.roadmapId =
      data.roadmapId && mongoose.Types.ObjectId.isValid(data.roadmapId)
        ? new mongoose.Types.ObjectId(data.roadmapId)
        : undefined;
  }
  const updated = await LearningResource.findByIdAndUpdate(
    id,
    { $set: updatePayload },
    { new: true }
  );
  if (!updated) return null;
  return getResourceById(id);
}

export async function deleteResource(id: string): Promise<boolean> {
  await connectToDatabase();
  const res = await LearningResource.findByIdAndDelete(id);
  return res !== null;
}

// ==============================================================================
// 4. MILESTONES & DEADLINES SERVICE
// ==============================================================================

export async function getMilestones(filters: {
  roadmapId?: string;
  status?: string;
  priority?: string;
}): Promise<IMilestone[]> {
  await connectToDatabase();

  const query: Record<string, unknown> = {};
  if (filters.roadmapId && filters.roadmapId !== "All") query.roadmapId = filters.roadmapId;
  if (filters.status && filters.status !== "All") query.status = filters.status;
  if (filters.priority && filters.priority !== "All") query.priority = filters.priority;

  const now = new Date();

  // Update status to "Overdue" if targetDate has passed and not completed
  await Milestone.updateMany(
    {
      targetDate: { $lt: now },
      status: { $in: ["Upcoming", "In Progress"] },
    },
    { $set: { status: "Overdue" } }
  );

  const docs = await Milestone.find(query)
    .sort({ targetDate: 1 })
    .populate("roadmapId", "title")
    .lean<any[]>();

  return docs.map((doc) => ({
    _id: doc._id.toString(),
    userId: doc.userId,
    roadmapId: doc.roadmapId?._id?.toString() || doc.roadmapId?.toString(),
    roadmapTitle: doc.roadmapId?.title,
    nodeId: doc.nodeId,
    title: doc.title,
    description: doc.description || "",
    targetDate: doc.targetDate?.toISOString(),
    priority: doc.priority,
    status: doc.status,
    completedAt: doc.completedAt?.toISOString(),
    createdAt: doc.createdAt?.toISOString(),
    updatedAt: doc.updatedAt?.toISOString(),
  }));
}

export async function getMilestoneById(id: string): Promise<IMilestone | null> {
  await connectToDatabase();
  const doc = await Milestone.findById(id).populate("roadmapId", "title").lean<any>();
  if (!doc) return null;
  return {
    _id: doc._id.toString(),
    userId: doc.userId,
    roadmapId: doc.roadmapId?._id?.toString() || doc.roadmapId?.toString(),
    roadmapTitle: doc.roadmapId?.title,
    nodeId: doc.nodeId,
    title: doc.title,
    description: doc.description || "",
    targetDate: doc.targetDate?.toISOString(),
    priority: doc.priority,
    status: doc.status,
    completedAt: doc.completedAt?.toISOString(),
    createdAt: doc.createdAt?.toISOString(),
    updatedAt: doc.updatedAt?.toISOString(),
  };
}

export async function createMilestone(data: any): Promise<IMilestone> {
  await connectToDatabase();
  const created = await Milestone.create({
    ...data,
    targetDate: new Date(data.targetDate),
    roadmapId: new mongoose.Types.ObjectId(data.roadmapId),
  });
  return getMilestoneById(created._id.toString()) as Promise<IMilestone>;
}

export async function updateMilestone(id: string, data: any): Promise<IMilestone | null> {
  await connectToDatabase();
  const payload = { ...data };
  if (data.targetDate) payload.targetDate = new Date(data.targetDate);
  if (data.status === "Completed" && !data.completedAt) {
    payload.completedAt = new Date();
  } else if (data.status && data.status !== "Completed") {
    payload.completedAt = null;
  }
  const updated = await Milestone.findByIdAndUpdate(id, { $set: payload }, { new: true });
  if (!updated) return null;
  return getMilestoneById(id);
}

export async function deleteMilestone(id: string): Promise<boolean> {
  await connectToDatabase();
  const res = await Milestone.findByIdAndDelete(id);
  return res !== null;
}

// ==============================================================================
// 5. DAILY LEARNING GOALS SERVICE
// ==============================================================================

export async function getDailyGoal(dateStr: string): Promise<IDailyGoal> {
  await connectToDatabase();

  let doc = await DailyGoal.findOne({ date: dateStr }).lean<IDailyGoalDocument>();

  if (!doc) {
    // Initialize default daily goal
    const created = await DailyGoal.create({
      date: dateStr,
      targetMinutes: 120,
      completedMinutes: 0,
      tasks: [
        {
          id: `task_${Date.now()}_1`,
          title: "Study Core Roadmap Modules",
          targetMinutes: 60,
          completedMinutes: 0,
          completed: false,
        },
        {
          id: `task_${Date.now()}_2`,
          title: "Hands-on Project & Code Review",
          targetMinutes: 60,
          completedMinutes: 0,
          completed: false,
        },
      ],
    });
    doc = created.toObject();
  }

  return {
    _id: doc._id.toString(),
    userId: doc.userId,
    date: doc.date,
    targetMinutes: doc.targetMinutes,
    completedMinutes: doc.completedMinutes,
    tasks: doc.tasks || [],
    createdAt: doc.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: doc.updatedAt?.toISOString() || new Date().toISOString(),
  };
}

export async function updateDailyGoal(
  dateStr: string,
  data: Partial<IDailyGoal>
): Promise<IDailyGoal> {
  await connectToDatabase();

  const payload: Record<string, unknown> = {};
  if (data.targetMinutes !== undefined) payload.targetMinutes = data.targetMinutes;
  if (data.completedMinutes !== undefined) payload.completedMinutes = data.completedMinutes;
  if (data.tasks !== undefined) {
    payload.tasks = data.tasks;
    // Auto recalculate completedMinutes from completed tasks
    const sumMinutes = data.tasks.reduce(
      (acc, t) => acc + (t.completed ? t.targetMinutes : t.completedMinutes || 0),
      0
    );
    payload.completedMinutes = sumMinutes;
  }

  const updated = await DailyGoal.findOneAndUpdate(
    { date: dateStr },
    { $set: payload },
    { upsert: true, new: true }
  ).lean<IDailyGoalDocument>();

  return {
    _id: updated._id.toString(),
    userId: updated.userId,
    date: updated.date,
    targetMinutes: updated.targetMinutes,
    completedMinutes: updated.completedMinutes,
    tasks: updated.tasks || [],
    createdAt: updated.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: updated.updatedAt?.toISOString() || new Date().toISOString(),
  };
}

// ==============================================================================
// 6. STUDY SESSIONS & ACTIVE TIMER SERVICE
// ==============================================================================

export async function getStudySessions(filters: {
  roadmapId?: string;
  nodeId?: string;
  status?: string;
  limit?: number;
}): Promise<IStudySession[]> {
  await connectToDatabase();

  const query: Record<string, unknown> = {};
  if (filters.roadmapId && filters.roadmapId !== "All") query.roadmapId = filters.roadmapId;
  if (filters.nodeId) query.nodeId = filters.nodeId;
  if (filters.status) query.status = filters.status;

  const docs = await StudySession.find(query)
    .sort({ startedAt: -1 })
    .limit(filters.limit || 30)
    .populate("roadmapId", "title")
    .lean<any[]>();

  return docs.map((doc) => ({
    _id: doc._id.toString(),
    userId: doc.userId,
    roadmapId: doc.roadmapId?._id?.toString() || doc.roadmapId?.toString(),
    roadmapTitle: doc.roadmapId?.title,
    nodeId: doc.nodeId,
    title: doc.title,
    startedAt: doc.startedAt?.toISOString(),
    endedAt: doc.endedAt?.toISOString(),
    durationMinutes: doc.durationMinutes || 0,
    reflection: doc.reflection || "",
    status: doc.status,
    sessionDate: doc.sessionDate?.toISOString() || doc.startedAt?.toISOString(),
    createdAt: doc.createdAt?.toISOString(),
    updatedAt: doc.updatedAt?.toISOString(),
  }));
}

export async function getActiveStudySession(): Promise<IStudySession | null> {
  await connectToDatabase();
  const active = await StudySession.findOne({
    status: { $in: ["active", "paused"] },
  })
    .populate("roadmapId", "title")
    .lean<any>();

  if (!active) return null;

  return {
    _id: active._id.toString(),
    userId: active.userId,
    roadmapId: active.roadmapId?._id?.toString() || active.roadmapId?.toString(),
    roadmapTitle: active.roadmapId?.title,
    nodeId: active.nodeId,
    title: active.title,
    startedAt: active.startedAt?.toISOString(),
    endedAt: active.endedAt?.toISOString(),
    durationMinutes: active.durationMinutes || 0,
    reflection: active.reflection || "",
    status: active.status,
    sessionDate: active.sessionDate?.toISOString(),
    createdAt: active.createdAt?.toISOString(),
    updatedAt: active.updatedAt?.toISOString(),
  };
}

export async function startStudySession(data: {
  roadmapId?: string;
  nodeId?: string;
  title?: string;
}): Promise<IStudySession> {
  await connectToDatabase();

  // Prevent overlapping active sessions: if an active session exists, return it
  const existingActive = await getActiveStudySession();
  if (existingActive) {
    return existingActive;
  }

  const now = new Date();
  const created = await StudySession.create({
    roadmapId:
      data.roadmapId && mongoose.Types.ObjectId.isValid(data.roadmapId)
        ? new mongoose.Types.ObjectId(data.roadmapId)
        : undefined,
    nodeId: data.nodeId,
    title: data.title || "Focused Study Session",
    startedAt: now,
    status: "active",
    durationMinutes: 0,
    sessionDate: now,
  });

  const populated = await StudySession.findById(created._id)
    .populate("roadmapId", "title")
    .lean<any>();

  return {
    _id: populated._id.toString(),
    userId: populated.userId,
    roadmapId: populated.roadmapId?._id?.toString(),
    roadmapTitle: populated.roadmapId?.title,
    nodeId: populated.nodeId,
    title: populated.title,
    startedAt: populated.startedAt?.toISOString(),
    durationMinutes: populated.durationMinutes,
    reflection: populated.reflection || "",
    status: populated.status,
    sessionDate: populated.sessionDate?.toISOString(),
    createdAt: populated.createdAt?.toISOString(),
    updatedAt: populated.updatedAt?.toISOString(),
  };
}

export async function completeStudySession(
  sessionId: string,
  data: {
    durationMinutes?: number;
    reflection?: string;
  }
): Promise<IStudySession | null> {
  await connectToDatabase();

  const session = await StudySession.findById(sessionId);
  if (!session) return null;

  const now = new Date();
  session.endedAt = now;
  session.status = "completed";
  if (data.reflection !== undefined) session.reflection = data.reflection;

  // Calculate actual duration in minutes based on timestamps if not passed explicitly
  if (data.durationMinutes !== undefined && data.durationMinutes > 0) {
    session.durationMinutes = data.durationMinutes;
  } else {
    const diffMs = now.getTime() - new Date(session.startedAt).getTime();
    session.durationMinutes = Math.max(1, Math.round(diffMs / (1000 * 60)));
  }

  await session.save();

  // Also record study hours in Activity collection
  const hours = Number((session.durationMinutes / 60).toFixed(2));
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  await Activity.create({
    date: today,
    hours,
    topicsCovered: session.nodeId ? 1 : 0,
    roadmapId: session.roadmapId,
    notes: session.title,
  });

  // Also update today's DailyGoal completedMinutes
  const todayStr = new Date().toISOString().split("T")[0];
  await DailyGoal.findOneAndUpdate(
    { date: todayStr },
    { $inc: { completedMinutes: session.durationMinutes } },
    { upsert: true }
  );

  const populated = await StudySession.findById(sessionId)
    .populate("roadmapId", "title")
    .lean<any>();

  return {
    _id: populated._id.toString(),
    userId: populated.userId,
    roadmapId: populated.roadmapId?._id?.toString(),
    roadmapTitle: populated.roadmapId?.title,
    nodeId: populated.nodeId,
    title: populated.title,
    startedAt: populated.startedAt?.toISOString(),
    endedAt: populated.endedAt?.toISOString(),
    durationMinutes: populated.durationMinutes,
    reflection: populated.reflection || "",
    status: populated.status,
    sessionDate: populated.sessionDate?.toISOString(),
    createdAt: populated.createdAt?.toISOString(),
    updatedAt: populated.updatedAt?.toISOString(),
  };
}

export async function logManualStudySession(data: {
  roadmapId?: string;
  nodeId?: string;
  title: string;
  sessionDate: string;
  durationMinutes: number;
  reflection?: string;
}): Promise<IStudySession> {
  await connectToDatabase();

  const dateObj = new Date(data.sessionDate);
  const created = await StudySession.create({
    roadmapId:
      data.roadmapId && mongoose.Types.ObjectId.isValid(data.roadmapId)
        ? new mongoose.Types.ObjectId(data.roadmapId)
        : undefined,
    nodeId: data.nodeId,
    title: data.title,
    startedAt: dateObj,
    endedAt: new Date(dateObj.getTime() + data.durationMinutes * 60 * 1000),
    durationMinutes: data.durationMinutes,
    reflection: data.reflection || "",
    status: "completed",
    sessionDate: dateObj,
  });

  // Record in Activity collection
  const hours = Number((data.durationMinutes / 60).toFixed(2));
  const normDate = new Date(dateObj);
  normDate.setHours(12, 0, 0, 0);

  await Activity.create({
    date: normDate,
    hours,
    topicsCovered: data.nodeId ? 1 : 0,
    roadmapId: created.roadmapId,
    notes: data.title,
  });

  const populated = await StudySession.findById(created._id)
    .populate("roadmapId", "title")
    .lean<any>();

  return {
    _id: populated._id.toString(),
    userId: populated.userId,
    roadmapId: populated.roadmapId?._id?.toString(),
    roadmapTitle: populated.roadmapId?.title,
    nodeId: populated.nodeId,
    title: populated.title,
    startedAt: populated.startedAt?.toISOString(),
    endedAt: populated.endedAt?.toISOString(),
    durationMinutes: populated.durationMinutes,
    reflection: populated.reflection || "",
    status: populated.status,
    sessionDate: populated.sessionDate?.toISOString(),
    createdAt: populated.createdAt?.toISOString(),
    updatedAt: populated.updatedAt?.toISOString(),
  };
}

export async function deleteStudySession(id: string): Promise<boolean> {
  await connectToDatabase();
  const res = await StudySession.findByIdAndDelete(id);
  return res !== null;
}

// ==============================================================================
// 7. COMPREHENSIVE LMS DASHBOARD OVERVIEW & STREAK
// ==============================================================================

export async function getLMSDashboardOverview(): Promise<DashboardLMSOverview> {
  await connectToDatabase();

  const todayStr = new Date().toISOString().split("T")[0];

  // Execute all independent overview queries concurrently in a single batch
  const [
    totalRoadmaps,
    topicStats,
    sessionHoursAgg,
    todayGoal,
    sessions,
    upcomingMilestones,
    recentNotes,
    recentSessions,
    activeSession,
  ] = await Promise.all([
    Roadmap.countDocuments(),
    Roadmap.aggregate([
      {
        $group: {
          _id: null,
          totalCompleted: { $sum: "$completedTopics" },
          totalTopics: { $sum: "$totalTopics" },
        },
      },
    ]),
    StudySession.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, totalMins: { $sum: "$durationMinutes" } } },
    ]),
    getDailyGoal(todayStr),
    StudySession.find({ status: "completed" })
      .sort({ sessionDate: -1 })
      .lean<IStudySessionDocument[]>(),
    getMilestones({ status: "Upcoming" }),
    getNotes({}),
    getStudySessions({ status: "completed", limit: 5 }),
    getActiveStudySession(),
  ]);

  const topicsCompleted = topicStats[0]?.totalCompleted || 0;
  const inProgressTopics = Math.max(0, (topicStats[0]?.totalTopics || 0) - topicsCompleted);

  const totalLearningHours = sessionHoursAgg[0]?.totalMins
    ? Number((sessionHoursAgg[0].totalMins / 60).toFixed(1))
    : 0;

  const remainingMins = Math.max(0, todayGoal.targetMinutes - todayGoal.completedMinutes);
  const goalPercent = Math.min(
    100,
    Math.round((todayGoal.completedMinutes / todayGoal.targetMinutes) * 100)
  );

  // Weekly Goal (target 12 hours)
  const targetWeeklyHours = 12;
  const weeklyActualHours = totalLearningHours;
  const weeklyPercent = Math.min(100, Math.round((weeklyActualHours / targetWeeklyHours) * 100));

  // Learning Streak: count consecutive days with sessions
  let currentStreak = 0;
  let longestStreak = 0;
  const sessionDays = new Set<string>();

  sessions.forEach((s) => {
    if (s.sessionDate) {
      sessionDays.add(new Date(s.sessionDate).toISOString().split("T")[0]);
    }
  });

  const sortedDays = Array.from(sessionDays).sort().reverse();
  const todayDate = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  if (sortedDays.includes(todayDate) || sortedDays.includes(yesterday)) {
    let checkDate = sortedDays.includes(todayDate) ? new Date() : new Date(Date.now() - 86400000);
    while (true) {
      const dStr = checkDate.toISOString().split("T")[0];
      if (sessionDays.has(dStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  longestStreak = Math.max(currentStreak, sortedDays.length > 0 ? sortedDays.length : 1);

  return {
    totalRoadmaps,
    topicsCompleted,
    topicsInProgress: inProgressTopics,
    totalLearningHours,
    todayGoal: {
      targetMinutes: todayGoal.targetMinutes,
      completedMinutes: todayGoal.completedMinutes,
      remainingMinutes: remainingMins,
      completionPercentage: goalPercent,
      tasksTotal: todayGoal.tasks.length,
      tasksCompleted: todayGoal.tasks.filter((t) => t.completed).length,
    },
    weeklyGoal: {
      targetHours: targetWeeklyHours,
      actualHours: weeklyActualHours,
      remainingHours: Math.max(0, targetWeeklyHours - weeklyActualHours),
      completionPercentage: weeklyPercent,
    },
    learningStreak: {
      currentStreak: Math.max(1, currentStreak),
      longestStreak: Math.max(1, longestStreak),
      lastActiveDate: sortedDays[0],
    },
    upcomingMilestones: upcomingMilestones.slice(0, 5),
    recentNotes: recentNotes.slice(0, 4),
    recentSessions,
    activeSession,
  };
}
