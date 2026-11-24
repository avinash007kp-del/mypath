import mongoose, { Schema, Document, Model } from "mongoose";
import {
  GeneratedRoadmapStage,
  GeneratedRoadmapMilestone,
  GeneratedRoadmapCapstone,
} from "@/types/ai";

export interface IGeneratedRoadmapDocument extends Document {
  title: string;
  description: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedDuration: string;
  dailyCommitmentHours: number;
  userGoal: string;
  currentLevel: string;
  learningStyle: string;
  stages: GeneratedRoadmapStage[];
  milestones: GeneratedRoadmapMilestone[];
  capstoneProject?: GeneratedRoadmapCapstone;
  status: "draft" | "converted";
  convertedRoadmapId?: string;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GeneratedRoadmapTopicSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    estimatedHours: { type: Number, required: true, default: 4 },
    prerequisites: [{ type: String }],
    subtopics: [{ type: String }],
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    practicalProject: { type: String, required: false },
  },
  { _id: false }
);

const GeneratedRoadmapStageSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    estimatedHours: { type: Number, required: true, default: 20 },
    topics: [GeneratedRoadmapTopicSchema],
  },
  { _id: false }
);

const GeneratedRoadmapMilestoneSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    targetWeek: { type: Number, required: true },
  },
  { _id: false }
);

const GeneratedRoadmapCapstoneSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    deliverables: [{ type: String }],
  },
  { _id: false }
);

const GeneratedRoadmapSchema = new Schema<IGeneratedRoadmapDocument>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
    },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true,
    },
    estimatedDuration: {
      type: String,
      required: true,
      default: "12 Weeks",
    },
    dailyCommitmentHours: {
      type: Number,
      required: true,
      default: 2,
    },
    userGoal: {
      type: String,
      required: true,
    },
    currentLevel: {
      type: String,
      required: true,
    },
    learningStyle: {
      type: String,
      default: "Balanced",
    },
    stages: [GeneratedRoadmapStageSchema],
    milestones: [GeneratedRoadmapMilestoneSchema],
    capstoneProject: {
      type: GeneratedRoadmapCapstoneSchema,
      required: false,
    },
    status: {
      type: String,
      enum: ["draft", "converted"],
      default: "draft",
      index: true,
    },
    convertedRoadmapId: {
      type: String,
      required: false,
    },
    userId: {
      type: String,
      index: true,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

GeneratedRoadmapSchema.index({ userId: 1, createdAt: -1 });

export const GeneratedRoadmap: Model<IGeneratedRoadmapDocument> =
  mongoose.models.GeneratedRoadmap ||
  mongoose.model<IGeneratedRoadmapDocument>("GeneratedRoadmap", GeneratedRoadmapSchema);

export default GeneratedRoadmap;
