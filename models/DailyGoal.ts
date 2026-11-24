import mongoose, { Schema, Document, Model } from "mongoose";
import { IDailyGoalTask } from "@/types/lms";

export interface IDailyGoalDocument extends Document {
  userId?: string;
  date: string; // "YYYY-MM-DD"
  targetMinutes: number;
  completedMinutes: number;
  tasks: IDailyGoalTask[];
  createdAt: Date;
  updatedAt: Date;
}

const DailyGoalTaskSchema = new Schema<IDailyGoalTask>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    targetMinutes: { type: Number, required: true, default: 30 },
    completedMinutes: { type: Number, required: true, default: 0 },
    completed: { type: Boolean, required: true, default: false },
    roadmapId: { type: String, required: false },
    roadmapTitle: { type: String, required: false },
    nodeId: { type: String, required: false },
    nodeTitle: { type: String, required: false },
  },
  { _id: false }
);

const DailyGoalSchema = new Schema<IDailyGoalDocument>(
  {
    userId: {
      type: String,
      index: true,
      required: false,
    },
    date: {
      type: String, // "YYYY-MM-DD" format for strict daily index
      required: [true, "Date is required"],
      index: true,
    },
    targetMinutes: {
      type: Number,
      required: [true, "Target minutes is required"],
      min: 1,
      default: 60,
    },
    completedMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    tasks: {
      type: [DailyGoalTaskSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

DailyGoalSchema.index({ userId: 1, date: 1 }, { unique: true });

const DailyGoal: Model<IDailyGoalDocument> =
  mongoose.models.DailyGoal || mongoose.model<IDailyGoalDocument>("DailyGoal", DailyGoalSchema);

export default DailyGoal;
