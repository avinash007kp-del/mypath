import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICredentialItem {
  id: string;
  issuer: string;
  title: string;
  description: string;
  verifiedHash?: string;
  grade?: string;
  verifiedDate?: string;
  status: "verified" | "pending" | "unverified" | "rejected";
}

export interface IConnectedRepoItem {
  id: string;
  provider: "github" | "obsidian" | "zotero" | "other";
  name: string;
  detail: string;
  connected: boolean;
  lastSync?: string;
}

export interface ICognitivePreferences {
  focusInterval: string;
  diagnosticRigor: boolean;
  dailyCommitmentHours: number;
  aiInterventionLevel: string;
}

export interface IUserProfileDocument extends Document {
  userId?: string;
  name: string;
  username: string;
  title: string;
  tier: string;
  nodeId: string;
  activeDays: number;
  avatarUrl: string;
  manifesto: string;
  runtimeQuota: string;
  proofKey: string;
  preferences: ICognitivePreferences;
  credentials: ICredentialItem[];
  repositories: IConnectedRepoItem[];
  createdAt: Date;
  updatedAt: Date;
}

const CredentialSchema = new Schema<ICredentialItem>(
  {
    id: { type: String, required: true },
    issuer: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    verifiedHash: { type: String },
    grade: { type: String },
    verifiedDate: { type: String },
    status: {
      type: String,
      enum: ["verified", "pending", "unverified", "rejected"],
      default: "verified",
    },
  },
  { _id: false }
);

const ConnectedRepoSchema = new Schema<IConnectedRepoItem>(
  {
    id: { type: String, required: true },
    provider: { type: String, required: true },
    name: { type: String, required: true },
    detail: { type: String, required: true },
    connected: { type: Boolean, default: true },
    lastSync: { type: String },
  },
  { _id: false }
);

const CognitivePreferencesSchema = new Schema<ICognitivePreferences>(
  {
    focusInterval: { type: String, default: "50m // 10m" },
    diagnosticRigor: { type: Boolean, default: true },
    dailyCommitmentHours: { type: Number, default: 3.5 },
    aiInterventionLevel: { type: String, default: "LEVEL 03 // PROACTIVE" },
  },
  { _id: false }
);

const UserProfileSchema = new Schema<IUserProfileDocument>(
  {
    userId: { type: String, index: true },
    name: { type: String, required: true, default: "Elena Vance, M.Sc." },
    username: { type: String, required: true, default: "evance_architect" },
    title: {
      type: String,
      required: true,
      default: "Senior Systems & Distributed Architect",
    },
    tier: {
      type: String,
      required: true,
      default: "TIER 04 // SCHOLAR RESEARCHER",
    },
    nodeId: { type: String, default: "#US-EAST-4409" },
    activeDays: { type: Number, default: 420 },
    avatarUrl: {
      type: String,
      default:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAAnRjH18n69GHO5tplF8WLyZcdPbN7Xf1_9nWcWN3K9nfwvHnltDi0jtmZu9dmUSe524twWOMhBJw2ZosyQHYXlJIylCH81sMOVsrsFPBTcE5gNhAUAwcL1l6LK2s4JqheS3nWUunuD-Rt-U-dimmb242PJdOZvFJw5u50GzYAZ0FZlaSZ6Z6bCgQRujHhMT2DVOaMI2VxMknWeRLAWSrxPBj1g62iGLlC0gPrJw",
    },
    manifesto: {
      type: String,
      default:
        "Engineering verifiable intuition across distributed storage topologies, consensus raft protocols, and formal AST verification under high-concurrency partitions.",
    },
    runtimeQuota: { type: String, default: "100% AUTONOMOUS" },
    proofKey: { type: String, default: "SHA-256: 8F2A...E901" },
    preferences: { type: CognitivePreferencesSchema, default: () => ({}) },
    credentials: { type: [CredentialSchema], default: [] },
    repositories: { type: [ConnectedRepoSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

const UserProfile: Model<IUserProfileDocument> =
  mongoose.models.UserProfile ||
  mongoose.model<IUserProfileDocument>("UserProfile", UserProfileSchema);

export default UserProfile;
