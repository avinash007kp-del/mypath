import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILearningNoteDocument extends Document {
  userId?: string;
  roadmapId?: mongoose.Types.ObjectId;
  nodeId?: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const LearningNoteSchema = new Schema<ILearningNoteDocument>(
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
      required: [true, "Note title is required"],
      trim: true,
      maxlength: 150,
    },
    content: {
      type: String,
      default: "",
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

LearningNoteSchema.index({ roadmapId: 1, nodeId: 1 });
LearningNoteSchema.index({ title: "text", content: "text", tags: "text" });

const LearningNote: Model<ILearningNoteDocument> =
  mongoose.models.LearningNote ||
  mongoose.model<ILearningNoteDocument>("LearningNote", LearningNoteSchema);

export default LearningNote;
