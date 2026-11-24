import { z } from "zod";

export const analyticsQuerySchema = z.object({
  dateRange: z.enum(["7d", "30d", "90d", "year", "all", "custom"]).default("30d"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  roadmapId: z.string().optional().default("All"),
  period: z.enum(["daily", "weekly", "monthly"]).default("weekly"),
});

export const activityCalendarQuerySchema = z.object({
  year: z.coerce
    .number()
    .optional()
    .default(() => new Date().getFullYear()),
  roadmapId: z.string().optional().default("All"),
  filterType: z.enum(["all", "sessions", "topics"]).default("all"),
});

export const dayDetailsQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Date must be YYYY-MM-DD" }),
  roadmapId: z.string().optional().default("All"),
});

export type AnalyticsQueryInput = z.infer<typeof analyticsQuerySchema>;
export type ActivityCalendarQueryInput = z.infer<typeof activityCalendarQuerySchema>;
export type DayDetailsQueryInput = z.infer<typeof dayDetailsQuerySchema>;
