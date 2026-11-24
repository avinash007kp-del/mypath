import mongoose, { Schema, Document, Model } from "mongoose";
import { MilestonePriority, MilestoneStatus } from "@/types/lms";

export const MILESTONE_PRIORITIES = ["Low", "Medium", "High"] as const;
export const MILESTONE_STATUSES = ["Upcoming", "In Progress", "Completed", "Overdue"] as const;

export interface IMilestoneDocument extends Document {
  userId?: string;
  roadmapId: mongoose.Types.ObjectId;
  nodeId?: string;
  title: string;
  description: string;
  targetDate: Date;
  priority: MilestonePriority;
  status: MilestoneStatus;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MilestoneSchema = new Schema<IMilestoneDocument>(
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
      index: true,
      required: false,
    },
    title: {
      type: String,
      required: [true, "Milestone title is required"],
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      default: "",
      maxlength: 1000,
    },
    targetDate: {
      type: Date,
      required: [true, "Target date is required"],
      index: true,
    },
    priority: {
      type: String,
      enum: MILESTONE_PRIORITIES,
      default: "Medium",
    },
    status: {
      type: String,
      enum: MILESTONE_STATUSES,
      default: "Upcoming",
      index: true,
    },
    completedAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

MilestoneSchema.index({ targetDate: 1, status: 1 });

const Milestone: Model<IMilestoneDocument> =
  mongoose.models.Milestone || mongoose.model<IMilestoneDocument>("Milestone", MilestoneSchema);

export default Milestone;
