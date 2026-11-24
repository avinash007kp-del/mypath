"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { fetchRoadmaps, fetchNotes, createNoteApi, updateTopicProgressApi } from "@/services/api";
import { IRoadmap, ILearningNote } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SubTopic {
  id: string;
  title: string;
  statusText: string;
  isCompleted: boolean;
  isCurrent?: boolean;
  isQueued?: boolean;
}

interface RoadmapModule {
  id: string;
  indexNumber: string;
  category: string;
  title: string;
  description: string;
  status: "completed" | "active" | "locked";
  completionPercentage: number;
  totalTopics: number;
  remainingHours?: number;
  prerequisite?: string;
  subtopics: SubTopic[];
  resources?: {
    type: string;
    title: string;
    meta: string;
    url: string;
  }[];
}

const DEFAULT_MODULES: RoadmapModule[] = [
  {
    id: "mod-01",
    indexNumber: "// 01.00",
    category: "CORE RUNTIME",
    title: "Web Foundations & DOM Internals",
    description:
      "Layout calculation pipelines, V8 execution graphs, repaint/reflow profiling, and progressive hydration.",
    status: "completed",
    completionPercentage: 100,
    totalTopics: 14,
    subtopics: [
      {
        id: "m1-t1",
        title: "Layout Calculation Pipelines & Reflow Profiling",
        statusText: "VERIFIED",
        isCompleted: true,
      },
      {
        id: "m1-t2",
        title: "V8 Execution Graphs & Memory Compaction",
        statusText: "VERIFIED",
        isCompleted: true,
      },
      {
        id: "m1-t3",
        title: "Progressive Hydration & Island Architectures",
        statusText: "VERIFIED",
        isCompleted: true,
      },
    ],
  },
  {
    id: "mod-02",
    indexNumber: "// 02.00",
    category: "TYPE VERIFICATION",
    title: "TypeScript & Type System Soundness",
    description:
      "Conditional types, distributive conditional mappings, template literal inference, and AST type checking.",
    status: "completed",
    completionPercentage: 100,
    totalTopics: 12,
    subtopics: [
      {
        id: "m2-t1",
        title: "Generics, Conditional Types & Distributive Mappings",
        statusText: "VERIFIED",
        isCompleted: true,
      },
      {
        id: "m2-t2",
        title: "Template Literal Inference & Recursive Types",
        statusText: "VERIFIED",
        isCompleted: true,
      },
      {
        id: "m2-t3",
        title: "AST Type Checking & Compiler Transformations",
        statusText: "VERIFIED",
        isCompleted: true,
      },
    ],
  },
  {
    id: "mod-03",
    indexNumber: "// 03.00",
    category: "CLIENT PATTERNS",
    title: "Frontend Systems & State Machines",
    description:
      "Deterministic finite state automata, decoupled store selectors, microfrontends, and client edge routing.",
    status: "completed",
    completionPercentage: 100,
    totalTopics: 16,
    subtopics: [
      {
        id: "m3-t1",
        title: "Finite State Automata & XState Patterns",
        statusText: "VERIFIED",
        isCompleted: true,
      },
      {
        id: "m3-t2",
        title: "Decoupled Store Selectors & Atomic Primitives",
        statusText: "VERIFIED",
        isCompleted: true,
      },
      {
        id: "m3-t3",
        title: "Microfrontends & Client Edge Routing",
        statusText: "VERIFIED",
        isCompleted: true,
      },
    ],
  },
  {
    id: "mod-04",
    indexNumber: "// 04.00 ARCHITECTURAL CORE",
    category: "ACTIVE MILESTONE",
    title: "Backend Development & REST APIs",
    description:
      "Architecting resilient microservices, stateless transport mechanisms, standardized payload schemas, and zero-trust perimeter security.",
    status: "active",
    completionPercentage: 60,
    totalTopics: 5,
    remainingHours: 18,
    subtopics: [
      {
        id: "m4-t1",
        title: "HTTP/2 & HTTP/3 Protocol Mechanics",
        statusText: "VERIFIED",
        isCompleted: true,
      },
      {
        id: "m4-t2",
        title: "RESTful Resource Design & Status Mapping",
        statusText: "VERIFIED",
        isCompleted: true,
      },
      {
        id: "m4-t3",
        title: "API Versioning & OpenAPI 3.1 Spec",
        statusText: "CURRENT TOPIC",
        isCompleted: false,
        isCurrent: true,
      },
      {
        id: "m4-t4",
        title: "JWT, OAuth2 & Cookie Security Best Practices",
        statusText: "NEXT UP",
        isCompleted: false,
      },
      {
        id: "m4-t5",
        title: "Rate Limiting, Redis Caching & In-Memory Queues",
        statusText: "QUEUED",
        isCompleted: false,
        isQueued: true,
      },
    ],
    resources: [
      {
        type: "IETF SPEC",
        title: "RFC 9110 HTTP Semantics",
        meta: "8 MIN READ // REF_DOC",
        url: "https://www.rfc-editor.org/rfc/rfc9110",
      },
      {
        type: "BLUEPRINT",
        title: "System Design Primer: REST",
        meta: "ARCH_DIAGRAM // GITHUB",
        url: "https://github.com/donnemartin/system-design-primer",
      },
      {
        type: "PDF MONOGRAPH",
        title: "Pragmatic API Architecture",
        meta: "TECHNICAL WHITE PAPER",
        url: "#",
      },
    ],
  },
  {
    id: "mod-05",
    indexNumber: "// 05.00",
    category: "PERSISTENCE LAYER",
    title: "Database Modeling & Query Optimization",
    description:
      "B-Tree indices, transaction isolation levels (ACID), schema migration pipelines, WAL analysis, and query execution plans.",
    status: "locked",
    completionPercentage: 0,
    totalTopics: 18,
    prerequisite: "MOD 04",
    subtopics: [
      {
        id: "m5-t1",
        title: "B-Tree Indices & Execution Plan Analysis",
        statusText: "LOCKED",
        isCompleted: false,
      },
      {
        id: "m5-t2",
        title: "Transaction Isolation Levels (ACID) & MVCC",
        statusText: "LOCKED",
        isCompleted: false,
      },
      {
        id: "m5-t3",
        title: "Schema Migration Pipelines & WAL Streaming",
        statusText: "LOCKED",
        isCompleted: false,
      },
    ],
  },
  {
    id: "mod-06",
    indexNumber: "// 06.00",
    category: "INFRASTRUCTURE",
    title: "DevOps, CI/CD & Kubernetes Deployment",
    description:
      "Container runtimes, OCI compliance, Pod lifecycle hooks, ingress controllers, ArgoCD gitops, and cluster autoscaling.",
    status: "locked",
    completionPercentage: 0,
    totalTopics: 22,
    prerequisite: "MOD 05",
    subtopics: [
      {
        id: "m6-t1",
        title: "Container Runtimes & OCI Compliance",
        statusText: "LOCKED",
        isCompleted: false,
      },
      {
        id: "m6-t2",
        title: "Pod Lifecycle Hooks & Ingress Controllers",
        statusText: "LOCKED",
        isCompleted: false,
      },
      {
        id: "m6-t3",
        title: "ArgoCD GitOps & Cluster Horizontal Pod Autoscaling",
        statusText: "LOCKED",
        isCompleted: false,
      },
    ],
  },
];

