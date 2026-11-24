import { z } from "zod";

export const aiModes = [
  "general",
  "roadmap",
  "next_topic",
  "resource",
  "breakdown",
  "learning_plan",
  "explainer",
  "quiz",
] as const;

export const aiChatSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(4000, "Message too long"),
  conversationId: z.string().optional(),
  mode: z.enum(aiModes).default("general"),
  contextRoadmapId: z.string().optional(),
  contextNodeId: z.string().optional(),
});

export const generateRoadmapSchema = z.object({
  careerGoal: z.string().min(3, "Career goal must be at least 3 characters").max(200),
  currentLevel: z.enum([
    "Complete Beginner",
    "Novice / Basic Familiarity",
    "Intermediate / Working Knowledge",
    "Advanced / Upskilling",
  ]),
  dailyHours: z.coerce.number().min(0.5).max(16).default(2),
  targetDuration: z.string().min(2).max(50).default("12 Weeks"),
  learningStyle: z
    .enum(["Hands-on Projects", "Deep Conceptual & Theory", "Fast-paced & Practical", "Balanced"])
    .default("Balanced"),
  preferredCategory: z.string().optional(),
  existingKnowledge: z.string().max(500).optional(),
  focusAreas: z.string().max(500).optional(),
});

export const nextTopicSchema = z.object({
  roadmapId: z.string().optional(),
  prioritizeQuickWins: z.boolean().default(false),
});

export const suggestResourcesSchema = z.object({
  topicTitle: z.string().min(1, "Topic title is required").max(150),
  category: z.string().optional(),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]).optional().default("Intermediate"),
  preferredType: z.string().optional(),
});

export const breakdownTopicSchema = z.object({
  topicTitle: z.string().min(1, "Topic title is required").max(150),
  roadmapId: z.string().optional(),
  nodeId: z.string().optional(),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]).optional().default("Intermediate"),
  depthLevel: z
    .enum(["Standard (3-4 subtasks)", "Detailed (5-7 subtasks)"])
    .optional()
    .default("Standard (3-4 subtasks)"),
});

export const generateLearningPlanSchema = z.object({
  weeklyHours: z.coerce.number().min(1).max(80).optional().default(14),
  focusRoadmapIds: z.array(z.string()).optional(),
  targetDays: z.array(z.string()).optional(),
  targetMilestone: z.string().max(200).optional(),
});

export const explainTopicSchema = z.object({
  topicTitle: z.string().min(1, "Topic title is required").max(150),
  context: z.string().max(500).optional(),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]).optional().default("Intermediate"),
  includeCode: z.boolean().optional().default(true),
});

export const generateQuizSchema = z.object({
  topicTitle: z.string().min(1, "Topic title is required").max(150),
  questionCount: z.coerce.number().min(2).max(10).optional().default(4),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]).optional().default("Intermediate"),
});

export const saveGeneratedRoadmapSchema = z.object({
  generatedRoadmapId: z.string().min(1, "Generated Roadmap ID is required"),
  customTitle: z.string().min(2).max(100).optional(),
});

export type AIChatInput = z.infer<typeof aiChatSchema>;
export type GenerateRoadmapInput = z.infer<typeof generateRoadmapSchema>;
export type NextTopicInput = z.infer<typeof nextTopicSchema>;
export type SuggestResourcesInput = z.infer<typeof suggestResourcesSchema>;
export type BreakdownTopicInput = z.infer<typeof breakdownTopicSchema>;
export type GenerateLearningPlanInput = z.infer<typeof generateLearningPlanSchema>;
export type ExplainTopicInput = z.infer<typeof explainTopicSchema>;
export type GenerateQuizInput = z.infer<typeof generateQuizSchema>;
export type SaveGeneratedRoadmapInput = z.infer<typeof saveGeneratedRoadmapSchema>;
