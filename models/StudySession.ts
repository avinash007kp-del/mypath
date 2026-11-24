import mongoose, { Schema, Document, Model } from "mongoose";
import { SessionStatus } from "@/types/lms";

export interface IStudySessionDocument extends Document {
  userId?: string;
  roadmapId?: mongoose.Types.ObjectId;
  nodeId?: string;
  title: string;
  startedAt: Date;
  endedAt?: Date;
  durationMinutes: number;
  reflection: string;
  status: SessionStatus;
  sessionDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const StudySessionSchema = new Schema<IStudySessionDocument>(
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
      required: [true, "Session title is required"],
      trim: true,
      maxlength: 150,
      default: "Deep Work Study Session",
    },
    startedAt: {
      type: Date,
      required: [true, "Session start time is required"],
      default: Date.now,
    },
    endedAt: {
      type: Date,
      required: false,
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    reflection: {
      type: String,
      default: "",
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ["active", "paused", "completed"],
      default: "active",
      index: true,
    },
    sessionDate: {
      type: Date,
      required: true,
      default: () => new Date(),
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

StudySessionSchema.index({ userId: 1, status: 1 });

const StudySession: Model<IStudySessionDocument> =
  mongoose.models.StudySession ||
  mongoose.model<IStudySessionDocument>("StudySession", StudySessionSchema);

export default StudySession;
