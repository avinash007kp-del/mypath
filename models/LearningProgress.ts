import mongoose, { Schema, Document, Model } from "mongoose";
import { ProgressPercentage } from "@/types/lms";
import { NODE_STATUSES } from "@/lib/validations/roadmap-node";

export interface ILearningProgressDocument extends Document {
  userId?: string;
  roadmapId: mongoose.Types.ObjectId;
  nodeId: string;
  status: "Not Started" | "In Progress" | "Completed" | "On Hold";
  progressPercentage: ProgressPercentage;
  startedAt?: Date;
  completedAt?: Date;
  totalLearningMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

const LearningProgressSchema = new Schema<ILearningProgressDocument>(
  {
    userId: {
      type: String,
      index: true,
      required: false,
    },
    roadmapId: {
      type: Schema.Types.ObjectId,
      ref: "Roadmap",
      required: [true, "roadmapId is required"],
      index: true,
    },
    nodeId: {
      type: String,
      required: [true, "nodeId is required"],
      index: true,
    },
    status: {
      type: String,
      enum: NODE_STATUSES,
      default: "Not Started",
    },
    progressPercentage: {
      type: Number,
      enum: [0, 25, 50, 75, 100],
      default: 0,
    },
    startedAt: {
      type: Date,
      required: false,
    },
    completedAt: {
      type: Date,
      required: false,
    },
    totalLearningMinutes: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

LearningProgressSchema.index({ userId: 1, roadmapId: 1, nodeId: 1 }, { unique: true });

const LearningProgress: Model<ILearningProgressDocument> =
  mongoose.models.LearningProgress ||
  mongoose.model<ILearningProgressDocument>("LearningProgress", LearningProgressSchema);

export default LearningProgress;
