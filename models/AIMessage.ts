import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAIMessageDocument extends Document {
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata?: {
    model?: string;
    tokensUsed?: number;
    actionType?: string;
    cardType?:
      | "roadmap_preview"
      | "next_topic"
      | "resource_list"
      | "breakdown"
      | "learning_plan"
      | "quiz"
      | "explanation";
    payload?: unknown;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AIMessageSchema = new Schema<IAIMessageDocument>(
  {
    conversationId: {
      type: String,
      required: [true, "Conversation ID is required"],
      index: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
    },
    metadata: {
      type: Schema.Types.Mixed,
      required: false,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

AIMessageSchema.index({ conversationId: 1, createdAt: 1 });

export const AIMessage: Model<IAIMessageDocument> =
  mongoose.models.AIMessage || mongoose.model<IAIMessageDocument>("AIMessage", AIMessageSchema);

export default AIMessage;
