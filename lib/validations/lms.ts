import { z } from "zod";
import { RESOURCE_TYPES, RESOURCE_STATUSES } from "@/models/LearningResource";
import { MILESTONE_PRIORITIES, MILESTONE_STATUSES } from "@/models/Milestone";
import { NODE_STATUSES } from "./roadmap-node";

// 1. Notes Validation
export const learningNoteSchema = z.object({
  roadmapId: z.string().optional(),
  nodeId: z.string().optional(),
  title: z
    .string()
    .min(1, { message: "Note title is required." })
    .max(150, { message: "Title cannot exceed 150 characters." })
    .trim(),
  content: z.string().default(""),
  tags: z.array(z.string().trim().min(1)).default([]),
});

export const updateLearningNoteSchema = learningNoteSchema.partial();

// 2. Resources Validation
export const learningResourceSchema = z.object({
  roadmapId: z.string().optional(),
  nodeId: z.string().optional(),
  title: z
    .string()
    .min(1, { message: "Resource title is required." })
    .max(150, { message: "Title cannot exceed 150 characters." })
    .trim(),
  url: z.string().url({ message: "Please provide a valid URL." }).trim(),
  description: z.string().max(1000).default(""),
  type: z.enum(RESOURCE_TYPES).default("Documentation"),
  author: z.string().max(100).default(""),
  tags: z.array(z.string().trim().min(1)).default([]),
  rating: z.coerce.number().min(1).max(5).default(5),
  isFavorite: z.boolean().default(false),
  status: z.enum(RESOURCE_STATUSES).default("Pending"),
});

export const updateLearningResourceSchema = learningResourceSchema.partial();

// 3. Milestones Validation
export const milestoneSchema = z.object({
  roadmapId: z.string().min(1, { message: "Roadmap ID is required." }),
  nodeId: z.string().optional(),
  title: z
    .string()
    .min(1, { message: "Milestone title is required." })
    .max(150, { message: "Title cannot exceed 150 characters." })
    .trim(),
  description: z.string().max(1000).default(""),
  targetDate: z.string().min(1, { message: "Target date is required." }),
  priority: z.enum(MILESTONE_PRIORITIES).default("Medium"),
  status: z.enum(MILESTONE_STATUSES).default("Upcoming"),
  completedAt: z.string().optional(),
});

export const updateMilestoneSchema = milestoneSchema.partial();

// 4. Daily Goals Validation
export const dailyGoalTaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1, { message: "Task title is required." }).trim(),
  targetMinutes: z.coerce.number().min(1).default(30),
  completedMinutes: z.coerce.number().min(0).default(0),
  completed: z.boolean().default(false),
  roadmapId: z.string().optional(),
  roadmapTitle: z.string().optional(),
  nodeId: z.string().optional(),
  nodeTitle: z.string().optional(),
});

export const dailyGoalSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Date must be formatted as YYYY-MM-DD",
  }),
  targetMinutes: z.coerce.number().min(1).default(60),
  completedMinutes: z.coerce.number().min(0).default(0),
  tasks: z.array(dailyGoalTaskSchema).default([]),
});

export const updateDailyGoalSchema = dailyGoalSchema.partial();

// 5. Study Session Validation
export const studySessionSchema = z.object({
  roadmapId: z.string().optional(),
  nodeId: z.string().optional(),
  title: z.string().min(1, { message: "Session title is required." }).trim(),
  startedAt: z.string().optional(),
  endedAt: z.string().optional(),
  durationMinutes: z.coerce.number().min(0).default(0),
  reflection: z.string().max(2000).default(""),
  status: z.enum(["active", "paused", "completed"]).default("completed"),
  sessionDate: z.string().optional(),
});

export const updateStudySessionSchema = studySessionSchema.partial();

// 6. Learning Progress Validation
export const learningProgressSchema = z.object({
  roadmapId: z.string().min(1, { message: "Roadmap ID is required." }),
  nodeId: z.string().min(1, { message: "Node ID is required." }),
  status: z.enum(NODE_STATUSES).default("Not Started"),
  progressPercentage: z.coerce.number().refine((val) => [0, 25, 50, 75, 100].includes(val), {
    message: "Progress percentage must be 0, 25, 50, 75, or 100.",
  }),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  totalLearningMinutes: z.coerce.number().min(0).default(0),
});

export const updateLearningProgressSchema = learningProgressSchema.partial();
