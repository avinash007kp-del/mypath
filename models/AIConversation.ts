import mongoose, { Schema, Document, Model } from "mongoose";
import { AIMode } from "@/types/ai";

export interface IAIConversationDocument extends Document {
  title: string;
  userId?: string;
  mode: AIMode;
  contextRoadmapId?: string;
  contextNodeId?: string;
  messageCount: number;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AIConversationSchema = new Schema<IAIConversationDocument>(
  {
    title: {
      type: String,
      required: [true, "Conversation title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
      default: "New Chat",
    },
    userId: {
      type: String,
      index: true,
      required: false,
    },
    mode: {
      type: String,
      enum: [
        "general",
        "roadmap",
        "next_topic",
        "resource",
        "breakdown",
        "learning_plan",
        "explainer",
        "quiz",
      ],
      default: "general",
      index: true,
    },
    contextRoadmapId: {
      type: String,
      required: false,
      index: true,
    },
    contextNodeId: {
      type: String,
      required: false,
    },
    messageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

AIConversationSchema.index({ userId: 1, updatedAt: -1 });

export const AIConversation: Model<IAIConversationDocument> =
  mongoose.models.AIConversation ||
  mongoose.model<IAIConversationDocument>("AIConversation", AIConversationSchema);

export default AIConversation;
