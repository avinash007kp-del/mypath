import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import UserProfile from "@/models/UserProfile";
import { successResponse, handleApiError } from "@/lib/api-response";

const DEFAULT_PROFILE = {
  name: "Elena Vance, M.Sc.",
  username: "evance_architect",
  title: "Senior Systems & Distributed Architect",
  tier: "TIER 04 // SCHOLAR RESEARCHER",
  nodeId: "#US-EAST-4409",
  activeDays: 420,
  avatarUrl:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAAnRjH18n69GHO5tplF8WLyZcdPbN7Xf1_9nWcWN3K9nfwvHnltDi0jtmZu9dmUSe524twWOMhBJw2ZosyQHYXlJIylCH81sMOVsrsFPBTcE5gNhAUAwcL1l6LK2s4JqheS3nWUunuD-Rt-U-dimmb242PJdOZvFJw5u50GzYAZ0FZlaSZ6Z6bCgQRujHhMT2DVOaMI2VxMknWeRLAWSrxPBj1g62iGLlC0gPrJw",
  manifesto:
    "“Engineering verifiable intuition across distributed storage topologies, consensus raft protocols, and formal AST verification under high-concurrency partitions.”",
  runtimeQuota: "100% AUTONOMOUS",
  proofKey: "SHA-256: 8F2A...E901",
  preferences: {
    focusInterval: "50m // 10m",
    diagnosticRigor: true,
    dailyCommitmentHours: 3.5,
    aiInterventionLevel: "LEVEL 03 // PROACTIVE",
  },
  credentials: [
    {
      id: "CR-01",
      issuer: "MIT CSAIL LABS",
      title: "Distributed Consensus & Raft Topology",
      description:
        "Verified by MIT CSAIL Labs Open Assessment. Formal safety proof analysis under non-byzantine split-brain network partitions.",
      verifiedHash: "#0x8F92",
      grade: "98.4% (SUMMA)",
      verifiedDate: "2024-03-12",
      status: "verified",
    },
    {
      id: "CR-02",
      issuer: "STANFORD DB LABS",
      title: "PostgreSQL Query Optimization & Index Internals",
      description:
        "Stanford DB Benchmark. Deep verification of GiST/GIN tree indexing, planner cost coefficient tuning, and lock-free MVCC concurrency.",
      verifiedHash: "#0x4A11",
      grade: "99.1% (ELITE)",
      verifiedDate: "2024-01-28",
      status: "verified",
    },
    {
      id: "CR-03",
      issuer: "ENGINE SPEC LABS",
      title: "TypeScript Soundness & Type-Level AST",
      description:
        "Turing-complete compile-time type verification, custom nominal subtyping compilers, and strict recursive AST parsing routines.",
      verifiedHash: "#0x9C33",
      grade: "96.8% (CERT)",
      verifiedDate: "2023-11-04",
      status: "verified",
    },
    {
      id: "CR-04",
      issuer: "MYPATH CORE SPEC",
      title: "Autonomous Vector Pipelines & LLM Architecture",
      description:
        "MyPath Core Diagnostic. High-dimensional vector indexing (HNSW graph construction), quantized cache topologies, and multi-agent consensus.",
      verifiedHash: "#0x2E7B",
      grade: "100% (PERFECT)",
      verifiedDate: "2024-02-19",
      status: "verified",
    },
  ],
  repositories: [
    {
      id: "repo-gh",
      provider: "github",
      name: "github.com/evance-systems",
      detail: "Synced 14m ago // 48 active branches",
      connected: true,
      lastSync: "14m ago",
    },
    {
      id: "repo-obs",
      provider: "obsidian",
      name: "~/vault/distributed_systems",
      detail: "1,840 nodes linked // Local daemon",
      connected: true,
      lastSync: "Real-time daemon",
    },
    {
      id: "repo-zot",
      provider: "zotero",
      name: "Zotero / arXiv Library",
      detail: "Active sync (324 papers indexed)",
      connected: true,
      lastSync: "1 hour ago",
    },
  ],
};

export async function GET() {
  try {
    await connectToDatabase();
    let profileDoc = await UserProfile.findOne();

    if (!profileDoc) {
      profileDoc = await UserProfile.create(DEFAULT_PROFILE);
    }

    const profileData = profileDoc.toObject ? profileDoc.toObject() : profileDoc;
    return successResponse(profileData, 200, "Scholar profile retrieved");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    let profile = await UserProfile.findOne();
    if (!profile) {
      profile = await UserProfile.create({ ...DEFAULT_PROFILE, ...body });
    } else {
      Object.assign(profile, body);
      await profile.save();
    }

    return successResponse(profile, 200, "Scholar profile updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