interface TectonicRoadmapViewProps {
  initialRoadmapId?: string;
}

export function TectonicRoadmapView({ initialRoadmapId }: TectonicRoadmapViewProps) {
  // Modules and timeline state
  const [modules, setModules] = useState<RoadmapModule[]>(DEFAULT_MODULES);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    "mod-04": true,
  });
  const [allExpanded, setAllExpanded] = useState(false);
  const [topicSubmitted, setTopicSubmitted] = useState(false);

  // Roadmaps list & active track selection
  const [roadmaps, setRoadmaps] = useState<IRoadmap[]>([]);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string>(initialRoadmapId || "");

  // Notes state
  const [notes, setNotes] = useState<ILearningNote[]>([]);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // Dynamic calculated metrics
  const activeModule = modules.find((m) => m.id === "mod-04");
  const completedTopicsInActiveMod =
    activeModule?.subtopics.filter((t) => t.isCompleted).length || 0;
  const totalTopicsInActiveMod = activeModule?.subtopics.length || 5;

  // Calculate overall metrics
  const overallCompletionPercentage = 68;
  const totalMasteredTopics = 42;
  const totalBacklogTopics = 62;

  // Load roadmaps from database
  useEffect(() => {
    fetchRoadmaps()
      .then((data) => {
        setRoadmaps(data);
        if (!selectedRoadmapId && data.length > 0) {
          const fsd = data.find(
            (r) =>
              r.title.toLowerCase().includes("full-stack") ||
              r.title.toLowerCase().includes("full stack")
          );
          if (fsd) setSelectedRoadmapId(fsd._id);
          else setSelectedRoadmapId(data[0]._id);
        }
      })
      .catch((err) => console.error("Error loading roadmaps:", err));

    fetchNotes()
      .then((data) => setNotes(data))
      .catch((err) => console.error("Error loading notes:", err));
  }, [selectedRoadmapId]);

  // Toggle single module accordion
  const toggleModule = (modId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  // Toggle all modules
  const handleToggleAll = () => {
    const nextState = !allExpanded;
    setAllExpanded(nextState);
    const updated: Record<string, boolean> = {};
    modules.forEach((m) => {
      updated[m.id] = nextState;
    });
    setExpandedModules(updated);
  };

  // Toggle specific subtopic completion
  const handleToggleSubtopic = async (modId: string, topicId: string) => {
    setModules((prev) =>
      prev.map((mod) => {
        if (mod.id !== modId) return mod;
        const updatedSubtopics = mod.subtopics.map((t) => {
          if (t.id === topicId) {
            const nextCompleted = !t.isCompleted;
            return {
              ...t,
              isCompleted: nextCompleted,
              statusText: nextCompleted
                ? "VERIFIED"
                : t.isCurrent
                  ? "CURRENT TOPIC"
                  : t.isQueued
                    ? "QUEUED"
                    : "NEXT UP",
            };
          }
          return t;
        });

        const completedCount = updatedSubtopics.filter((t) => t.isCompleted).length;
        const newPct = Math.round((completedCount / updatedSubtopics.length) * 100);

        return {
          ...mod,
          subtopics: updatedSubtopics,
          completionPercentage: newPct,
        };
      })
    );

    // Call API if roadmapId exists
    if (selectedRoadmapId) {
      try {
        await updateTopicProgressApi({
          roadmapId: selectedRoadmapId,
          nodeId: topicId,
          status: "completed",
          progressPercentage: 100,
        });
      } catch (err) {
        console.warn("Could not sync to progress API:", err);
      }
    }

    toast.success("Topic specification updated.");
  };

  // Mark current topic complete from active module primary button
  const handleMarkCurrentComplete = async () => {
    setTopicSubmitted(true);
    setModules((prev) =>
      prev.map((mod) => {
        if (mod.id !== "mod-04") return mod;
        const updatedSubtopics = mod.subtopics.map((t) => {
          if (t.id === "m4-t3") {
            return {
              ...t,
              isCompleted: true,
              isCurrent: false,
              statusText: "VERIFIED",
            };
          }
          if (t.id === "m4-t4") {
            return {
              ...t,
              isCurrent: true,
              statusText: "CURRENT TOPIC",
            };
          }
          return t;
        });

        const completedCount = updatedSubtopics.filter((t) => t.isCompleted).length;
        const newPct = Math.round((completedCount / updatedSubtopics.length) * 100);

        return {
          ...mod,
          subtopics: updatedSubtopics,
          completionPercentage: newPct,
          remainingHours: Math.max(0, (mod.remainingHours || 18) - 4),
        };
      })
    );

    if (selectedRoadmapId) {
      try {
        await updateTopicProgressApi({
          roadmapId: selectedRoadmapId,
          nodeId: "m4-t3",
          status: "completed",
          progressPercentage: 100,
        });
      } catch (err) {
        console.warn("Could not sync to progress API:", err);
      }
    }

    toast.success("Topic verified and committed to curriculum state.");
  };

  // Create Note
  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;

    setIsSubmittingNote(true);
    try {
      const newNote = await createNoteApi({
        title: noteTitle,
        content: noteContent || "Note added during Module 04 architecture review.",
        roadmapId: selectedRoadmapId || undefined,
        nodeId: "mod-04",
        tags: ["Architecture", "REST-APIs"],
      });
      setNotes((prev) => [newNote, ...prev]);
      setNoteTitle("");
      setNoteContent("");
      setShowNoteModal(false);
      toast.success("Scholar note saved to knowledge base.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save note";
      toast.error(msg);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  // Actions in HUD
  const handleExportPdf = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleExportSvg = () => {
    const svgData = `
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="#131413"/>
  <text x="40" y="60" fill="#e4e2e0" font-family="monospace" font-size="20">MYPATH // FULL STACK DEVELOPMENT</text>
  <line x1="60" y1="100" x2="60" y2="520" stroke="#1e5128" stroke-width="4"/>
  <line x1="60" y1="100" x2="60" y2="350" stroke="#86db70" stroke-width="4"/>
  <circle cx="60" cy="120" r="12" fill="#86db70"/>
  <text x="90" y="125" fill="#e4e2e0" font-family="monospace" font-size="14">01. Web Foundations</text>
  <circle cx="60" cy="220" r="12" fill="#86db70"/>
  <text x="90" y="225" fill="#e4e2e0" font-family="monospace" font-size="14">02. TypeScript &amp; Types</text>
  <circle cx="60" cy="320" r="12" fill="#86db70"/>
  <text x="90" y="325" fill="#e4e2e0" font-family="monospace" font-size="14">03. Frontend Systems</text>
  <circle cx="60" cy="420" r="14" fill="#d9eaa9"/>
  <text x="90" y="425" fill="#d9eaa9" font-family="monospace" font-size="14" font-weight="bold">04. Backend Development &amp; REST APIs (ACTIVE)</text>
  <circle cx="60" cy="520" r="10" fill="#292a29"/>
  <text x="90" y="525" fill="#8b9388" font-family="monospace" font-size="14">05. Database Modeling (LOCKED)</text>
</svg>`.trim();

    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mypath-fullstack-architecture.svg";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Vector Graph (.SVG) exported.");
  };

  const handleShareUrl = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Scholar Track URL / UUID copied to clipboard.");
    }
  };

  return (
    <div className="flex w-full flex-col">
      {/* Top Global Grid Boundary Container */}
      <div className="mx-auto w-full max-w-7xl px-gutter pb-space-xl">
        {/* TRACK IDENTITY HEADER */}
        <header className="flex flex-col gap-space-sm pb-space-lg pt-space-md">
          <div className="flex flex-wrap items-center justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm rounded-DEFAULT bg-surface-container-high px-space-sm py-1">
              <span className="h-2 w-2 rounded-DEFAULT bg-secondary"></span>
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-tertiary-fixed">
                SYSTEM ARCHITECTURE TRACK // CODE: FSD-2026
              </span>
            </div>
            <div className="flex items-center gap-space-xs bg-surface-container px-space-sm py-1 font-label-sm text-label-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-sm text-primary">terminal</span>
              <span>REVISION: 4.8.1-PROD</span>
              <span className="mx-1 text-outline">/</span>
              <span className="text-secondary">ACTIVE SESSION</span>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-space-md pt-space-xs lg:flex-row lg:items-end">
            <div className="max-w-4xl">
              <h1 className="font-headline-xl text-headline-xl uppercase tracking-tighter text-on-surface">
                FULL STACK DEVELOPMENT
              </h1>
              <p className="mt-space-xs max-w-3xl font-body-lg text-body-lg leading-relaxed text-on-surface-variant">
                From foundational browser runtimes and server topologies to distributed message
                queues, database indexing, and cloud orchestration.
              </p>
            </div>

            <div className="flex items-center gap-space-sm self-start lg:self-end">
              <button
                onClick={handleToggleAll}
                className="flex cursor-pointer items-center gap-space-xs rounded-DEFAULT bg-surface-container px-space-md py-space-sm font-label-md text-label-md uppercase text-on-surface transition-colors hover:bg-surface-container-high"
                id="toggle-all-btn"
              >
                <span className="material-symbols-outlined text-sm">
                  {allExpanded ? "unfold_less" : "unfold_more"}
                </span>
                {allExpanded ? "COLLAPSE TIMELINE" : "EXPAND TIMELINE"}
              </button>

              <Link
                href={`/study-session?roadmapId=${selectedRoadmapId || ""}`}
                className="flex items-center gap-space-xs rounded-DEFAULT bg-primary px-space-md py-space-sm font-label-md text-label-md font-bold uppercase text-on-primary shadow-md transition-colors hover:bg-primary-fixed-dim"
              >
                <span
                  className="material-symbols-outlined text-sm"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  play_arrow
                </span>
                RESUME TRACK
              </Link>
            </div>
          </div>
        </header>

        {/* KEY METRICS RIBBON (Structural Bento Grid) */}
        <section className="mb-space-xl grid grid-cols-2 gap-space-xs rounded-xl bg-surface-container-lowest p-space-xs shadow-lg md:grid-cols-5">
          {/* Stat 1: Overall Completion */}
          <div className="flex flex-col justify-between rounded-DEFAULT bg-surface-container p-space-md">
            <div className="flex items-center justify-between text-outline">
              <span className="font-label-sm text-label-sm uppercase tracking-wider">
                OVERALL COMPLETION
              </span>
              <span className="material-symbols-outlined text-sm text-secondary">donut_large</span>
            </div>
            <div className="mt-space-md">
              <div className="font-headline-md text-headline-md font-bold tracking-tight text-secondary">
                {overallCompletionPercentage}%
              </div>
              <div className="mt-2 h-1 w-full overflow-hidden rounded-DEFAULT bg-surface-container-highest">
                <div
                  className="h-full bg-secondary transition-all duration-500"
                  style={{ width: `${overallCompletionPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Stat 2: Time Invested */}
          <div className="flex flex-col justify-between rounded-DEFAULT bg-surface-container p-space-md">
            <div className="flex items-center justify-between text-outline">
              <span className="font-label-sm text-label-sm uppercase tracking-wider">
                TIME INVESTED
              </span>
              <span className="material-symbols-outlined text-sm text-primary">timer</span>
            </div>
            <div className="mt-space-md">
              <div className="font-headline-md text-headline-md font-bold tracking-tight text-on-surface">
                86.5{" "}
                <span className="font-label-md text-label-md font-normal text-on-surface-variant">
                  HRS
                </span>
              </div>
              <span className="mt-1 block font-label-sm text-label-sm text-primary-fixed">
                +4.2 hrs this week
              </span>
            </div>
          </div>

          {/* Stat 3: Total Modules */}
          <div className="flex flex-col justify-between rounded-DEFAULT bg-surface-container p-space-md">
            <div className="flex items-center justify-between text-outline">
              <span className="font-label-sm text-label-sm uppercase tracking-wider">
                TOTAL MODULES
              </span>
              <span className="material-symbols-outlined text-sm text-tertiary">
                folder_special
              </span>
            </div>
            <div className="mt-space-md">
              <div className="font-headline-md text-headline-md font-bold tracking-tight text-on-surface">
                8 <span className="font-normal text-outline">/ 12</span>
              </div>
              <span className="mt-1 block font-label-sm text-label-sm text-on-surface-variant">
                4 pending unlock
              </span>
            </div>
          </div>

          {/* Stat 4: Topics Mastered */}
          <div className="flex flex-col justify-between rounded-DEFAULT bg-surface-container p-space-md">
            <div className="flex items-center justify-between text-outline">
              <span className="font-label-sm text-label-sm uppercase tracking-wider">
                TOPICS MASTERED
              </span>
              <span className="material-symbols-outlined text-sm text-tertiary-fixed">
                task_alt
              </span>
            </div>
            <div className="mt-space-md">
              <div className="font-headline-md text-headline-md font-bold tracking-tight text-tertiary-fixed">
                {totalMasteredTopics}{" "}
                <span className="font-normal text-outline">/ {totalBacklogTopics}</span>
              </div>
              <span className="mt-1 block font-label-sm text-label-sm text-on-surface-variant">
                20 items backlog
              </span>
            </div>
          </div>

          {/* Stat 5: Current Milestone */}
          <div className="col-span-2 flex flex-col justify-between rounded-DEFAULT bg-surface-container-high p-space-md md:col-span-1">
            <div className="flex items-center justify-between text-secondary">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-tertiary-fixed">
                ACTIVE MILESTONE
              </span>
              <span className="h-2 w-2 animate-pulse rounded-full bg-secondary"></span>
            </div>
            <div className="mt-space-xs">
              <div className="line-clamp-2 font-headline-sm text-headline-sm font-semibold leading-tight text-on-surface">
                Distributed State &amp; REST Services
              </div>
              <span className="mt-1 block font-label-sm text-label-sm text-secondary-fixed">
                PHASE 2 OF 4
              </span>
            </div>
          </div>
        </section>

        {/* CORE INTERFACE: 12-COLUMN ASYMMETRIC GRID */}
        <div className="grid grid-cols-1 items-start gap-space-lg lg:grid-cols-12">
          {/* MAIN ROADMAP TIMELINE (8 COLUMNS) */}
          <div className="flex flex-col lg:col-span-8">
            {/* TIMELINE CONTAINER */}
            <div className="relative space-y-space-md pl-6 sm:pl-10">
              {/* Continuous Structural Backbone Track */}
              <div className="absolute bottom-4 left-3 top-4 w-0.5 bg-surface-container-highest sm:left-5"></div>
              {/* Completed portion highlight */}
              <div className="absolute left-3 top-4 h-[44%] w-0.5 bg-secondary sm:left-5"></div>

              {/* MODULE 01: COMPLETED */}
              <div className="group relative">
                {/* Node Marker */}
                <div className="absolute -left-6 top-5 flex h-6 w-6 items-center justify-center bg-surface sm:-left-10 sm:h-10 sm:w-10">
                  <div className="flex h-4 w-4 items-center justify-center rounded-DEFAULT bg-secondary font-label-sm text-label-sm font-bold text-surface shadow-sm sm:h-6 sm:w-6">
                    <span className="material-symbols-outlined text-xs">check</span>
                  </div>
                </div>
                {/* Content Card */}
                <div
                  onClick={() => toggleModule("mod-01")}
                  className="cursor-pointer rounded-xl bg-surface-container-low p-space-md opacity-85 shadow-sm transition-colors hover:bg-surface-container hover:opacity-100"
                >
                  <div className="flex flex-wrap items-center justify-between gap-space-xs">
                    <div className="flex items-center gap-space-sm">
                      <span className="font-label-sm text-label-sm font-bold tracking-widest text-secondary">
                        // 01.00
                      </span>
                      <span className="rounded-DEFAULT bg-surface-container px-1.5 py-0.5 font-label-sm text-label-sm text-on-surface-variant">
                        CORE RUNTIME
                      </span>
                      <span className="hidden font-label-sm text-label-sm text-outline sm:inline">
                        14 TOPICS
                      </span>
                    </div>
                    <div className="flex items-center gap-space-xs font-label-sm text-label-sm font-bold text-secondary">
                      <span className="material-symbols-outlined text-xs">verified</span>
                      <span>COMPLETED</span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">
                      Web Foundations &amp; DOM Internals
                    </h3>
                    <span className="font-label-md text-label-md text-outline">100%</span>
                  </div>
                  <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
                    Layout calculation pipelines, V8 execution graphs, repaint/reflow profiling, and
                    progressive hydration.
                  </p>

                  {/* Expanded Subtopics view */}
                  {expandedModules["mod-01"] && (
                    <div className="mt-space-md space-y-1 border-t border-outline-variant/30 pt-space-sm">
                      {modules[0].subtopics.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between rounded-DEFAULT bg-surface-container/60 px-2 py-1 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-xs text-secondary">
                              check_circle
                            </span>
                            <span className="text-on-surface-variant line-through">
                              {sub.title}
                            </span>
                          </div>
                          <span className="font-label-sm font-mono text-label-sm text-secondary">
                            VERIFIED
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* MODULE 02: COMPLETED */}
              <div className="group relative">
                {/* Node Marker */}
                <div className="absolute -left-6 top-5 flex h-6 w-6 items-center justify-center bg-surface sm:-left-10 sm:h-10 sm:w-10">
                  <div className="flex h-4 w-4 items-center justify-center rounded-DEFAULT bg-secondary font-label-sm text-label-sm font-bold text-surface shadow-sm sm:h-6 sm:w-6">
                    <span className="material-symbols-outlined text-xs">check</span>
                  </div>
                </div>
                {/* Content Card */}
                <div
                  onClick={() => toggleModule("mod-02")}
                  className="cursor-pointer rounded-xl bg-surface-container-low p-space-md opacity-85 shadow-sm transition-colors hover:bg-surface-container hover:opacity-100"
                >
                  <div className="flex flex-wrap items-center justify-between gap-space-xs">
                    <div className="flex items-center gap-space-sm">
                      <span className="font-label-sm text-label-sm font-bold tracking-widest text-secondary">
                        // 02.00
                      </span>
                      <span className="rounded-DEFAULT bg-surface-container px-1.5 py-0.5 font-label-sm text-label-sm text-on-surface-variant">
                        TYPE VERIFICATION
                      </span>
                      <span className="hidden font-label-sm text-label-sm text-outline sm:inline">
                        12 TOPICS
                      </span>
                    </div>
                    <div className="flex items-center gap-space-xs font-label-sm text-label-sm font-bold text-secondary">
                      <span className="material-symbols-outlined text-xs">verified</span>
                      <span>COMPLETED</span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">
                      TypeScript &amp; Type System Soundness
                    </h3>
                    <span className="font-label-md text-label-md text-outline">100%</span>
                  </div>
                  <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
                    Conditional types, distributive conditional mappings, template literal
                    inference, and AST type checking.
                  </p>

                  {/* Expanded Subtopics view */}
                  {expandedModules["mod-02"] && (
                    <div className="mt-space-md space-y-1 border-t border-outline-variant/30 pt-space-sm">
                      {modules[1].subtopics.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between rounded-DEFAULT bg-surface-container/60 px-2 py-1 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-xs text-secondary">
                              check_circle
                            </span>
                            <span className="text-on-surface-variant line-through">
                              {sub.title}
                            </span>
                          </div>
                          <span className="font-label-sm font-mono text-label-sm text-secondary">
                            VERIFIED
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* MODULE 03: COMPLETED */}
              <div className="group relative">
                {/* Node Marker */}
                <div className="absolute -left-6 top-5 flex h-6 w-6 items-center justify-center bg-surface sm:-left-10 sm:h-10 sm:w-10">
                  <div className="flex h-4 w-4 items-center justify-center rounded-DEFAULT bg-secondary font-label-sm text-label-sm font-bold text-surface shadow-sm sm:h-6 sm:w-6">
                    <span className="material-symbols-outlined text-xs">check</span>
                  </div>
                </div>
                {/* Content Card */}
                <div
                  onClick={() => toggleModule("mod-03")}
                  className="cursor-pointer rounded-xl bg-surface-container-low p-space-md opacity-85 shadow-sm transition-colors hover:bg-surface-container hover:opacity-100"
                >
                  <div className="flex flex-wrap items-center justify-between gap-space-xs">
                    <div className="flex items-center gap-space-sm">
                      <span className="font-label-sm text-label-sm font-bold tracking-widest text-secondary">
                        // 03.00
                      </span>
                      <span className="rounded-DEFAULT bg-surface-container px-1.5 py-0.5 font-label-sm text-label-sm text-on-surface-variant">
                        CLIENT PATTERNS
                      </span>
                      <span className="hidden font-label-sm text-label-sm text-outline sm:inline">
                        16 TOPICS
                      </span>
                    </div>
                    <div className="flex items-center gap-space-xs font-label-sm text-label-sm font-bold text-secondary">
                      <span className="material-symbols-outlined text-xs">verified</span>
                      <span>COMPLETED</span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">
                      Frontend Systems &amp; State Machines
                    </h3>
                    <span className="font-label-md text-label-md text-outline">100%</span>
                  </div>
                  <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
                    Deterministic finite state automata, decoupled store selectors, microfrontends,
                    and client edge routing.
                  </p>

                  {/* Expanded Subtopics view */}
                  {expandedModules["mod-03"] && (
                    <div className="mt-space-md space-y-1 border-t border-outline-variant/30 pt-space-sm">
                      {modules[2].subtopics.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between rounded-DEFAULT bg-surface-container/60 px-2 py-1 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-xs text-secondary">
                              check_circle
                            </span>
                            <span className="text-on-surface-variant line-through">
                              {sub.title}
                            </span>
                          </div>
                          <span className="font-label-sm font-mono text-label-sm text-secondary">
                            VERIFIED
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* MODULE 04: ACTIVE / EXPANDED VIEW */}
              <div className="relative">
                {/* Active Node Marker with Neo-Brutalist High-Contrast Indicator */}
                <div className="absolute -left-6 top-6 flex h-6 w-6 items-center justify-center bg-surface sm:-left-10 sm:h-10 sm:w-10">
                  <div className="flex h-5 w-5 items-center justify-center rounded-DEFAULT bg-tertiary-fixed font-label-sm text-label-sm font-bold text-on-tertiary-fixed shadow-md ring-4 ring-primary-container sm:h-7 sm:w-7">
                    04
                  </div>
                </div>

                {/* Expanded Active Card with Structural Accent Framing */}
                <div className="relative overflow-hidden rounded-xl bg-surface-container-high p-space-lg shadow-xl">
                  <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-tertiary-fixed via-secondary to-primary"></div>

                  {/* Card Header */}
                  <div className="flex flex-wrap items-center justify-between gap-space-xs">
                    <div className="flex items-center gap-space-sm">
                      <span className="font-label-sm text-label-sm font-bold tracking-widest text-tertiary-fixed">
                        // 04.00 ARCHITECTURAL CORE
                      </span>
                      <span className="rounded-DEFAULT bg-secondary-container px-2 py-0.5 font-label-sm text-label-sm font-semibold uppercase text-secondary-fixed">
                        ACTIVE MILESTONE
                      </span>
                    </div>
                    <div className="flex items-center gap-space-sm">
                      <span className="rounded-DEFAULT bg-surface-container-lowest px-2 py-0.5 font-label-sm text-label-sm text-tertiary-fixed">
                        {activeModule?.remainingHours || 18} HRS REMAINING
                      </span>
                      <span className="font-label-md text-label-md font-bold text-on-surface">
                        {completedTopicsInActiveMod} / {totalTopicsInActiveMod} COMPLETED
                      </span>
                    </div>
                  </div>

                  {/* Module Title */}
                  <div className="mt-space-sm">
                    <h2 className="font-headline-md text-headline-md tracking-tight text-on-surface">
                      Backend Development &amp; REST APIs
                    </h2>
                    <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
                      Architecting resilient microservices, stateless transport mechanisms,
                      standardized payload schemas, and zero-trust perimeter security.
                    </p>
                  </div>

                  {/* Subtopics Checklist (Engineering Specification List) */}
                  <div className="mt-space-lg space-y-space-xs">
                    <div className="flex items-center justify-between pb-1 font-label-sm text-label-sm uppercase tracking-wider text-outline">
                      <span>MODULE TOPIC SEQUENCE</span>
                      <span>STATUS / SPEC</span>
                    </div>

                    {modules[3].subtopics.map((sub) => {
                      if (sub.isCompleted) {
                        return (
                          <div
                            key={sub.id}
                            onClick={() => handleToggleSubtopic("mod-04", sub.id)}
                            className="flex cursor-pointer items-center justify-between rounded-DEFAULT bg-surface-container p-space-sm transition-colors hover:bg-surface-container-highest"
                          >
                            <div className="flex items-center gap-space-sm">
                              <div className="flex h-4 w-4 items-center justify-center rounded-DEFAULT bg-tertiary-fixed text-on-tertiary-fixed">
                                <div className="h-2 w-2 bg-on-tertiary-fixed"></div>
                              </div>
                              <span className="font-body-sm text-body-sm text-on-surface-variant line-through">
                                {sub.title}
                              </span>
                            </div>
                            <span className="font-label-sm text-label-sm text-tertiary-fixed">
                              VERIFIED
                            </span>
                          </div>
                        );
                      }

                      if (sub.isCurrent) {
                        return (
                          <div
                            key={sub.id}
                            onClick={() => handleToggleSubtopic("mod-04", sub.id)}
                            className="flex cursor-pointer items-center justify-between rounded-DEFAULT bg-primary-container p-space-sm shadow-sm"
                          >
                            <div className="flex items-center gap-space-sm">
                              <div className="relative flex h-4 w-4 items-center justify-center">
                                <span className="absolute h-3 w-3 animate-ping rounded-DEFAULT bg-secondary opacity-75"></span>
                                <span className="h-3 w-3 rounded-DEFAULT bg-tertiary-fixed"></span>
                              </div>
                              <span className="font-body-sm text-body-sm font-semibold text-on-surface">
                                {sub.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-space-xs font-label-sm text-label-sm font-bold text-tertiary-fixed">
                              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-tertiary-fixed"></span>
                              <span>CURRENT TOPIC</span>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={sub.id}
                          onClick={() => handleToggleSubtopic("mod-04", sub.id)}
                          className="flex cursor-pointer items-center justify-between rounded-DEFAULT bg-surface-container p-space-sm transition-colors hover:bg-surface-container-highest"
                        >
                          <div className="flex items-center gap-space-sm">
                            <div className="h-4 w-4 rounded-DEFAULT bg-surface-container-highest"></div>
                            <span
                              className={cn(
                                "font-body-sm text-body-sm",
                                sub.isQueued ? "text-on-surface-variant" : "text-on-surface"
                              )}
                            >
                              {sub.title}
                            </span>
                          </div>
                          <span className="font-label-sm text-label-sm text-outline">
                            {sub.statusText}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Embedded Learning Resources */}
                  <div className="mt-space-lg">
                    <span className="mb-space-xs block font-label-sm text-label-sm uppercase tracking-wider text-outline">
                      ATTACHED SPECIFICATIONS &amp; MANUALS
                    </span>
                    <div className="grid grid-cols-1 gap-space-xs sm:grid-cols-3">
                      {modules[3].resources?.map((res, i) => (
                        <a
                          key={i}
                          href={res.url}
                          target="_blank"
                          rel="noreferrer"
                          className="group flex flex-col justify-between rounded-DEFAULT bg-surface-container p-space-sm transition-all hover:bg-surface-bright"
                        >
                          <div>
                            <div className="flex items-center justify-between text-outline-variant group-hover:text-primary">
                              <span className="font-label-sm text-label-sm uppercase">
                                {res.type}
                              </span>
                              <span className="material-symbols-outlined text-sm">open_in_new</span>
                            </div>
                            <div className="mt-1 font-headline-sm text-sm font-semibold text-on-surface">
                              {res.title}
                            </div>
                          </div>
                          <div className="mt-space-sm font-label-sm text-label-sm text-outline">
                            {res.meta}
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Action Execution Buttons */}
                  <div className="mt-space-lg flex flex-wrap items-center justify-between gap-space-sm rounded-DEFAULT bg-surface-container-lowest p-space-md pt-space-md">
                    <div className="flex items-center gap-space-sm">
                      <button
                        onClick={handleMarkCurrentComplete}
                        className={cn(
                          "flex cursor-pointer items-center gap-space-xs rounded-DEFAULT px-space-md py-space-sm font-label-md text-label-md font-bold uppercase shadow-md transition-colors",
                          topicSubmitted
                            ? "bg-secondary text-surface"
                            : "bg-tertiary-fixed text-on-tertiary-fixed hover:bg-secondary-fixed"
                        )}
                        id="complete-btn"
                      >
                        <span className="material-symbols-outlined text-sm">
                          {topicSubmitted ? "verified" : "check_circle"}
                        </span>
                        {topicSubmitted ? "TOPIC SUBMITTED // VERIFIED" : "MARK TOPIC COMPLETE"}
                      </button>

                      <button
                        onClick={() => setShowNoteModal(true)}
                        className="flex cursor-pointer items-center gap-space-xs rounded-DEFAULT bg-surface-container px-space-md py-space-sm font-label-md text-label-md uppercase text-on-surface transition-colors hover:bg-surface-bright"
                      >
                        <span className="material-symbols-outlined text-sm">edit_note</span>+ ADD
                        NOTE
                      </button>
                    </div>

                    <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-outline">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      <span>SYNC_TARGET: 2026-Q1</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* MODULE 05: LOCKED / UPCOMING */}
              <div className="group relative opacity-60 transition-opacity hover:opacity-80">
                {/* Locked Node Marker */}
                <div className="absolute -left-6 top-5 flex h-6 w-6 items-center justify-center bg-surface sm:-left-10 sm:h-10 sm:w-10">
                  <div className="flex h-4 w-4 items-center justify-center rounded-DEFAULT bg-surface-container-highest font-label-sm text-label-sm text-outline sm:h-6 sm:w-6">
                    <span className="material-symbols-outlined text-xs">lock</span>
                  </div>
                </div>
                {/* Content Card */}
                <div
                  onClick={() => toggleModule("mod-05")}
                  className="cursor-pointer rounded-xl bg-surface-container-lowest p-space-md shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-space-xs">
                    <div className="flex items-center gap-space-sm">
                      <span className="font-label-sm text-label-sm tracking-widest text-outline">
                        // 05.00
                      </span>
                      <span className="rounded-DEFAULT bg-surface-container px-1.5 py-0.5 font-label-sm text-label-sm text-outline">
                        PERSISTENCE LAYER
                      </span>
                      <span className="font-label-sm text-label-sm text-outline">18 TOPICS</span>
                    </div>
                    <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-outline">
                      <span className="material-symbols-outlined text-xs">lock_clock</span>
                      <span>LOCKED // PREREQUISITE: MOD 04</span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">
                      Database Modeling &amp; Query Optimization
                    </h3>
                    <span className="font-label-md text-label-md text-outline">0%</span>
                  </div>
                  <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
                    B-Tree indices, transaction isolation levels (ACID), schema migration pipelines,
                    WAL analysis, and query execution plans.
                  </p>

                  {/* Expanded Subtopics view */}
                  {expandedModules["mod-05"] && (
                    <div className="mt-space-md space-y-1 border-t border-outline-variant/30 pt-space-sm">
                      {modules[4].subtopics.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between rounded-DEFAULT bg-surface-container/40 px-2 py-1 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-xs text-outline">
                              lock
                            </span>
                            <span className="text-outline">{sub.title}</span>
                          </div>
                          <span className="font-label-sm font-mono text-label-sm text-outline">
                            LOCKED
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* MODULE 06: LOCKED / UPCOMING */}
              <div className="group relative opacity-60 transition-opacity hover:opacity-80">
                {/* Locked Node Marker */}
                <div className="absolute -left-6 top-5 flex h-6 w-6 items-center justify-center bg-surface sm:-left-10 sm:h-10 sm:w-10">
                  <div className="flex h-4 w-4 items-center justify-center rounded-DEFAULT bg-surface-container-highest font-label-sm text-label-sm text-outline sm:h-6 sm:w-6">
                    <span className="material-symbols-outlined text-xs">lock</span>
                  </div>
                </div>
                {/* Content Card */}
                <div
                  onClick={() => toggleModule("mod-06")}
                  className="cursor-pointer rounded-xl bg-surface-container-lowest p-space-md shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-space-xs">
                    <div className="flex items-center gap-space-sm">
                      <span className="font-label-sm text-label-sm tracking-widest text-outline">
                        // 06.00
                      </span>
                      <span className="rounded-DEFAULT bg-surface-container px-1.5 py-0.5 font-label-sm text-label-sm text-outline">
                        INFRASTRUCTURE
                      </span>
                      <span className="font-label-sm text-label-sm text-outline">22 TOPICS</span>
                    </div>
                    <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-outline">
                      <span className="material-symbols-outlined text-xs">lock_clock</span>
                      <span>LOCKED // PREREQUISITE: MOD 05</span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">
                      DevOps, CI/CD &amp; Kubernetes Deployment
                    </h3>
                    <span className="font-label-md text-label-md text-outline">0%</span>
                  </div>
                  <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
                    Container runtimes, OCI compliance, Pod lifecycle hooks, ingress controllers,
                    ArgoCD gitops, and cluster autoscaling.
                  </p>

                  {/* Expanded Subtopics view */}
                  {expandedModules["mod-06"] && (
                    <div className="mt-space-md space-y-1 border-t border-outline-variant/30 pt-space-sm">
                      {modules[5].subtopics.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between rounded-DEFAULT bg-surface-container/40 px-2 py-1 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-xs text-outline">
                              lock
                            </span>
                            <span className="text-outline">{sub.title}</span>
                          </div>
                          <span className="font-label-sm font-mono text-label-sm text-outline">
                            LOCKED
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SIDEBAR / TECHNICAL UTILITY HUD (4 COLUMNS) */}
          <aside className="flex flex-col gap-space-md lg:sticky lg:top-24 lg:col-span-4">
            {/* EXPORT & SYSTEM DISPATCH ACTIONS */}
            <div className="rounded-xl bg-surface-container p-space-md shadow-md">
              <div className="mb-space-sm flex items-center justify-between">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-tertiary-fixed">
                  // ACTIONS &amp; OUTPUT
                </span>
                <span className="material-symbols-outlined text-sm text-outline">
                  download_for_offline
                </span>
              </div>
              <div className="flex flex-col gap-space-xs">
                <button
                  onClick={handleExportPdf}
                  className="flex w-full cursor-pointer items-center justify-between rounded-DEFAULT bg-surface-container-high p-space-sm font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-bright"
                >
                  <span className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-sm text-primary">
                      picture_as_pdf
                    </span>
                    <span>EXPORT ROADMAP AS PDF</span>
                  </span>
                  <span className="font-label-sm text-label-sm text-outline">.PDF</span>
                </button>

                <button
                  onClick={handleExportSvg}
                  className="flex w-full cursor-pointer items-center justify-between rounded-DEFAULT bg-surface-container-high p-space-sm font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-bright"
                >
                  <span className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-sm text-secondary">
                      polyline
                    </span>
                    <span>EXPORT VECTOR GRAPH</span>
                  </span>
                  <span className="font-label-sm text-label-sm text-outline">.SVG</span>
                </button>

                <button
                  onClick={handleShareUrl}
                  className="flex w-full cursor-pointer items-center justify-between rounded-DEFAULT bg-surface-container-high p-space-sm font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-bright"
                >
                  <span className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-sm text-tertiary">share</span>
                    <span>SHARE SCHOLAR TRACK URL</span>
                  </span>
                  <span className="font-label-sm text-label-sm text-outline">UUID</span>
                </button>

                {selectedRoadmapId && (
                  <Link
                    href={`/roadmaps/${selectedRoadmapId}/editor`}
                    className="flex w-full items-center justify-between rounded-DEFAULT bg-surface-container-highest p-space-sm font-label-md text-label-md text-tertiary-fixed transition-colors hover:bg-primary-container"
                  >
                    <span className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-sm text-tertiary-fixed">
                        account_tree
                      </span>
                      <span>INTERACTIVE REACT FLOW GRAPH</span>
                    </span>
                    <span className="font-label-sm font-mono text-label-sm text-secondary">
                      EDITOR
                    </span>
                  </Link>
                )}
              </div>
            </div>

            {/* AI MENTOR QUICK RECOMMENDATION (Pathfinder AI) */}
            <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-lg">
              <div className="flex items-center justify-between pb-space-xs">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined animate-pulse text-base text-secondary">
                    psychology
                  </span>
                  <span className="font-label-sm text-label-sm font-bold uppercase tracking-widest text-secondary">
                    PATHFINDER_AI MENTOR
                  </span>
                </div>
                <span className="bg-surface-container px-1.5 py-0.5 font-label-sm text-label-sm text-outline">
                  V3.2 INTEL
                </span>
              </div>
              <div className="mt-space-sm rounded-DEFAULT bg-surface-container-low p-space-sm">
                <div className="mb-1 font-label-sm text-label-sm uppercase tracking-wider text-tertiary-fixed">
                  // RECOMMENDED NEXT EXERCISE:
                </div>
                <p className="font-body-sm text-body-sm leading-normal text-on-surface">
                  &ldquo;Before committing changes on API Versioning, implement an{" "}
                  <strong className="font-bold text-tertiary-fixed">
                    OpenAPI 3.1 discriminator mapping
                  </strong>{" "}
                  with mutual TLS headers in your sandbox. It reinforces Module 04&apos;s security
                  check.&rdquo;
                </p>
              </div>
              <div className="mt-space-md flex items-center justify-between">
                <Link
                  href="/ai-assistant"
                  className="flex items-center gap-1 font-label-sm text-label-sm font-bold uppercase text-secondary transition-colors hover:text-tertiary-fixed"
                >
                  <span>LAUNCH LAB WORKBENCH</span>
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </Link>
                <span className="font-label-sm text-label-sm text-outline">EST. 35 MIN</span>
              </div>
            </div>

            {/* ARCHITECTURAL VISUAL / TELEMETRY WIDGET */}
            <div className="rounded-xl bg-surface-container p-space-md shadow-md">
              <div className="mb-space-sm flex items-center justify-between font-label-sm text-label-sm uppercase tracking-wider text-outline">
                <span>VELOCITY MATRIX</span>
                <span>LAST 7 DAYS</span>
              </div>
              {/* Mini Inline SVG Bar Sparkline with exact layout from reference */}
              <div className="flex h-28 w-full items-end justify-between gap-1.5 pt-4">
                <div className="group relative h-[45%] flex-1 rounded-DEFAULT bg-surface-container-highest transition-colors hover:bg-secondary">
                  <span className="absolute -top-6 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-surface-container-lowest px-1 py-0.5 font-label-sm text-label-sm text-on-surface opacity-0 transition-opacity group-hover:opacity-100">
                    2.1h
                  </span>
                </div>
                <div className="group relative h-[60%] flex-1 rounded-DEFAULT bg-surface-container-highest transition-colors hover:bg-secondary">
                  <span className="absolute -top-6 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-surface-container-lowest px-1 py-0.5 font-label-sm text-label-sm text-on-surface opacity-0 transition-opacity group-hover:opacity-100">
                    3.4h
                  </span>
                </div>
                <div className="group relative h-[30%] flex-1 rounded-DEFAULT bg-surface-container-highest transition-colors hover:bg-secondary">
                  <span className="absolute -top-6 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-surface-container-lowest px-1 py-0.5 font-label-sm text-label-sm text-on-surface opacity-0 transition-opacity group-hover:opacity-100">
                    1.5h
                  </span>
                </div>
                <div className="group relative h-[85%] flex-1 rounded-DEFAULT bg-secondary-fixed-dim">
                  <span className="absolute -top-6 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-surface-container-lowest px-1 py-0.5 font-label-sm text-label-sm text-on-surface opacity-0 transition-opacity group-hover:opacity-100">
                    5.2h
                  </span>
                </div>
                <div className="group relative h-[95%] flex-1 rounded-DEFAULT bg-secondary">
                  <span className="absolute -top-6 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-surface-container-lowest px-1 py-0.5 font-label-sm text-label-sm text-on-surface opacity-0 transition-opacity group-hover:opacity-100">
                    5.8h
                  </span>
                </div>
                <div className="group relative h-[50%] flex-1 rounded-DEFAULT bg-surface-container-highest transition-colors hover:bg-secondary">
                  <span className="absolute -top-6 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-surface-container-lowest px-1 py-0.5 font-label-sm text-label-sm text-on-surface opacity-0 transition-opacity group-hover:opacity-100">
                    2.8h
                  </span>
                </div>
                <div className="group relative h-[75%] flex-1 rounded-DEFAULT bg-tertiary-fixed">
                  <span className="absolute -top-6 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-surface-container-lowest px-1 py-0.5 font-label-sm text-label-sm text-on-surface opacity-0 transition-opacity group-hover:opacity-100">
                    4.2h
                  </span>
                </div>
              </div>
              <div className="mt-2 flex justify-between border-t border-outline-variant/30 pt-2 font-label-sm text-label-sm text-outline">
                <span>MON</span>
                <span>TUE</span>
                <span>WED</span>
                <span>THU</span>
                <span>FRI</span>
                <span>SAT</span>
                <span className="font-bold text-secondary">SUN</span>
              </div>
            </div>

            {/* RECENT LAB DISCUSSIONS / PEER CITATIONS */}
            <div className="rounded-xl bg-surface-container p-space-md shadow-md">
              <div className="mb-space-sm flex items-center justify-between font-label-sm text-label-sm uppercase tracking-wider text-outline">
                <span>SCHOLAR NOTES &amp; COMMITS</span>
                <span>V2.6</span>
              </div>
              <div className="space-y-space-xs font-label-sm text-label-sm">
                <div className="flex items-start gap-space-xs text-on-surface-variant">
                  <span className="font-mono text-tertiary">08:14</span>
                  <span>
                    Updated RFC 9110 highlights on conditional GET requests (304 Not Modified).
                  </span>
                </div>
                <div className="flex items-start gap-space-xs text-on-surface-variant">
                  <span className="font-mono text-tertiary">YSTD</span>
                  <span>
                    Validated PostgreSQL composite primary index performance for tenant schemas.
                  </span>
                </div>
                {notes.slice(0, 2).map((n) => (
                  <div
                    key={n._id}
                    className="flex items-start gap-space-xs border-t border-outline-variant/20 pt-1 text-on-surface-variant"
                  >
                    <span className="font-mono text-tertiary-fixed">
                      {n.createdAt?.substring(11, 16) || "REC"}
                    </span>
                    <span className="line-clamp-2">{n.title}</span>
                  </div>
                ))}
              </div>
              <div className="mt-space-sm flex items-center justify-between border-t border-outline-variant/30 pt-space-xs">
                <button
                  onClick={() => setShowNoteModal(true)}
                  className="font-label-sm text-label-sm font-bold uppercase text-tertiary-fixed hover:underline"
                >
                  + Record Reflection
                </button>
                <Link
                  href="/notes"
                  className="font-label-sm text-label-sm uppercase text-outline hover:text-on-surface"
                >
                  View All ({notes.length})
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Note Creation Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="animate-in fade-in zoom-in-95 w-full max-w-lg space-y-4 rounded-xl border border-outline-variant/60 bg-surface-container-high p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary-fixed">edit_note</span>
                <h3 className="font-headline-sm text-headline-sm uppercase text-on-surface">
                  Add Scholar Note
                </h3>
              </div>
              <button
                onClick={() => setShowNoteModal(false)}
                className="text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateNote} className="space-y-4">
              <div>
                <label className="mb-1 block font-label-sm text-label-sm uppercase text-outline">
                  Topic Title / Headline *
                </label>
                <input
                  type="text"
                  required
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="e.g. Architectural trade-offs in OpenAPI 3.1 discriminator mapping"
                  className="w-full rounded-DEFAULT border border-outline-variant bg-surface-container p-2 text-sm text-on-surface focus:border-tertiary-fixed focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-label-sm text-label-sm uppercase text-outline">
                  Technical Reflection &amp; Synthesized Findings *
                </label>
                <textarea
                  rows={4}
                  required
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Record key technical insights, edge runtime implications, or implementation nuances..."
                  className="w-full rounded-DEFAULT border border-outline-variant bg-surface-container p-2 text-sm text-on-surface focus:border-tertiary-fixed focus:outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="rounded-DEFAULT bg-surface-container px-4 py-2 font-label-sm text-label-sm uppercase text-on-surface hover:bg-surface-bright"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNote}
                  className="rounded-DEFAULT bg-tertiary-fixed px-4 py-2 font-label-sm text-label-sm font-bold uppercase text-on-tertiary-fixed hover:bg-secondary-fixed disabled:opacity-50"
                >
                  {isSubmittingNote ? "Saving..." : "Save Reflection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
