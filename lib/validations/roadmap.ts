import { z } from "zod";

export const ROADMAP_CATEGORIES = [
  "Web Development",
  "AI & Machine Learning",
  "Data Science",
  "Computer Science",
  "Embedded Systems",
  "Robotics",
  "Mobile Development",
  "Other",
] as const;

export const ROADMAP_DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"] as const;

export const roadmapSchema = z.object({
  title: z
    .string()
    .min(2, { message: "Title must be at least 2 characters." })
    .max(100, { message: "Title cannot exceed 100 characters." })
    .trim(),
  description: z
    .string()
    .max(500, { message: "Description cannot exceed 500 characters." })
    .default(""),
  category: z.enum(ROADMAP_CATEGORIES, {
    errorMap: () => ({ message: "Please select a valid category." }),
  }),
  difficulty: z.enum(ROADMAP_DIFFICULTIES, {
    errorMap: () => ({ message: "Please select a difficulty level." }),
  }),
  estimatedDuration: z
    .string()
    .min(1, { message: "Estimated duration is required (e.g., '6 weeks', '3 months')." })
    .max(50, { message: "Duration description is too long." })
    .trim(),
  icon: z.string().max(20).default("🚀"),
  tags: z.array(z.string().trim().min(1)).default([]),
  totalTopics: z.coerce.number().min(0).default(0),
  completedTopics: z.coerce.number().min(0).default(0),
});

export const updateRoadmapSchema = roadmapSchema.partial();

export type RoadmapInput = z.infer<typeof roadmapSchema>;
export type UpdateRoadmapInput = z.infer<typeof updateRoadmapSchema>;
