import mongoose, { Schema, Document, Model } from "mongoose";
import { RoadmapNodeType, NodeStatus, NodePriority, NodeMetadata } from "@/types/roadmap";
import { NODE_TYPES, NODE_STATUSES, NODE_PRIORITIES } from "@/lib/validations/roadmap-node";

export interface IRoadmapNodeDocument extends Document {
  roadmapId: mongoose.Types.ObjectId;
  type: RoadmapNodeType;
  title: string;
  description: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedHours: number;
  status: NodeStatus;
  priority: NodePriority;
  positionX: number;
  positionY: number;
  metadata: NodeMetadata;
  createdAt: Date;
  updatedAt: Date;
}

const RoadmapNodeSchema = new Schema<IRoadmapNodeDocument>(
  {
    roadmapId: {
      type: Schema.Types.ObjectId,
      ref: "Roadmap",
      required: [true, "roadmapId is required"],
      index: true,
    },
    type: {
      type: String,
      required: [true, "type is required"],
      enum: NODE_TYPES,
      default: "topic",
    },
    title: {
      type: String,
      required: [true, "title is required"],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      default: "",
      maxlength: 1000,
    },
    category: {
      type: String,
      default: "General",
    },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    estimatedHours: {
      type: Number,
      min: 0,
      default: 1,
    },
    status: {
      type: String,
      enum: NODE_STATUSES,
      default: "Not Started",
    },
    priority: {
      type: String,
      enum: NODE_PRIORITIES,
      default: "Medium",
    },
    positionX: {
      type: Number,
      required: true,
      default: 0,
    },
    positionY: {
      type: Number,
      required: true,
      default: 0,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

RoadmapNodeSchema.index({ roadmapId: 1, type: 1 });

const RoadmapNode: Model<IRoadmapNodeDocument> =
  mongoose.models.RoadmapNode ||
  mongoose.model<IRoadmapNodeDocument>("RoadmapNode", RoadmapNodeSchema);

export default RoadmapNode;
