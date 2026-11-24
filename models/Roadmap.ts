import mongoose, { Schema, Document, Model } from "mongoose";
import { ROADMAP_CATEGORIES, ROADMAP_DIFFICULTIES } from "@/lib/validations/roadmap";

export interface IRoadmapDocument extends Document {
  title: string;
  description: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedDuration: string;
  icon: string;
  tags: string[];
  progress: number;
  totalTopics: number;
  completedTopics: number;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RoadmapSchema = new Schema<IRoadmapDocument>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      default: "",
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ROADMAP_CATEGORIES,
    },
    difficulty: {
      type: String,
      required: [true, "Difficulty is required"],
      enum: ROADMAP_DIFFICULTIES,
      default: "Beginner",
    },
    estimatedDuration: {
      type: String,
      required: [true, "Estimated duration is required"],
      trim: true,
    },
    icon: {
      type: String,
      default: "🚀",
    },
    tags: {
      type: [String],
      default: [],
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    totalTopics: {
      type: Number,
      min: 0,
      default: 0,
    },
    completedTopics: {
      type: Number,
      min: 0,
      default: 0,
    },
    userId: {
      type: String,
      required: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-calculate progress before saving if totalTopics > 0
RoadmapSchema.pre("save", function (next) {
  if (this.totalTopics > 0) {
    this.progress = Math.min(100, Math.round((this.completedTopics / this.totalTopics) * 100));
  } else {
    this.progress = 0;
  }
  next();
});

const Roadmap: Model<IRoadmapDocument> =
  mongoose.models.Roadmap || mongoose.model<IRoadmapDocument>("Roadmap", RoadmapSchema);

export default Roadmap;
