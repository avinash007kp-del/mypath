import mongoose, { Schema, Document, Model } from "mongoose";
import { ResourceType, ResourceStatus } from "@/types/lms";

export const RESOURCE_TYPES = [
  "YouTube video",
  "Documentation",
  "Online course",
  "Book",
  "Article",
  "GitHub repository",
  "PDF",
  "Other",
] as const;

export const RESOURCE_STATUSES = ["Pending", "In Progress", "Completed"] as const;

export interface ILearningResourceDocument extends Document {
  userId?: string;
  roadmapId?: mongoose.Types.ObjectId;
  nodeId?: string;
  title: string;
  url: string;
  description: string;
  type: ResourceType;
  author: string;
  tags: string[];
  rating: number;
  isFavorite: boolean;
  status: ResourceStatus;
  createdAt: Date;
  updatedAt: Date;
}

const LearningResourceSchema = new Schema<ILearningResourceDocument>(
  {
    userId: {
      type: String,
      index: true,
      required: false,
    },
    roadmapId: {
      type: Schema.Types.ObjectId,
      ref: "Roadmap",
      index: true,
      required: false,
    },
    nodeId: {
      type: String,
      index: true,
      required: false,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: 150,
    },
    url: {
      type: String,
      required: [true, "Resource URL is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      maxlength: 1000,
    },
    type: {
      type: String,
      enum: RESOURCE_TYPES,
      default: "Documentation",
    },
    author: {
      type: String,
      default: "",
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    isFavorite: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: RESOURCE_STATUSES,
      default: "Pending",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

LearningResourceSchema.index({ roadmapId: 1, nodeId: 1 });
LearningResourceSchema.index({ title: "text", description: "text", tags: "text" });

const LearningResource: Model<ILearningResourceDocument> =
  mongoose.models.LearningResource ||
  mongoose.model<ILearningResourceDocument>("LearningResource", LearningResourceSchema);

export default LearningResource;
