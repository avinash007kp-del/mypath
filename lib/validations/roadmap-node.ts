import { z } from "zod";

export const NODE_TYPES = [
  "topic",
  "subtopic",
  "milestone",
  "project",
  "resource",
  "assessment",
] as const;

export const NODE_STATUSES = ["Not Started", "In Progress", "Completed", "On Hold"] as const;

export const NODE_PRIORITIES = ["Low", "Medium", "High"] as const;

export const roadmapNodeSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Node title is required." })
    .max(120, { message: "Title cannot exceed 120 characters." })
    .trim(),
  type: z.enum(NODE_TYPES, {
    errorMap: () => ({ message: "Invalid node type." }),
  }),
  description: z.string().max(1000).default(""),
  category: z.string().max(50).default("General"),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]).default("Beginner"),
  estimatedHours: z.coerce.number().min(0).max(500).default(1),
  status: z.enum(NODE_STATUSES).default("Not Started"),
  priority: z.enum(NODE_PRIORITIES).default("Medium"),
  positionX: z.coerce.number().default(0),
  positionY: z.coerce.number().default(0),
  metadata: z.record(z.any()).default({}),
});

export const updateRoadmapNodeSchema = roadmapNodeSchema.partial();

export type RoadmapNodeInput = z.infer<typeof roadmapNodeSchema>;
export type UpdateRoadmapNodeInput = z.infer<typeof updateRoadmapNodeSchema>;
