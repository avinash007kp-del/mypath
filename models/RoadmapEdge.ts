import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRoadmapEdgeDocument extends Document {
  roadmapId: mongoose.Types.ObjectId;
  sourceNodeId: string;
  targetNodeId: string;
  label?: string;
  type: string;
  animated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoadmapEdgeSchema = new Schema<IRoadmapEdgeDocument>(
  {
    roadmapId: {
      type: Schema.Types.ObjectId,
      ref: "Roadmap",
      required: [true, "roadmapId is required"],
      index: true,
    },
    sourceNodeId: {
      type: String,
      required: [true, "sourceNodeId is required"],
    },
    targetNodeId: {
      type: String,
      required: [true, "targetNodeId is required"],
    },
    label: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      default: "smoothstep",
    },
    animated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

RoadmapEdgeSchema.index({ roadmapId: 1, sourceNodeId: 1, targetNodeId: 1 });

const RoadmapEdge: Model<IRoadmapEdgeDocument> =
  mongoose.models.RoadmapEdge ||
  mongoose.model<IRoadmapEdgeDocument>("RoadmapEdge", RoadmapEdgeSchema);

export default RoadmapEdge;
