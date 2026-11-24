import mongoose from "mongoose";
import { DateRangePreset } from "@/types/analytics";

export interface DateRangeResult {
  start: Date;
  end: Date;
  prevStart: Date;
  prevEnd: Date;
  totalDays: number;
}

/**
 * Calculates start, end, and matching previous-period dates for fair comparisons.
 */
export function calculateDateRanges(
  preset: DateRangePreset,
  customStart?: string,
  customEnd?: string
): DateRangeResult {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  let start = new Date(end);
  let totalDays = 30;

  switch (preset) {
    case "7d":
      totalDays = 7;
      start.setDate(end.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      break;

    case "30d":
      totalDays = 30;
      start.setDate(end.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      break;

    case "90d":
      totalDays = 90;
      start.setDate(end.getDate() - 89);
      start.setHours(0, 0, 0, 0);
      break;

    case "year": {
      // Current calendar year or trailing 365 days
      start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      break;
    }

    case "all": {
      // 5 years back to cover all data
      totalDays = 365 * 5;
      start.setFullYear(start.getFullYear() - 5);
      start.setHours(0, 0, 0, 0);
      break;
    }

    case "custom": {
      if (customStart && customEnd) {
        start = new Date(customStart);
        start.setHours(0, 0, 0, 0);
        const cEnd = new Date(customEnd);
        cEnd.setHours(23, 59, 59, 999);
        const diffTime = Math.max(1, cEnd.getTime() - start.getTime());
        totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        const prevEnd = new Date(start.getTime() - 1);
        const prevStart = new Date(prevEnd.getTime() - totalDays * 24 * 60 * 60 * 1000);
        return { start, end: cEnd, prevStart, prevEnd, totalDays };
      }
      totalDays = 30;
      start.setDate(end.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      break;
    }
  }

  // Previous period with matching day span
  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = new Date(start);
  prevStart.setDate(prevStart.getDate() - totalDays);
  prevStart.setHours(0, 0, 0, 0);

  return { start, end, prevStart, prevEnd, totalDays };
}

/**
 * Builds standard MongoDB match query with optional roadmap scoping
 */
export function buildRoadmapScope(roadmapId?: string): Record<string, unknown> {
  if (!roadmapId || roadmapId === "All") return {};
  if (mongoose.Types.ObjectId.isValid(roadmapId)) {
    return { roadmapId: new mongoose.Types.ObjectId(roadmapId) };
  }
  return {};
}

/**
 * Formats a Date object to YYYY-MM-DD in local time
 */
export function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
