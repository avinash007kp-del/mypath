import mongoose, { Schema, Document, Model } from "mongoose";

export interface IActivityDocument extends Document {
  date: Date;
  hours: number;
  topicsCovered: number;
  roadmapId?: mongoose.Types.ObjectId;
  notes?: string;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema = new Schema<IActivityDocument>(
  {
    date: {
      type: Date,
      required: true,
      index: true,
    },
    hours: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    topicsCovered: {
      type: Number,
      min: 0,
      default: 0,
    },
    roadmapId: {
      type: Schema.Types.ObjectId,
      ref: "Roadmap",
      required: false,
    },
    notes: {
      type: String,
      default: "",
    },
    userId: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Activity: Model<IActivityDocument> =
  mongoose.models.Activity || mongoose.model<IActivityDocument>("Activity", ActivitySchema);

export default Activity;
