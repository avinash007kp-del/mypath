import { connectToDatabase } from "@/lib/mongodb";
import Roadmap, { IRoadmapDocument } from "@/models/Roadmap";
import { RoadmapInput, UpdateRoadmapInput } from "@/lib/validations/roadmap";
import { IRoadmap } from "@/types";

export interface RoadmapFilterQuery {
  search?: string;
  category?: string;
  difficulty?: string;
  sortBy?: "updatedAt" | "createdAt" | "progress" | "title";
  order?: "asc" | "desc";
}

function transformRoadmap(doc: IRoadmapDocument): IRoadmap {
  return {
    _id: doc._id.toString(),
    title: doc.title,
    description: doc.description || "",
    category: doc.category as IRoadmap["category"],
    difficulty: doc.difficulty as IRoadmap["difficulty"],
    estimatedDuration: doc.estimatedDuration,
    icon: doc.icon || "🚀",
    tags: doc.tags || [],
    progress: doc.progress || 0,
    totalTopics: doc.totalTopics || 0,
    completedTopics: doc.completedTopics || 0,
    userId: doc.userId,
    createdAt: doc.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: doc.updatedAt?.toISOString() || new Date().toISOString(),
  };
}

export async function getAllRoadmaps(filters: RoadmapFilterQuery = {}): Promise<IRoadmap[]> {
  await connectToDatabase();

  const query: Record<string, unknown> = {};

  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: "i" } },
      { description: { $regex: filters.search, $options: "i" } },
      { tags: { $in: [new RegExp(filters.search, "i")] } },
    ];
  }

  if (filters.category && filters.category !== "All") {
    query.category = filters.category;
  }

  if (filters.difficulty && filters.difficulty !== "All") {
    query.difficulty = filters.difficulty;
  }

  const sortField = filters.sortBy || "updatedAt";
  const sortDirection = filters.order === "asc" ? 1 : -1;

  const docs = await Roadmap.find(query)
    .sort({ [sortField]: sortDirection })
    .lean<IRoadmapDocument[]>();

  return docs.map(transformRoadmap);
}

export async function getRoadmapById(id: string): Promise<IRoadmap | null> {
  await connectToDatabase();

  const doc = await Roadmap.findById(id).lean<IRoadmapDocument>();
  if (!doc) return null;

  return transformRoadmap(doc);
}

export async function createRoadmap(data: RoadmapInput): Promise<IRoadmap> {
  await connectToDatabase();

  let progress = 0;
  if (data.totalTopics && data.totalTopics > 0) {
    progress = Math.min(100, Math.round(((data.completedTopics || 0) / data.totalTopics) * 100));
  }

  const newRoadmap = await Roadmap.create({
    ...data,
    progress,
  });

  return transformRoadmap(newRoadmap);
}

export async function updateRoadmap(
  id: string,
  data: UpdateRoadmapInput
): Promise<IRoadmap | null> {
  await connectToDatabase();

  const existing = await Roadmap.findById(id);
  if (!existing) return null;

  if (data.title !== undefined) existing.title = data.title;
  if (data.description !== undefined) existing.description = data.description;
  if (data.category !== undefined) existing.category = data.category;
  if (data.difficulty !== undefined) existing.difficulty = data.difficulty;
  if (data.estimatedDuration !== undefined) existing.estimatedDuration = data.estimatedDuration;
  if (data.icon !== undefined) existing.icon = data.icon;
  if (data.tags !== undefined) existing.tags = data.tags;
  if (data.totalTopics !== undefined) existing.totalTopics = data.totalTopics;
  if (data.completedTopics !== undefined) existing.completedTopics = data.completedTopics;

  if (existing.totalTopics > 0) {
    existing.progress = Math.min(
      100,
      Math.round((existing.completedTopics / existing.totalTopics) * 100)
    );
  } else {
    existing.progress = 0;
  }

  await existing.save();

  return transformRoadmap(existing);
}

export async function deleteRoadmap(id: string): Promise<boolean> {
  await connectToDatabase();

  const result = await Roadmap.findByIdAndDelete(id);
  return result !== null;
}
