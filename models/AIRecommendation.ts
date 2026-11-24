import mongoose, { Schema, Document, Model } from "mongoose";
import { RecommendationType } from "@/types/ai";

export interface IAIRecommendationDocument extends Document {
  type: RecommendationType;
  roadmapId: string;
  roadmapTitle?: string;
  nodeId: string;
  topicTitle: string;
  score: number;
  rationale: string;
  estimatedMinutes: number;
  prerequisitesMet: boolean;
  unmetPrerequisites?: string[];
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
  status: "active" | "accepted" | "dismissed";
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AIRecommendationSchema = new Schema<IAIRecommendationDocument>(
  {
    type: {
      type: String,
      enum: ["next_topic", "quick_win", "career_critical", "revision"],
      required: true,
      index: true,
    },
    roadmapId: {
      type: String,
      required: true,
      index: true,
    },
    roadmapTitle: {
      type: String,
      required: false,
    },
    nodeId: {
      type: String,
      required: true,
      index: true,
    },
    topicTitle: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
      default: 85,
    },
    rationale: {
      type: String,
      required: true,
    },
    estimatedMinutes: {
      type: Number,
      required: true,
      default: 45,
    },
    prerequisitesMet: {
      type: Boolean,
      required: true,
      default: true,
    },
    unmetPrerequisites: [{ type: String }],
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Intermediate",
    },
    status: {
      type: String,
      enum: ["active", "accepted", "dismissed"],
      default: "active",
      index: true,
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

AIRecommendationSchema.index({ userId: 1, roadmapId: 1, status: 1 });

export const AIRecommendation: Model<IAIRecommendationDocument> =
  mongoose.models.AIRecommendation ||
  mongoose.model<IAIRecommendationDocument>("AIRecommendation", AIRecommendationSchema);

export default AIRecommendation;
