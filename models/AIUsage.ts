import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAIUsageDocument extends Omit<Document, "model"> {
  endpoint: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;
  success: boolean;
  errorMessage?: string;
  userId?: string;
  createdAt: Date;
}

const AIUsageSchema = new Schema<IAIUsageDocument>(
  {
    endpoint: {
      type: String,
      required: true,
      index: true,
    },
    model: {
      type: String,
      required: true,
      default: "gpt-4o-mini",
    },
    promptTokens: {
      type: Number,
      required: true,
      default: 0,
    },
    completionTokens: {
      type: Number,
      required: true,
      default: 0,
    },
    totalTokens: {
      type: Number,
      required: true,
      default: 0,
    },
    estimatedCost: {
      type: Number,
      required: true,
      default: 0,
    },
    success: {
      type: Boolean,
      required: true,
      default: true,
    },
    errorMessage: {
      type: String,
      required: false,
    },
    userId: {
      type: String,
      index: true,
      required: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

AIUsageSchema.index({ createdAt: -1 });

export const AIUsage: Model<IAIUsageDocument> =
  mongoose.models.AIUsage || mongoose.model<IAIUsageDocument>("AIUsage", AIUsageSchema);

export default AIUsage;
