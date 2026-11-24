import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRoadmapViewportDocument extends Document {
  roadmapId: mongoose.Types.ObjectId;
  x: number;
  y: number;
  zoom: number;
  updatedAt: Date;
}

const RoadmapViewportSchema = new Schema<IRoadmapViewportDocument>(
  {
    roadmapId: {
      type: Schema.Types.ObjectId,
      ref: "Roadmap",
      required: [true, "roadmapId is required"],
      unique: true,
      index: true,
    },
    x: {
      type: Number,
      default: 0,
    },
    y: {
      type: Number,
      default: 0,
    },
    zoom: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

const RoadmapViewport: Model<IRoadmapViewportDocument> =
  mongoose.models.RoadmapViewport ||
  mongoose.model<IRoadmapViewportDocument>("RoadmapViewport", RoadmapViewportSchema);

export default RoadmapViewport;
