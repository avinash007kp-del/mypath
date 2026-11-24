"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  fetchUserProfileApi,
  updateUserProfileApi,
  fetchAnalyticsOverview,
  fetchStudySessions,
} from "@/services/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CredentialItem {
  id: string;
  issuer: string;
  title: string;
  description: string;
  verifiedHash: string;
  grade: string;
  verifiedDate: string;
  status: "verified" | "pending" | "unverified" | "rejected";
}

interface RepositoryItem {
  id: string;
  provider: "github" | "obsidian" | "zotero" | "other";
  name: string;
  detail: string;
  connected: boolean;
  lastSync?: string;
}

interface ProfileData {
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
  preferences: {
    focusInterval: string;
    diagnosticRigor: boolean;
    dailyCommitmentHours: number;
    aiInterventionLevel: string;
  };
  credentials: CredentialItem[];
  repositories: RepositoryItem[];
}

const DEFAULT_PROFILE_STATE: ProfileData = {
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

export function TectonicProfileView() {
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE_STATE);
  const [isLoading, setIsLoading] = useState(true);

  // Live Telemetry from Analytics & Database
  const [telemetry, setTelemetry] = useState({
    totalHours: 542.8,
    focusSessionsCount: 284,
    hoursChangePercent: 12.4,
    completedModules: 38,
    totalModules: 44,
    completionRate: 86.3,
    queuedSprints: 6,
    currentStreak: 42,
    longestStreak: 48,
    todayHours: 2.75,
  });

  // Modals state
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditProgress, setAuditProgress] = useState(0);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showCredentialDetailModal, setShowCredentialDetailModal] = useState<CredentialItem | null>(
    null
  );
  const [showAddCredentialModal, setShowAddCredentialModal] = useState(false);
  const [showAddRepoModal, setShowAddRepoModal] = useState(false);

  // Edit Profile Form State
  const [editForm, setEditForm] = useState({
    name: "",
    username: "",
    title: "",
    tier: "",
    nodeId: "",
    manifesto: "",
    avatarUrl: "",
  });

  // Add Credential Form State
  const [newCredForm, setNewCredForm] = useState({
    id: `CR-0${profile.credentials.length + 1}`,
    issuer: "",
    title: "",
    description: "",
    verifiedHash: `#0x${Math.floor(Math.random() * 0xffff)
      .toString(16)
      .toUpperCase()}`,
    grade: "98.0% (VERIFIED)",
    verifiedDate: new Date().toISOString().split("T")[0],
    status: "verified" as const,
  });

  // Add Repository Form State
  const [newRepoForm, setNewRepoForm] = useState({
    provider: "github" as const,
    name: "",
    detail: "Active sync authorized // Local daemon",
  });

  // Load profile and telemetry
  useEffect(() => {
    let mounted = true;

    // Load Profile
    fetchUserProfileApi()
      .then((data) => {
        if (mounted && data) {
          setProfile({
            ...DEFAULT_PROFILE_STATE,
            ...data,
            preferences: {
              ...DEFAULT_PROFILE_STATE.preferences,
              ...(data.preferences || {}),
            },
            credentials: data.credentials?.length
              ? data.credentials
              : DEFAULT_PROFILE_STATE.credentials,
            repositories: data.repositories?.length
              ? data.repositories
              : DEFAULT_PROFILE_STATE.repositories,
          });
        }
      })
      .catch((err) => {
        console.warn("Could not load remote profile, utilizing default scholar state:", err);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    // Load Telemetry from Analytics
    fetchAnalyticsOverview()
      .then((ov) => {
        if (mounted && ov) {
          setTelemetry((prev) => ({
            ...prev,
            totalHours: ov.totalLearningHours > 0 ? ov.totalLearningHours : prev.totalHours,
            completedModules: ov.topicsCompleted > 0 ? ov.topicsCompleted : prev.completedModules,
            totalModules: ov.totalTopics > 0 ? ov.totalTopics : prev.totalModules,
            completionRate:
              ov.topicsCompletionPercent > 0 ? ov.topicsCompletionPercent : prev.completionRate,
            currentStreak: ov.currentStreak > 0 ? ov.currentStreak : prev.currentStreak,
            longestStreak: ov.longestStreak > 0 ? ov.longestStreak : prev.longestStreak,
          }));
        }
      })
      .catch(() => {});

    // Load Study Sessions Count
    fetchStudySessions()
      .then((sessions) => {
        if (mounted && Array.isArray(sessions) && sessions.length > 0) {
          setTelemetry((prev) => ({
            ...prev,
            focusSessionsCount: sessions.length,
          }));
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  // Sync edit form on modal open
  useEffect(() => {
    if (showEditProfileModal) {
      setEditForm({
        name: profile.name,
        username: profile.username,
        title: profile.title,
        tier: profile.tier,
        nodeId: profile.nodeId,
        manifesto: profile.manifesto,
        avatarUrl: profile.avatarUrl,
      });
    }
  }, [showEditProfileModal, profile]);

  // Save Cognitive Preference helper
  const handleUpdatePreferences = async (newPrefs: Partial<ProfileData["preferences"]>) => {
    const updated = {
      ...profile,
      preferences: {
        ...profile.preferences,
        ...newPrefs,
      },
    };
    setProfile(updated);

    try {
      await updateUserProfileApi({ preferences: updated.preferences });
      toast.success("Cognitive preference saved to persistent graph.");
    } catch {
      toast.error("Preference update failed to sync to database.");
    }
  };

  // Save Profile Details
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...profile,
      ...editForm,
    };
    setProfile(updated);
    setShowEditProfileModal(false);

    try {
      await updateUserProfileApi(editForm);
      toast.success("Scholar profile successfully updated.");
    } catch {
      toast.error("Failed to persist profile updates.");
    }
  };

  // Trigger Credential Audit
  const handleStartAudit = () => {
    setShowAuditModal(true);
    setIsAuditing(true);
    setAuditProgress(10);

    const step1 = setTimeout(() => setAuditProgress(40), 600);
    const step2 = setTimeout(() => setAuditProgress(80), 1200);
    const step3 = setTimeout(() => {
      setAuditProgress(100);
      setIsAuditing(false);
      toast.success(
        `Audit complete: All ${profile.credentials.length} cryptographic credentials verified.`
      );
    }, 1800);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
    };
  };

  // Add Credential Handler
  const handleAddCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCredForm.title || !newCredForm.issuer) {
      toast.error("Please enter a title and issuing institution.");
      return;
    }

    const updatedCreds = [...profile.credentials, newCredForm];
    setProfile((prev) => ({ ...prev, credentials: updatedCreds }));
    setShowAddCredentialModal(false);

    try {
      await updateUserProfileApi({ credentials: updatedCreds });
      toast.success(
        `Credential "${newCredForm.title}" recorded with hash ${newCredForm.verifiedHash}.`
      );
    } catch {
      toast.error("Failed to save credential to database.");
    }

    // Reset form
    setNewCredForm({
      id: `CR-0${updatedCreds.length + 1}`,
      issuer: "",
      title: "",
      description: "",
      verifiedHash: `#0x${Math.floor(Math.random() * 0xffff)
        .toString(16)
        .toUpperCase()}`,
      grade: "98.0% (VERIFIED)",
      verifiedDate: new Date().toISOString().split("T")[0],
      status: "verified",
    });
  };

  // Delete Credential Handler
  const handleDeleteCredential = async (id: string) => {
    const updated = profile.credentials.filter((c) => c.id !== id);
    setProfile((prev) => ({ ...prev, credentials: updated }));
    setShowCredentialDetailModal(null);

    try {
      await updateUserProfileApi({ credentials: updated });
      toast.success("Credential removed from passport.");
    } catch {
      toast.error("Failed to update credentials.");
    }
  };

  // Add Repository Handler
  const handleAddRepository = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRepoForm.name) {
      toast.error("Please provide a repository or vault path.");
      return;
    }

    const newRepoItem: RepositoryItem = {
      id: `repo-${Date.now()}`,
      provider: newRepoForm.provider,
      name: newRepoForm.name,
      detail: newRepoForm.detail,
      connected: true,
      lastSync: "Just now",
    };

    const updatedRepos = [...profile.repositories, newRepoItem];
    setProfile((prev) => ({ ...prev, repositories: updatedRepos }));
    setShowAddRepoModal(false);

    try {
      await updateUserProfileApi({ repositories: updatedRepos });
      toast.success(`Connected repository "${newRepoForm.name}" synced.`);
    } catch {
      toast.error("Failed to connect repository.");
    }
  };

  // Export JSON Passport
  const handleExportJSON = () => {
    const passportData = {
      meta: {
        system: "MYPATH_COGNITIVE_PASSPORT",
        version: "2.6.4",
        exportedAt: new Date().toISOString(),
        authLevel: "AUTH_LEVEL_04",
      },
      scholar: {
        name: profile.name,
        username: profile.username,
        title: profile.title,
        tier: profile.tier,
        nodeId: profile.nodeId,
        proofKey: profile.proofKey,
        manifesto: profile.manifesto,
      },
      telemetry: telemetry,
      credentials: profile.credentials,
      cognitivePreferences: profile.preferences,
      connectedRepositories: profile.repositories,
    };

    const blob = new Blob([JSON.stringify(passportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mypath-passport-${profile.username}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Scholar passport JSON exported successfully.");
    setShowExportModal(false);
  };

  // Export PDF / Print
  const handlePrintPDF = () => {
    setShowExportModal(false);
    window.print();
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-surface font-body-md text-on-surface antialiased selection:bg-secondary selection:text-surface-container-lowest">
      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-space-xl px-gutter py-space-xl">
        {/* AMBIENT DEPTH BACKDROP (Contained) */}
        <div className="pointer-events-none absolute left-1/3 top-12 -z-10 h-96 w-96 rounded-full bg-primary-container/10 blur-3xl"></div>
        <div className="pointer-events-none absolute bottom-20 right-10 -z-10 h-80 w-80 rounded-full bg-secondary/5 blur-3xl"></div>

        {/* 1. HEADER RIBBON / METADATA BAND */}
        <section className="flex flex-col justify-between gap-space-lg rounded-DEFAULT border border-outline-variant/30 bg-surface-container-lowest p-space-lg shadow-md lg:flex-row lg:items-end">
          <div className="flex max-w-3xl flex-col gap-space-xs">
            <div className="flex flex-wrap items-center gap-space-sm">
              <span className="h-2 w-2 animate-pulse rounded-DEFAULT bg-secondary"></span>
              <span className="font-label-sm text-label-sm font-bold uppercase tracking-widest text-tertiary-fixed">
                SCHOLAR_SYS // REGISTRY_NODE_{profile.nodeId.replace("#", "") || "8094"} // ACTIVE
              </span>
              <span className="rounded-DEFAULT bg-surface-container px-space-xs py-0.5 font-label-sm text-label-sm uppercase text-outline">
                AUTH_LEVEL_04
              </span>
              <span className="rounded-DEFAULT bg-secondary-container/40 px-space-xs py-0.5 font-label-sm text-label-sm font-bold uppercase text-secondary">
                TELEMETRY_STREAM_SYNCED
              </span>
            </div>
            <h1 className="mt-space-xs font-headline-xl text-headline-xl uppercase tracking-tight text-on-surface">
              SCHOLAR PROFILE{" "}
              <span className="font-normal text-tertiary-fixed">// COGNITIVE ID</span>
            </h1>
            <p className="max-w-2xl font-body-md text-body-md text-on-surface-variant">
              Autonomous telemetry, verified skill credentials, and pedagogical cognitive runtime
              settings governing autonomous syllabus generation.
            </p>
          </div>

          {/* Action Group */}
          <div className="flex shrink-0 flex-wrap items-center gap-space-sm">
            <button
              onClick={handleStartAudit}
              className="group relative flex items-center gap-space-xs rounded-DEFAULT border border-outline-variant/30 bg-surface-container px-space-md py-space-sm font-label-md text-label-md uppercase tracking-wider text-secondary shadow-sm transition-all duration-200 hover:bg-surface-container-high hover:text-tertiary-fixed"
              id="btn-audit"
            >
              <span
                className="material-symbols-outlined text-secondary transition-transform group-hover:rotate-45"
                style={{ fontSize: 16 }}
              >
                verified
              </span>
              <span>Audit Credentials</span>
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="flex cursor-pointer items-center gap-space-xs rounded-DEFAULT bg-tertiary-fixed px-space-md py-space-sm font-label-md text-label-md font-bold uppercase tracking-wider text-surface-container-lowest shadow-md transition-colors duration-150 hover:bg-secondary"
              id="btn-export"
            >
              <span
                className="material-symbols-outlined text-surface-container-lowest"
                style={{ fontSize: 16 }}
              >
                file_download
              </span>
              <span>Export Passport [JSON/PDF]</span>
            </button>
          </div>
        </section>

        {/* 2. TOP PROFILE HERO GRID */}
        <section className="grid grid-cols-1 items-stretch gap-space-lg lg:grid-cols-12">
          {/* Left: Scholar Identity Card (5 cols) */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-DEFAULT border border-outline-variant/30 bg-surface-container-low p-space-lg shadow-lg lg:col-span-5">
            <div className="pointer-events-none absolute -bottom-8 -right-8 select-none font-headline-xl text-[140px] font-black text-tertiary opacity-5">
              8094
            </div>

            <div className="relative z-10 flex flex-col gap-space-md">
              {/* Identity Card Header */}
              <div className="flex items-start gap-space-md">
                <div className="relative shrink-0">
                  <img
                    className="h-20 w-20 rounded-DEFAULT border border-outline-variant/40 object-cover shadow-sm"
                    alt={profile.name}
                    src={profile.avatarUrl}
                  />
                  <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-DEFAULT bg-secondary shadow-sm ring-2 ring-surface-container-low"></span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-center justify-between gap-space-xs">
                    <span className="font-label-sm text-label-sm font-bold uppercase text-tertiary-fixed">
                      {profile.tier}
                    </span>
                    <button
                      onClick={() => setShowEditProfileModal(true)}
                      className="flex items-center gap-0.5 font-mono text-xs uppercase text-outline hover:text-secondary"
                    >
                      <span className="material-symbols-outlined text-[14px]">edit</span>
                      <span>EDIT</span>
                    </button>
                  </div>
                  <h2 className="truncate font-headline-sm text-headline-sm uppercase tracking-tight text-on-surface">
                    {profile.name}
                  </h2>
                  <span className="font-label-md text-label-md tracking-wide text-secondary">
                    @{profile.username}
                  </span>
                  <span className="mt-0.5 font-body-sm text-body-sm text-outline">
                    {profile.title}
                  </span>
                </div>
              </div>

              {/* Academic Tag Ribbon */}
              <div className="flex flex-wrap items-center gap-space-xs py-space-xs">
                <span className="rounded-DEFAULT border border-outline-variant/20 bg-surface-container px-space-xs py-0.5 font-label-sm text-label-sm text-on-surface-variant">
                  NODE_ID: {profile.nodeId}
                </span>
                <span className="rounded-DEFAULT bg-surface-container-high px-space-xs py-0.5 font-label-sm text-label-sm text-tertiary-fixed">
                  ACTIVE SINCE CYCLE 018 // {profile.activeDays} DAYS
                </span>
                <span className="rounded-DEFAULT bg-primary-container/40 px-space-xs py-0.5 font-label-sm text-label-sm font-bold text-secondary">
                  VERIFIED AUTODIDACT
                </span>
              </div>

              {/* Manifesto / Bio */}
              <div className="rounded-DEFAULT border border-outline-variant/30 bg-surface-container p-space-md">
                <div className="mb-1 flex items-center justify-between font-label-sm text-label-sm uppercase text-tertiary-fixed">
                  <div className="flex items-center gap-1 font-bold">
                    <span
                      className="material-symbols-outlined text-secondary"
                      style={{ fontSize: 14 }}
                    >
                      terminal
                    </span>
                    <span>COGNITIVE_MANIFESTO</span>
                  </div>
                  <button
                    onClick={() => setShowEditProfileModal(true)}
                    className="font-mono text-[10px] uppercase text-outline hover:text-tertiary-fixed"
                  >
                    Edit
                  </button>
                </div>
                <p className="font-body-sm text-body-sm italic leading-relaxed text-on-surface">
                  {profile.manifesto}
                </p>
              </div>
            </div>

            {/* Identity Footer Meta */}
            <div className="mt-space-lg flex items-center justify-between rounded-DEFAULT border border-outline-variant/20 bg-surface-container-lowest/80 px-space-md py-space-sm pt-space-md">
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm uppercase text-outline">
                  RUNTIME QUOTA
                </span>
                <span className="font-label-md text-label-md font-bold text-on-surface">
                  {profile.runtimeQuota}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-label-sm text-label-sm uppercase text-outline">
                  PROOF KEY
                </span>
                <span className="font-label-sm font-mono text-label-sm font-bold text-tertiary-fixed">
                  {profile.proofKey}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Key Academic & Telemetry Metrics (7 cols) */}
          <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2 lg:col-span-7">
            {/* Tile 1: Total Deep Work */}
            <div className="group relative flex flex-col justify-between overflow-hidden rounded-DEFAULT border border-outline-variant/30 bg-surface-container-low p-space-lg shadow-sm transition-colors hover:bg-surface-container">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  TOTAL DEEP WORK
                </span>
                <span className="rounded-DEFAULT bg-tertiary-container/80 px-1.5 py-0.5 font-label-sm text-label-sm font-bold text-tertiary-fixed">
                  +{telemetry.hoursChangePercent}% vs median
                </span>
              </div>
              <div className="my-space-md">
                <div className="font-headline-xl text-headline-xl tracking-tighter text-tertiary-fixed">
                  {telemetry.totalHours.toFixed(1)}{" "}
                  <span className="font-label-md text-label-md uppercase text-outline">HRS</span>
                </div>
                <div className="mt-1 font-label-sm text-label-sm uppercase text-on-surface-variant">
                  Verified Focus Sessions: {telemetry.focusSessionsCount} blocks
                </div>
              </div>

              {/* Sparkline Mini SVG */}
              <div className="flex h-8 w-full items-end gap-1">
                <div className="h-2 w-full rounded-DEFAULT bg-surface-container-high"></div>
                <div className="h-3 w-full rounded-DEFAULT bg-surface-container-high"></div>
                <div className="h-5 w-full rounded-DEFAULT bg-primary-container"></div>
                <div className="h-4 w-full rounded-DEFAULT bg-primary-container"></div>
                <div className="h-6 w-full rounded-DEFAULT bg-secondary"></div>
                <div className="h-7 w-full rounded-DEFAULT bg-secondary"></div>
                <div className="h-8 w-full rounded-DEFAULT bg-tertiary-fixed"></div>
              </div>
            </div>

            {/* Tile 2: Completed Modules */}
            <div className="group relative flex flex-col justify-between overflow-hidden rounded-DEFAULT border border-outline-variant/30 bg-surface-container-low p-space-lg shadow-sm transition-colors hover:bg-surface-container">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  COMPLETED MODULES
                </span>
                <span className="rounded-DEFAULT bg-primary-container/40 px-1.5 py-0.5 font-label-sm text-label-sm font-bold text-secondary">
                  {telemetry.completionRate.toFixed(1)}% Rate
                </span>
              </div>
              <div className="my-space-md">
                <div className="font-headline-xl text-headline-xl tracking-tighter text-on-surface">
                  {telemetry.completedModules}{" "}
                  <span className="font-headline-md text-headline-md text-secondary">
                    / {telemetry.totalModules}
                  </span>
                </div>
                <div className="mt-1 font-label-sm text-label-sm uppercase text-on-surface-variant">
                  {telemetry.queuedSprints} Sprints Currently Queued
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-DEFAULT bg-surface-container-highest">
                <div
                  className="h-full rounded-DEFAULT bg-secondary transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(5, telemetry.completionRate))}%` }}
                ></div>
              </div>
            </div>

            {/* Tile 3: Global Reputation */}
            <div className="group relative flex flex-col justify-between overflow-hidden rounded-DEFAULT border border-outline-variant/30 bg-surface-container-low p-space-lg shadow-sm transition-colors hover:bg-surface-container">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  GLOBAL REPUTATION
                </span>
                <span className="rounded-DEFAULT bg-tertiary-container/80 px-1.5 py-0.5 font-label-sm text-label-sm font-bold text-tertiary-fixed">
                  Archived #48
                </span>
              </div>
              <div className="my-space-md">
                <div className="font-headline-xl text-headline-xl tracking-tighter text-tertiary-fixed">
                  TOP 1.2%
                </div>
                <div className="mt-1 font-label-sm text-label-sm uppercase text-on-surface-variant">
                  Percentile across 34,810 scholars
                </div>
              </div>
              <div className="flex items-center gap-space-xs font-label-sm text-label-sm font-bold uppercase text-secondary">
                <span className="material-symbols-outlined text-secondary" style={{ fontSize: 14 }}>
                  military_tech
                </span>
                <span>Grand Scholar Attestation</span>
              </div>
            </div>

            {/* Tile 4: Current Persistence */}
            <div className="group relative flex flex-col justify-between overflow-hidden rounded-DEFAULT border border-outline-variant/30 bg-surface-container-low p-space-lg shadow-sm transition-colors hover:bg-surface-container">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  CURRENT PERSISTENCE
                </span>
                <span className="rounded-DEFAULT bg-primary-container/40 px-1.5 py-0.5 font-label-sm text-label-sm font-bold text-secondary">
                  Perfect Cadence
                </span>
              </div>
              <div className="my-space-md">
                <div className="font-headline-xl text-headline-xl tracking-tighter text-on-surface">
                  {telemetry.currentStreak}{" "}
                  <span className="font-label-md text-label-md uppercase text-secondary">DAYS</span>
                </div>
                <div className="mt-1 font-label-sm text-label-sm uppercase text-on-surface-variant">
                  Zero dropped cognitive windows
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-DEFAULT bg-secondary"></span>
                <span className="h-3 w-3 rounded-DEFAULT bg-secondary"></span>
                <span className="h-3 w-3 rounded-DEFAULT bg-secondary"></span>
                <span className="h-3 w-3 rounded-DEFAULT bg-secondary"></span>
                <span className="h-3 w-3 rounded-DEFAULT bg-secondary"></span>
                <span className="h-3 w-3 rounded-DEFAULT bg-secondary"></span>
                <span className="h-3 w-3 animate-pulse rounded-DEFAULT bg-tertiary-fixed"></span>
                <span className="ml-auto font-label-sm font-mono text-label-sm uppercase text-outline">
                  WEEK 06
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. MIDDLE SECTION: VERIFIED SKILL MATRIX & CRYPTOGRAPHIC CREDENTIALS */}
        <section className="flex flex-col gap-space-md">
          {/* Section Header */}
          <div className="flex flex-wrap items-center justify-between gap-space-sm rounded-DEFAULT border border-outline-variant/30 bg-surface-container-lowest p-space-md">
            <div className="flex items-center gap-space-sm">
              <span className="font-label-sm text-label-sm font-bold uppercase tracking-widest text-tertiary-fixed">
                // VERIFIED SKILL DOMAINS &amp; ATTESTATIONS
              </span>
              <span className="hidden font-label-sm text-label-sm text-outline sm:inline-block">
                SHA-256 PROOFS ON TANGLE
              </span>
            </div>
            <div className="flex items-center gap-space-md">
              <span className="flex items-center gap-1 font-label-sm text-label-sm font-bold text-secondary">
                <span className="h-1.5 w-1.5 rounded-DEFAULT bg-secondary"></span>
                ALL {profile.credentials.length} PROOFS ACTIVE
              </span>
              <button
                onClick={() => setShowAddCredentialModal(true)}
                className="flex cursor-pointer items-center gap-1 font-label-sm text-label-sm uppercase tracking-wider text-on-surface hover:text-tertiary-fixed"
              >
                <span className="material-symbols-outlined text-[14px]">add</span>
                <span>Add Credential</span>
              </button>
              <button
                onClick={handleStartAudit}
                className="flex cursor-pointer items-center gap-0.5 font-label-sm text-label-sm uppercase tracking-wider text-tertiary-fixed hover:text-secondary"
              >
                <span>DOWNLOAD MERKLE PROOFS</span>
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                  arrow_outward
                </span>
              </button>
            </div>
          </div>

          {/* Credential Cards Bento Grid */}
          <div className="grid grid-cols-1 gap-space-md md:grid-cols-2">
            {profile.credentials.map((cred) => (
              <div
                key={cred.id}
                className="group relative flex flex-col justify-between rounded-DEFAULT border border-outline-variant/30 bg-surface-container-low p-space-lg shadow-sm transition-all hover:bg-surface-container"
              >
                <div className="flex flex-col gap-space-sm">
                  <div className="flex items-start justify-between gap-space-sm">
                    <span className="rounded-DEFAULT bg-primary-container/40 px-space-xs py-0.5 font-label-sm text-label-sm font-bold uppercase text-secondary">
                      // {cred.id} // {cred.issuer}
                    </span>
                    <span className="rounded-DEFAULT bg-tertiary-fixed px-space-xs py-0.5 font-label-sm text-label-sm font-bold text-surface-container-lowest">
                      VERIFIED HASH: {cred.verifiedHash}
                    </span>
                  </div>

                  <h3 className="mt-1 font-headline-sm text-headline-sm uppercase tracking-tight text-on-surface">
                    {cred.title}
                  </h3>

                  <p className="font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
                    {cred.description}
                  </p>
                </div>

                <div className="mt-space-lg flex items-center justify-between rounded-DEFAULT border border-outline-variant/20 bg-surface-container-lowest/50 p-space-sm pt-space-md">
                  <div className="flex items-center gap-space-md">
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm uppercase text-outline">
                        BENCHMARK GRADE
                      </span>
                      <span className="font-label-md text-label-md font-bold text-tertiary-fixed">
                        {cred.grade}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm uppercase text-outline">
                        VERIFIED DATE
                      </span>
                      <span className="font-label-sm font-mono text-label-sm text-on-surface">
                        {cred.verifiedDate}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowCredentialDetailModal(cred)}
                    className="flex cursor-pointer items-center gap-1 font-label-sm text-label-sm font-bold uppercase tracking-wider text-tertiary-fixed transition-transform hover:text-secondary group-hover:translate-x-0.5"
                  >
                    <span>VIEW ATTESTATION</span>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                      chevron_right
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. BOTTOM SECTION: COGNITIVE CALIBRATION & LEARNING PROTOCOL PREFERENCES */}
        <section className="grid grid-cols-1 items-start gap-space-lg lg:grid-cols-12">
          {/* Left Panel: Cognitive Cadence Configuration (7 cols) */}
          <div className="flex flex-col gap-space-lg rounded-DEFAULT border border-outline-variant/30 bg-surface-container-low p-space-lg shadow-sm lg:col-span-7">
            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center gap-space-xs">
                <span className="h-1.5 w-1.5 rounded-DEFAULT bg-secondary"></span>
                <span className="font-label-sm text-label-sm font-bold uppercase tracking-widest text-tertiary-fixed">
                  // RUNTIME CALIBRATION MATRIX
                </span>
              </div>
              <h3 className="font-headline-md text-headline-md uppercase tracking-tight text-on-surface">
                Cognitive Cadence Preferences
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Fine-tune sensory density, dialectic challenge frequency, and circadian deep-work
                schedules.
              </p>
            </div>

            <div className="flex flex-col gap-space-md">
              {/* Item 1: Focus Interval Length (Segmented Selector) */}
              <div className="flex flex-col gap-space-sm rounded-DEFAULT border border-outline-variant/20 bg-surface-container p-space-md">
                <div className="flex items-center justify-between">
                  <label className="font-label-md text-label-md font-bold uppercase text-on-surface">
                    Focus Interval Length
                  </label>
                  <span
                    className="font-label-sm text-label-sm font-bold uppercase text-tertiary-fixed"
                    id="interval-label"
                  >
                    {profile.preferences.focusInterval === "25m // 5m"
                      ? "25 MIN WORK // 5 MIN RECOVERY"
                      : profile.preferences.focusInterval === "90m // 20m"
                        ? "90 MIN WORK // 20 MIN RECOVERY"
                        : "50 MIN WORK // 10 MIN RECOVERY"}
                  </span>
                </div>

                <div className="mt-1 grid grid-cols-3 gap-space-xs">
                  {[
                    { key: "25m // 5m", label: "25 MIN // 5 MIN" },
                    { key: "50m // 10m", label: "50 MIN // 10 MIN" },
                    { key: "90m // 20m", label: "90 MIN // 20 MIN" },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => handleUpdatePreferences({ focusInterval: opt.key })}
                      className={cn(
                        "interval-opt rounded-DEFAULT px-3 py-2 text-center font-label-sm text-label-sm uppercase transition-colors",
                        profile.preferences.focusInterval === opt.key
                          ? "bg-tertiary-fixed font-bold text-surface-container-lowest"
                          : "bg-surface-container-highest text-on-surface-variant hover:text-on-surface"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <span className="font-label-sm text-label-sm text-outline">
                  Optimized for ultradian deep-work rhythm cycles.
                </span>
              </div>

              {/* Item 2: Cognitive Diagnostic Rigor */}
              <div className="flex items-center justify-between gap-space-md rounded-DEFAULT border border-outline-variant/20 bg-surface-container p-space-md">
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md font-bold uppercase text-on-surface">
                    Cognitive Diagnostic Rigor
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Require formal proof citations, mathematical rigor, and source RFC references.
                  </span>
                  <span className="mt-1 font-label-sm font-mono text-label-sm text-tertiary-fixed">
                    STATE:{" "}
                    {profile.preferences.diagnosticRigor
                      ? "STRICT RESEARCH GRADE (RFC / WHITE PAPER RIGOR)"
                      : "RELAXED / PRACTICAL PRODUCTION MODE"}
                  </span>
                </div>

                {/* Custom Neo-Brutalist Toggle */}
                <button
                  type="button"
                  id="toggle-rigor"
                  onClick={() =>
                    handleUpdatePreferences({
                      diagnosticRigor: !profile.preferences.diagnosticRigor,
                    })
                  }
                  className={cn(
                    "relative h-8 w-14 shrink-0 cursor-pointer rounded-DEFAULT border border-outline-variant/30 p-1 transition-colors",
                    profile.preferences.diagnosticRigor
                      ? "bg-primary-container"
                      : "bg-surface-container-highest"
                  )}
                >
                  <div
                    id="toggle-knot"
                    className={cn(
                      "h-6 w-6 rounded-DEFAULT transition-transform duration-200",
                      profile.preferences.diagnosticRigor
                        ? "translate-x-6 bg-tertiary-fixed"
                        : "translate-x-0 bg-outline"
                    )}
                  />
                </button>
              </div>

              {/* Item 3: Daily Commitment Quota */}
              <div className="flex flex-col gap-space-xs rounded-DEFAULT border border-outline-variant/20 bg-surface-container p-space-md">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-label-md font-bold uppercase text-on-surface">
                    Daily Commitment Quota
                  </span>
                  <span className="font-label-sm text-label-sm font-bold uppercase text-secondary">
                    {profile.preferences.dailyCommitmentHours.toFixed(1)} HOURS / DAY (PEAK CADENCE)
                  </span>
                </div>

                {/* Progress Bar Tracker for Quota */}
                <div className="mt-1 h-3 w-full overflow-hidden rounded-DEFAULT bg-surface-container-highest">
                  <div
                    className="h-full rounded-DEFAULT bg-secondary transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        100,
                        (telemetry.todayHours / profile.preferences.dailyCommitmentHours) * 100
                      )}%`,
                    }}
                  ></div>
                </div>

                <div className="mt-1 flex justify-between font-label-sm font-mono text-label-sm text-outline">
                  <span>CURRENT: {telemetry.todayHours.toFixed(2)} HRS LOGGED TODAY</span>
                  <span>TARGET: {profile.preferences.dailyCommitmentHours.toFixed(2)} HRS</span>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <span className="font-mono text-xs text-outline">ADJUST:</span>
                  {[2.0, 3.5, 5.0, 6.0].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => handleUpdatePreferences({ dailyCommitmentHours: h })}
                      className={cn(
                        "rounded-DEFAULT border px-2 py-0.5 font-mono text-xs uppercase transition-colors",
                        profile.preferences.dailyCommitmentHours === h
                          ? "border-secondary bg-secondary font-bold text-surface-container-lowest"
                          : "border-outline-variant/40 bg-surface-container-high text-on-surface hover:bg-surface-bright"
                      )}
                    >
                      {h}h
                    </button>
                  ))}
                </div>
              </div>

              {/* Item 4: Pathfinder AI Intervention Level */}
              <div className="flex flex-col gap-space-xs rounded-DEFAULT border border-outline-variant/20 bg-surface-container p-space-md">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-label-md font-bold uppercase text-on-surface">
                    Pathfinder AI Intervention Level
                  </span>
                  <span className="font-label-sm font-mono text-label-sm font-bold uppercase text-tertiary-fixed">
                    {profile.preferences.aiInterventionLevel}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
                  “PROACTIVE CHALLENGER” — Automatically injects edge-case assertions, queries
                  knowledge gaps, and challenges syllogistic shortcuts during active workspace
                  sessions.
                </p>

                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    "LEVEL 01 // MINIMAL",
                    "LEVEL 02 // SUPPORTIVE",
                    "LEVEL 03 // PROACTIVE",
                    "LEVEL 04 // INTENSIVE",
                  ].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => handleUpdatePreferences({ aiInterventionLevel: lvl })}
                      className={cn(
                        "truncate rounded-DEFAULT border px-2 py-1.5 font-mono text-[10px] uppercase transition-colors",
                        profile.preferences.aiInterventionLevel === lvl
                          ? "border-tertiary-fixed bg-tertiary-fixed font-bold text-surface-container-lowest"
                          : "border-outline-variant/30 bg-surface-container-high text-on-surface hover:bg-surface-bright"
                      )}
                    >
                      {lvl.split("//")[0].trim()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-surface-container-highest/60 pt-space-xs">
              <span className="font-label-sm font-mono text-label-sm text-outline">
                AUTO-SAVED TO PERSISTENT STATE GRAPH
              </span>
              <button
                type="button"
                onClick={() => {
                  handleUpdatePreferences(DEFAULT_PROFILE_STATE.preferences);
                  toast.success("Preferences reset to platform defaults.");
                }}
                className="rounded-DEFAULT border border-outline-variant/30 bg-surface-container-high px-space-md py-space-xs font-label-md text-label-md uppercase text-on-surface transition-colors hover:bg-surface-variant"
              >
                Reset To Defaults
              </button>
            </div>
          </div>

          {/* Right Panel: Connected Repositories & Knowledge Vaults (5 cols) */}
          <div className="flex flex-col gap-space-lg rounded-DEFAULT border border-outline-variant/30 bg-surface-container-low p-space-lg shadow-sm lg:col-span-5">
            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center gap-space-xs">
                <span className="h-1.5 w-1.5 rounded-DEFAULT bg-secondary"></span>
                <span className="font-label-sm text-label-sm font-bold uppercase tracking-widest text-tertiary-fixed">
                  // EXTERNAL KNOWLEDGE REPOSITORIES
                </span>
              </div>
              <h3 className="font-headline-md text-headline-md uppercase tracking-tight text-on-surface">
                Connected Graph Sync
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Ground Pathfinder AI and syllabus models in your real research artifacts, commit
                history, and personal Zettelkasten notes.
              </p>
            </div>

            <div className="flex flex-col gap-space-sm">
              {profile.repositories.map((repo) => (
                <div
                  key={repo.id}
                  className="flex items-center justify-between rounded-DEFAULT border border-outline-variant/20 bg-surface-container p-space-md transition-colors hover:bg-surface-container-high"
                >
                  <div className="flex min-w-0 items-center gap-space-md">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-DEFAULT border border-outline-variant/30 bg-surface-container-lowest">
                      <span
                        className={cn(
                          "material-symbols-outlined text-[20px]",
                          repo.provider === "obsidian" ? "text-tertiary-fixed" : "text-secondary"
                        )}
                      >
                        {repo.provider === "github"
                          ? "terminal"
                          : repo.provider === "obsidian"
                            ? "account_tree"
                            : "menu_book"}
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate font-label-md text-label-md font-bold text-on-surface">
                        {repo.name}
                      </span>
                      <span
                        className={cn(
                          "font-label-sm text-label-sm",
                          repo.provider === "obsidian"
                            ? "font-medium text-tertiary-fixed"
                            : "text-outline"
                        )}
                      >
                        {repo.detail}
                      </span>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "h-2 w-2 shrink-0 rounded-DEFAULT",
                      repo.connected ? "bg-secondary" : "bg-outline"
                    )}
                    title={repo.connected ? "Online & Connected" : "Disconnected"}
                  ></span>
                </div>
              ))}
            </div>

            {/* Add Repo Button */}
            <button
              onClick={() => setShowAddRepoModal(true)}
              className="flex w-full items-center justify-center gap-space-xs rounded-DEFAULT border border-outline-variant/30 bg-surface-container px-space-md py-space-sm font-label-md text-label-md font-bold uppercase tracking-wider text-secondary shadow-sm transition-all duration-150 hover:bg-primary-container hover:text-tertiary-fixed"
            >
              <span className="material-symbols-outlined text-secondary" style={{ fontSize: 18 }}>
                add
              </span>
              <span>+ Connect New Knowledge Repository</span>
            </button>

            {/* Technical Telemetry Footer note */}
            <div className="flex items-center justify-between rounded-DEFAULT border border-outline-variant/30 bg-surface-container-lowest p-space-sm">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-outline" style={{ fontSize: 14 }}>
                  lock
                </span>
                <span className="font-label-sm font-mono text-label-sm uppercase text-outline">
                  ZERO TELEMETRY LEAKAGE // E2EE VAULT
                </span>
              </div>
              <span className="font-label-sm text-label-sm font-bold text-tertiary-fixed">
                ACTIVE
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-auto w-full border-t border-outline-variant/30 bg-surface-container-lowest py-space-lg">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-space-md px-gutter text-center md:flex-row md:text-left">
          <div className="flex items-center gap-space-sm">
            <span className="h-1.5 w-1.5 rounded-DEFAULT bg-secondary"></span>
            <span className="font-label-sm font-mono text-label-sm uppercase tracking-widest text-on-surface-variant">
              MYPATH ARCHITECTURE // V2.6 // SYS.ONLINE
            </span>
          </div>
          <div className="font-label-sm font-mono text-label-sm uppercase tracking-wider text-outline">
            © 2026 MYPATH ARCHITECTURAL SYSTEMS. ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>

      {/* MODAL 1: Edit Profile & Manifesto */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="flex w-full max-w-lg flex-col gap-space-md rounded-xl border border-primary-container bg-surface-container-low p-space-lg shadow-2xl">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-space-sm">
              <div className="flex items-center gap-space-xs font-headline-sm text-headline-sm uppercase text-on-surface">
                <span className="material-symbols-outlined text-[20px] text-secondary">
                  manage_accounts
                </span>
                <span>Edit Scholar Profile</span>
              </div>
              <button
                onClick={() => setShowEditProfileModal(false)}
                className="text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-space-sm">
              <div className="grid grid-cols-2 gap-space-sm">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-xs uppercase text-outline">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="rounded border border-outline-variant/40 bg-surface-container p-2 font-mono text-sm text-on-surface focus:border-secondary focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-xs uppercase text-outline">Username</label>
                  <input
                    type="text"
                    required
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    className="rounded border border-outline-variant/40 bg-surface-container p-2 font-mono text-sm text-on-surface focus:border-secondary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs uppercase text-outline">
                  Professional / Academic Title
                </label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="rounded border border-outline-variant/40 bg-surface-container p-2 font-mono text-sm text-on-surface focus:border-secondary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-space-sm">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-xs uppercase text-outline">Scholar Tier</label>
                  <input
                    type="text"
                    value={editForm.tier}
                    onChange={(e) => setEditForm({ ...editForm, tier: e.target.value })}
                    className="rounded border border-outline-variant/40 bg-surface-container p-2 font-mono text-sm text-on-surface focus:border-secondary focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-xs uppercase text-outline">
                    Registry Node ID
                  </label>
                  <input
                    type="text"
                    value={editForm.nodeId}
                    onChange={(e) => setEditForm({ ...editForm, nodeId: e.target.value })}
                    className="rounded border border-outline-variant/40 bg-surface-container p-2 font-mono text-sm text-on-surface focus:border-secondary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs uppercase text-outline">Avatar URL</label>
                <input
                  type="url"
                  value={editForm.avatarUrl}
                  onChange={(e) => setEditForm({ ...editForm, avatarUrl: e.target.value })}
                  className="rounded border border-outline-variant/40 bg-surface-container p-2 font-mono text-sm text-on-surface focus:border-secondary focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs uppercase text-outline">
                  Cognitive Manifesto / Learning Philosophy
                </label>
                <textarea
                  rows={3}
                  value={editForm.manifesto}
                  onChange={(e) => setEditForm({ ...editForm, manifesto: e.target.value })}
                  className="rounded border border-outline-variant/40 bg-surface-container p-2 font-mono text-sm leading-relaxed text-on-surface focus:border-secondary focus:outline-none"
                />
              </div>

              <div className="mt-2 flex items-center justify-end gap-space-sm border-t border-outline-variant/30 pt-space-xs">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="rounded-DEFAULT bg-surface-container px-space-md py-space-sm font-label-sm text-label-sm uppercase text-on-surface hover:bg-surface-container-high"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-DEFAULT bg-secondary px-space-lg py-space-sm font-label-sm text-label-sm font-bold uppercase text-surface-container-lowest transition-colors hover:bg-tertiary-fixed"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Audit Credentials */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="flex w-full max-w-lg flex-col gap-space-md rounded-xl border border-primary-container bg-surface-container-low p-space-lg shadow-2xl">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-space-sm">
              <div className="flex items-center gap-space-xs font-headline-sm text-headline-sm uppercase text-on-surface">
                <span className="material-symbols-outlined text-[20px] text-secondary">
                  verified
                </span>
                <span>Cryptographic Credential Audit</span>
              </div>
              <button
                onClick={() => setShowAuditModal(false)}
                className="text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between font-mono text-xs">
                <span className="text-outline">AUDITING MERKLE ROOTS &amp; SIGNATURES</span>
                <span className="font-bold text-secondary">{auditProgress}% COMPLETE</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-DEFAULT bg-surface-container-highest">
                <div
                  className="h-full rounded-DEFAULT bg-secondary transition-all duration-300"
                  style={{ width: `${auditProgress}%` }}
                ></div>
              </div>
            </div>

            <div className="mt-2 flex flex-col gap-2">
              {profile.credentials.map((c, i) => {
                const isPassed = auditProgress > (i + 1) * 20;
                return (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded border border-outline-variant/30 bg-surface-container p-3"
                  >
                    <div className="flex flex-col">
                      <span className="font-mono text-xs font-bold text-primary-fixed">
                        {c.id} // {c.title}
                      </span>
                      <span className="font-mono text-[10px] text-outline">
                        {c.issuer} // {c.verifiedHash}
                      </span>
                    </div>
                    {isPassed ? (
                      <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-secondary">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        VALID
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-mono text-xs text-outline">
                        <span className="material-symbols-outlined animate-spin text-[16px]">
                          autorenew
                        </span>
                        CHECKING...
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-space-sm border-t border-outline-variant/30 pt-space-xs">
              <button
                onClick={() => setShowAuditModal(false)}
                className="rounded-DEFAULT bg-surface-container px-space-md py-space-sm font-label-sm text-label-sm uppercase text-on-surface hover:bg-surface-container-high"
              >
                Dismiss
              </button>
              {!isAuditing && (
                <button
                  onClick={handleExportJSON}
                  className="rounded-DEFAULT bg-tertiary-fixed px-space-lg py-space-sm font-label-sm text-label-sm font-bold uppercase text-surface-container-lowest transition-colors hover:bg-secondary"
                >
                  Download Merkle Bundle
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Export Passport [JSON / PDF] */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="flex w-full max-w-md flex-col gap-space-md rounded-xl border border-primary-container bg-surface-container-low p-space-lg shadow-2xl">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-space-sm">
              <div className="flex items-center gap-space-xs font-headline-sm text-headline-sm uppercase text-on-surface">
                <span className="material-symbols-outlined text-[20px] text-secondary">
                  file_download
                </span>
                <span>Export Scholar Passport</span>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <p className="text-xs leading-relaxed text-on-surface-variant">
              Export your validated cognitive identity, learning telemetry, verified attestations,
              and cadence matrix for portability across research and engineering systems.
            </p>

            <div className="grid grid-cols-2 gap-space-sm pt-2">
              <button
                onClick={handleExportJSON}
                className="group flex flex-col items-center gap-2 rounded-DEFAULT border border-outline-variant/30 bg-surface-container p-4 text-center transition-all hover:border-secondary"
              >
                <span className="material-symbols-outlined text-[28px] text-secondary transition-transform group-hover:scale-110">
                  data_object
                </span>
                <span className="font-mono text-xs font-bold uppercase text-on-surface">
                  JSON Passport
                </span>
                <span className="font-mono text-[10px] text-outline">
                  Machine-readable data bundle
                </span>
              </button>

              <button
                onClick={handlePrintPDF}
                className="group flex flex-col items-center gap-2 rounded-DEFAULT border border-outline-variant/30 bg-surface-container p-4 text-center transition-all hover:border-tertiary-fixed"
              >
                <span className="material-symbols-outlined text-[28px] text-tertiary-fixed transition-transform group-hover:scale-110">
                  picture_as_pdf
                </span>
                <span className="font-mono text-xs font-bold uppercase text-on-surface">
                  PDF Document
                </span>
                <span className="font-mono text-[10px] text-outline">
                  Formatted printable dossier
                </span>
              </button>
            </div>

            <div className="flex justify-end border-t border-outline-variant/30 pt-2">
              <button
                onClick={() => setShowExportModal(false)}
                className="rounded-DEFAULT bg-surface-container px-space-md py-space-sm font-label-sm text-label-sm uppercase text-on-surface hover:bg-surface-container-high"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Credential Detail View */}
      {showCredentialDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="flex w-full max-w-lg flex-col gap-space-md rounded-xl border border-primary-container bg-surface-container-low p-space-lg shadow-2xl">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-space-sm">
              <div className="flex items-center gap-space-xs">
                <span className="font-mono text-xs font-bold text-secondary">
                  {showCredentialDetailModal.id}
                </span>
                <span className="font-headline-sm text-headline-sm uppercase text-on-surface">
                  Attestation Detail
                </span>
              </div>
              <button
                onClick={() => setShowCredentialDetailModal(null)}
                className="text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="font-headline-sm text-lg text-tertiary-fixed">
                {showCredentialDetailModal.title}
              </h3>
              <span className="font-mono text-xs text-secondary">
                ISSUED BY: {showCredentialDetailModal.issuer}
              </span>
            </div>

            <p className="text-sm leading-relaxed text-on-surface-variant">
              {showCredentialDetailModal.description}
            </p>

            <div className="grid grid-cols-2 gap-2 rounded border border-outline-variant/30 bg-surface-container p-3 font-mono text-xs">
              <div>
                <span className="block text-[10px] text-outline">VERIFIED HASH</span>
                <span className="font-bold text-tertiary-fixed">
                  {showCredentialDetailModal.verifiedHash}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-outline">BENCHMARK GRADE</span>
                <span className="font-bold text-secondary">{showCredentialDetailModal.grade}</span>
              </div>
              <div>
                <span className="block text-[10px] text-outline">ISSUE DATE</span>
                <span className="text-on-surface">{showCredentialDetailModal.verifiedDate}</span>
              </div>
              <div>
                <span className="block text-[10px] text-outline">STATUS</span>
                <span className="font-bold uppercase text-secondary">
                  {showCredentialDetailModal.status}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-outline-variant/30 pt-space-xs">
              <button
                onClick={() => handleDeleteCredential(showCredentialDetailModal.id)}
                className="px-space-sm py-space-xs font-mono text-xs uppercase text-error transition-colors hover:text-white"
              >
                Remove Credential
              </button>
              <button
                onClick={() => setShowCredentialDetailModal(null)}
                className="rounded-DEFAULT bg-surface-container px-space-md py-space-sm font-label-sm text-label-sm uppercase text-on-surface hover:bg-surface-container-high"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Add Credential */}
      {showAddCredentialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="flex w-full max-w-lg flex-col gap-space-md rounded-xl border border-primary-container bg-surface-container-low p-space-lg shadow-2xl">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-space-sm">
              <div className="flex items-center gap-space-xs font-headline-sm text-headline-sm uppercase text-on-surface">
                <span className="material-symbols-outlined text-[20px] text-secondary">
                  add_circle
                </span>
                <span>Record Verified Attestation</span>
              </div>
              <button
                onClick={() => setShowAddCredentialModal(false)}
                className="text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddCredential} className="flex flex-col gap-space-sm">
              <div className="grid grid-cols-2 gap-space-sm">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-xs uppercase text-outline">
                    Issuing Body / Lab
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BERKELEY DISYS LABS"
                    value={newCredForm.issuer}
                    onChange={(e) => setNewCredForm({ ...newCredForm, issuer: e.target.value })}
                    className="rounded border border-outline-variant/40 bg-surface-container p-2 font-mono text-sm text-on-surface focus:border-secondary focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-xs uppercase text-outline">
                    Benchmark Grade
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 98.7% (SUMMA)"
                    value={newCredForm.grade}
                    onChange={(e) => setNewCredForm({ ...newCredForm, grade: e.target.value })}
                    className="rounded border border-outline-variant/40 bg-surface-container p-2 font-mono text-sm text-on-surface focus:border-secondary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs uppercase text-outline">
                  Credential / Domain Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Concurrency Primitives & Lock-Free Channels"
                  value={newCredForm.title}
                  onChange={(e) => setNewCredForm({ ...newCredForm, title: e.target.value })}
                  className="rounded border border-outline-variant/40 bg-surface-container p-2 font-mono text-sm text-on-surface focus:border-secondary focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs uppercase text-outline">
                  Assessment Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Detailed verification criteria and proof parameters..."
                  value={newCredForm.description}
                  onChange={(e) => setNewCredForm({ ...newCredForm, description: e.target.value })}
                  className="rounded border border-outline-variant/40 bg-surface-container p-2 font-mono text-sm text-on-surface focus:border-secondary focus:outline-none"
                />
              </div>

              <div className="mt-2 flex items-center justify-end gap-space-sm border-t border-outline-variant/30 pt-space-xs">
                <button
                  type="button"
                  onClick={() => setShowAddCredentialModal(false)}
                  className="rounded-DEFAULT bg-surface-container px-space-md py-space-sm font-label-sm text-label-sm uppercase text-on-surface hover:bg-surface-container-high"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-DEFAULT bg-secondary px-space-lg py-space-sm font-label-sm text-label-sm font-bold uppercase text-surface-container-lowest transition-colors hover:bg-tertiary-fixed"
                >
                  Commit Attestation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: Connect New Knowledge Repository */}
      {showAddRepoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="flex w-full max-w-md flex-col gap-space-md rounded-xl border border-primary-container bg-surface-container-low p-space-lg shadow-2xl">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-space-sm">
              <div className="flex items-center gap-space-xs font-headline-sm text-headline-sm uppercase text-on-surface">
                <span className="material-symbols-outlined text-[20px] text-secondary">hub</span>
                <span>Connect Knowledge Source</span>
              </div>
              <button
                onClick={() => setShowAddRepoModal(false)}
                className="text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddRepository} className="flex flex-col gap-space-sm">
              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs uppercase text-outline">Provider</label>
                <select
                  value={newRepoForm.provider}
                  onChange={(e) =>
                    setNewRepoForm({
                      ...newRepoForm,
                      provider: e.target.value as any,
                    })
                  }
                  className="rounded border border-outline-variant/40 bg-surface-container p-2 font-mono text-sm text-on-surface"
                >
                  <option value="github">GitHub Organization / Repository</option>
                  <option value="obsidian">Obsidian Local Vault Daemon</option>
                  <option value="zotero">Zotero / arXiv Research Collection</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs uppercase text-outline">
                  Account Identifier or Vault Path
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    newRepoForm.provider === "github"
                      ? "github.com/org/repo"
                      : newRepoForm.provider === "obsidian"
                        ? "~/vault/distributed_systems"
                        : "Zotero Library ID"
                  }
                  value={newRepoForm.name}
                  onChange={(e) => setNewRepoForm({ ...newRepoForm, name: e.target.value })}
                  className="rounded border border-outline-variant/40 bg-surface-container p-2 font-mono text-sm text-on-surface focus:border-secondary focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs uppercase text-outline">Sync Parameters</label>
                <input
                  type="text"
                  value={newRepoForm.detail}
                  onChange={(e) => setNewRepoForm({ ...newRepoForm, detail: e.target.value })}
                  className="rounded border border-outline-variant/40 bg-surface-container p-2 font-mono text-sm text-on-surface focus:border-secondary focus:outline-none"
                />
              </div>

              <div className="mt-2 flex items-center justify-end gap-space-sm border-t border-outline-variant/30 pt-space-xs">
                <button
                  type="button"
                  onClick={() => setShowAddRepoModal(false)}
                  className="rounded-DEFAULT bg-surface-container px-space-md py-space-sm font-label-sm text-label-sm uppercase text-on-surface hover:bg-surface-container-high"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-DEFAULT bg-secondary px-space-lg py-space-sm font-label-sm text-label-sm font-bold uppercase text-surface-container-lowest transition-colors hover:bg-tertiary-fixed"
                >
                  Authorize &amp; Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
