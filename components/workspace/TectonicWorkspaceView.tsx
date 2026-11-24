"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  fetchDailyGoal,
  saveDailyGoalApi,
  fetchNotes,
  createNoteApi,
  fetchResources,
  fetchMilestones,
  logManualStudySessionApi,
} from "@/services/api";
import { IDailyGoal, ILearningNote, ILearningResource, IMilestone } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface GoalItem {
  id: string;
  title: string;
  subtitle: string;
  status: "completed" | "in_progress" | "pending";
  targetMinutes: number;
  completedMinutes: number;
}

interface SubtaskItem {
  id: string;
  title: string;
  dependency: string;
  durationMinutes: number;
  completed: boolean;
}

interface ResourceItem {
  id: string;
  title: string;
  category: string;
  typeMeta: string;
  iconName: string;
  iconColor: string;
  isBookmarked: boolean;
  url: string;
}

interface MilestoneItem {
  id: string;
  title: string;
  description: string;
  refCode: string;
  daysRemaining: number;
  isCritical: boolean;
  categoryTag: string;
  actionText: string;
}

const DEFAULT_GOALS: GoalItem[] = [
  {
    id: "goal-1",
    title: "Complete REST API Idempotency Implementation",
    subtitle: "VERIFIED // STATUS: COMPLETED",
    status: "completed",
    targetMinutes: 60,
    completedMinutes: 60,
  },
  {
    id: "goal-2",
    title: "Read 2 chapters of Designing Data-Intensive Applications",
    subtitle: "READING CYCLE // 45m of 60m",
    status: "in_progress",
    targetMinutes: 60,
    completedMinutes: 45,
  },
  {
    id: "goal-3",
    title: "Write unit tests for Auth Middleware",
    subtitle: "SUITE: JEST & SUPERTEST",
    status: "pending",
    targetMinutes: 45,
    completedMinutes: 0,
  },
];

const DEFAULT_SUBTASKS: SubtaskItem[] = [
  {
    id: "subtask-1",
    title: "Construct distributed lock via Redis Redlock strategy",
    dependency: "DEPENDENCY: SYNC_INFRA",
    durationMinutes: 35,
    completed: false,
  },
  {
    id: "subtask-2",
    title: "Derive zero-knowledge cryptographic signature verification",
    dependency: "CORE_ALGORITHM // SOLVED",
    durationMinutes: 50,
    completed: true,
  },
  {
    id: "subtask-3",
    title: "Benchmark PostgreSQL query planner on index partitioning",
    dependency: "QUERY_OPTIMIZER",
    durationMinutes: 20,
    completed: false,
  },
];

const DEFAULT_RESOURCES: ResourceItem[] = [
  {
    id: "res-1",
    title: "PostgreSQL Indexing Deep-Dive",
    category: "DATABASE",
    typeMeta: "14 MIN READ",
    iconName: "dataset",
    iconColor: "text-primary",
    isBookmarked: true,
    url: "https://use-the-index-luke.com/",
  },
  {
    id: "res-2",
    title: "Clean Architecture in Go & Node.js",
    category: "ARCHITECTURE",
    typeMeta: "VIDEO COURSE",
    iconName: "smart_display",
    iconColor: "text-secondary",
    isBookmarked: true,
    url: "https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html",
  },
  {
    id: "res-3",
    title: "RFC 7519 JSON Web Token Spec",
    category: "SPEC",
    typeMeta: "DOCUMENT",
    iconName: "description",
    iconColor: "text-outline",
    isBookmarked: true,
    url: "https://www.rfc-editor.org/rfc/rfc7519",
  },
];

const DEFAULT_MILESTONES: MilestoneItem[] = [
  {
    id: "ms-1",
    title: "Backend Capstone API Review",
    description:
      "Full architectural appraisal with mentor & automated test coverage verification (>85%).",
    refCode: "MILESTONE REF: CP-409",
    daysRemaining: 4,
    isCritical: true,
    categoryTag: "WARNING // CRITICAL DEADLINE",
    actionText: "PREPARE ARTIFACTS",
  },
  {
    id: "ms-2",
    title: "System Design Mock Interview",
    description: "Distributed message broker topology design & high-throughput caching simulation.",
    refCode: "MILESTONE REF: SD-102",
    daysRemaining: 12,
    isCritical: false,
    categoryTag: "SCHEDULED SESSION",
    actionText: "REVIEW RUBRIC",
  },
];

const DEFAULT_MARKDOWN = `### PostgreSQL Isolation Levels & Idempotency Keys
- Idempotency guarantees require unique constraint validation directly on \`idempotency_key\`
- Serializable transactions mitigate write-skew anomalies when orchestrating concurrent state updates
- Ensure cache invalidation cascades immediately prior to returning 201 Created`;

export function TectonicWorkspaceView() {
  // Navigation tabs: 'tasks' | 'notes' | 'vault' | 'milestones'
  const [activeTab, setActiveTab] = useState<"tasks" | "notes" | "vault" | "milestones">("tasks");

  // Section 01: Goals
  const [goals, setGoals] = useState<GoalItem[]>(DEFAULT_GOALS);
  const [newGoalInput, setNewGoalInput] = useState("");

  // Section 02: Subtasks
  const [subtasks, setSubtasks] = useState<SubtaskItem[]>(DEFAULT_SUBTASKS);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Section 03: Markdown Scratchpad
  const [markdownContent, setMarkdownContent] = useState(DEFAULT_MARKDOWN);
  const [editorMode, setEditorMode] = useState<"raw" | "preview">("raw");
  const [syncStatusText, setSyncStatusText] = useState("SYNCED 1m AGO");
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Section 04: Pomodoro Rig Timer
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [cycleCount, setCycleCount] = useState(42);
  const [totalFocusMinutes, setTotalFocusMinutes] = useState(135); // 2h 15m
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Section 05: Resources
  const [resources, setResources] = useState<ResourceItem[]>(DEFAULT_RESOURCES);
  const [resourceFilter, setResourceFilter] = useState("");

  // Section 06: Milestones
  const [milestones, setMilestones] = useState<MilestoneItem[]>(DEFAULT_MILESTONES);
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneItem | null>(null);

  // Load from MongoDB backend where available
  useEffect(() => {
    // 1. Fetch daily goals
    fetchDailyGoal()
      .then((dg) => {
        if (dg && dg.tasks && dg.tasks.length > 0) {
          const mapped: GoalItem[] = dg.tasks.map((t, idx) => ({
            id: t.id || `goal-api-${idx}`,
            title: t.title,
            subtitle: t.completed
              ? "VERIFIED // STATUS: COMPLETED"
              : `READING CYCLE // ${t.completedMinutes}m of ${t.targetMinutes}m`,
            status: t.completed ? "completed" : t.completedMinutes > 0 ? "in_progress" : "pending",
            targetMinutes: t.targetMinutes || 60,
            completedMinutes: t.completedMinutes || 0,
          }));
          setGoals(mapped);
        }
      })
      .catch((err) => console.warn("Could not load remote daily goal:", err));

    // 2. Load scratchpad from localStorage if present
    const saved = localStorage.getItem("mypath_workspace_scratchpad");
    if (saved) {
      setMarkdownContent(saved);
    }
  }, []);

  // Timer interval effect
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setTimerRunning(false);
            setCycleCount((c) => c + 1);
            setTotalFocusMinutes((m) => m + 25);
            toast.success("Focus block finished! Logged 25m of deliberate practice.");

            // Log session to MongoDB
            logManualStudySessionApi({
              title: "Workspace Deep Work Pomodoro Block",
              sessionDate: new Date().toISOString().split("T")[0],
              durationMinutes: 25,
              reflection: "Automated Pomodoro completion logged via Workspace Rig.",
            }).catch((err) => console.warn("Session log sync warning:", err));

            return 25 * 60;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning]);

  // Format timer seconds into MM:SS
  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(mins).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const toggleTimer = () => {
    setTimerRunning((prev) => !prev);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setSecondsRemaining(25 * 60);
  };

  // Goal status cycler: pending -> in_progress -> completed -> pending
  const cycleGoalStatus = (goalId: string) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g;
        if (g.status === "pending") {
          return {
            ...g,
            status: "in_progress",
            completedMinutes: Math.round(g.targetMinutes * 0.75),
            subtitle: `READING CYCLE // ${Math.round(g.targetMinutes * 0.75)}m of ${g.targetMinutes}m`,
          };
        }
        if (g.status === "in_progress") {
          return {
            ...g,
            status: "completed",
            completedMinutes: g.targetMinutes,
            subtitle: "VERIFIED // STATUS: COMPLETED",
          };
        }
        return {
          ...g,
          status: "pending",
          completedMinutes: 0,
          subtitle: "SUITE: JEST & SUPERTEST",
        };
      })
    );
    toast.success("Goal status updated.");
  };

  // Add new goal
  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalInput.trim()) return;

    const newGoal: GoalItem = {
      id: `goal-${Date.now()}`,
      title: newGoalInput.trim(),
      subtitle: "EXECUTION QUEUE // PLANNED",
      status: "pending",
      targetMinutes: 45,
      completedMinutes: 0,
    };

    const updated = [...goals, newGoal];
    setGoals(updated);
    setNewGoalInput("");

    // Persist to MongoDB
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      await saveDailyGoalApi({
        date: todayStr,
        targetMinutes: 120,
        completedMinutes: 60,
        tasks: updated.map((g) => ({
          id: g.id,
          title: g.title,
          targetMinutes: g.targetMinutes,
          completedMinutes: g.completedMinutes,
          completed: g.status === "completed",
        })),
      });
      toast.success("Goal committed to daily curriculum.");
    } catch (err) {
      console.warn("Could not sync goal to API:", err);
    }
  };

  // Subtask checkbox toggle
  const toggleSubtask = (id: string) => {
    setSubtasks((prev) => prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s)));
  };

  // Subtask delete
  const deleteSubtask = (id: string) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
    toast.success("Subtask removed from matrix.");
  };

  // Drag and Drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) return;
    const reordered = [...subtasks];
    const [moved] = reordered.splice(draggedIndex, 1);
    reordered.splice(dropIndex, 0, moved);
    setSubtasks(reordered);
    setDraggedIndex(null);
    toast.success("Matrix sequence re-indexed.");
  };

  // Scratchpad save
  const handleMarkdownChange = (val: string) => {
    setMarkdownContent(val);
    localStorage.setItem("mypath_workspace_scratchpad", val);
    setSyncStatusText("SAVING...");
    setTimeout(() => {
      setSyncStatusText("SAVED // LOCAL OK");
    }, 500);
  };

  const copyCodeSnippet = (codeText: string) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(codeText);
      toast.success("Schema definition copied to clipboard.");
    }
  };

  // Toggle bookmark
  const toggleBookmark = (resId: string) => {
    setResources((prev) =>
      prev.map((r) => (r.id === resId ? { ...r, isBookmarked: !r.isBookmarked } : r))
    );
    toast.success("Bookmark updated.");
  };

  // Derived metrics
  const activeOrDoneGoalsCount = goals.filter(
    (g) => g.status === "completed" || g.status === "in_progress"
  ).length;

  const hoursDisplay = Math.floor(totalFocusMinutes / 60);
  const minsDisplay = totalFocusMinutes % 60;

  // Segmented progress for 25m cycle
  const elapsedSecs = 25 * 60 - secondsRemaining;
  const activeSegments = Math.min(5, Math.floor((elapsedSecs / (25 * 60)) * 5));

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-space-xl px-gutter py-space-lg">
      {/* Top Meta HUD Bar */}
      <div className="flex w-full flex-col justify-between gap-space-md rounded-DEFAULT border border-outline-variant/30 bg-surface-container-lowest p-space-md shadow-md md:flex-row md:items-end">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-sm text-primary">
            <span className="h-2 w-2 rounded-DEFAULT bg-secondary"></span>
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
              ENV :: PERSISTENT_SESSION_MODE
            </span>
          </div>
          <h1 className="font-headline-xl text-headline-xl uppercase tracking-tight text-on-surface">
            WORKSPACE // DEEP WORK
          </h1>
        </div>

        <div className="flex flex-col gap-space-xs md:items-end">
          <div className="rounded-DEFAULT bg-surface-container-high px-space-md py-space-xs font-label-md text-label-md uppercase tracking-wider text-tertiary-fixed shadow-sm">
            CYCLE {String(cycleCount).padStart(3, "0")} // FOCUS TIME: {hoursDisplay}h {minsDisplay}
            m
          </div>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-outline">
            AUTONOMIC_STATE: {timerRunning ? "RECORDING_ACTIVE" : "STANDBY"}
          </span>
        </div>
      </div>

      {/* Quick Switcher Tabs Navigation */}
      <div className="flex w-full items-center justify-between overflow-x-auto rounded-DEFAULT border border-outline-variant/20 bg-surface-container-low p-space-xs">
        <div className="flex min-w-max items-center gap-space-xs">
          <button
            onClick={() => setActiveTab("tasks")}
            className={cn(
              "flex cursor-pointer items-center gap-space-xs rounded-DEFAULT px-space-md py-space-sm font-label-md text-label-md font-semibold uppercase tracking-wider shadow-sm transition-transform active:scale-95",
              activeTab === "tasks"
                ? "bg-primary text-on-primary"
                : "bg-surface-container-highest/60 text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
            )}
          >
            <span
              className="material-symbols-outlined text-body-md"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              terminal
            </span>
            <span>Active Tasks</span>
          </button>

          <button
            onClick={() => setActiveTab("notes")}
            className={cn(
              "flex cursor-pointer items-center gap-space-xs rounded-DEFAULT px-space-md py-space-sm font-label-md text-label-md uppercase tracking-wider transition-colors",
              activeTab === "notes"
                ? "bg-primary font-semibold text-on-primary"
                : "bg-surface-container-highest/60 text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
            )}
          >
            <span className="material-symbols-outlined text-body-md">edit_note</span>
            <span>Notes &amp; Synthesis</span>
          </button>

          <button
            onClick={() => setActiveTab("vault")}
            className={cn(
              "flex cursor-pointer items-center gap-space-xs rounded-DEFAULT px-space-md py-space-sm font-label-md text-label-md uppercase tracking-wider transition-colors",
              activeTab === "vault"
                ? "bg-primary font-semibold text-on-primary"
                : "bg-surface-container-highest/60 text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
            )}
          >
            <span className="material-symbols-outlined text-body-md">inventory_2</span>
            <span>Resource Vault</span>
          </button>

          <button
            onClick={() => setActiveTab("milestones")}
            className={cn(
              "flex cursor-pointer items-center gap-space-xs rounded-DEFAULT px-space-md py-space-sm font-label-md text-label-md uppercase tracking-wider transition-colors",
              activeTab === "milestones"
                ? "bg-primary font-semibold text-on-primary"
                : "bg-surface-container-highest/60 text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
            )}
          >
            <span className="material-symbols-outlined text-body-md">alarm</span>
            <span>Milestone Deadlines</span>
          </button>
        </div>

        <div className="hidden items-center gap-space-sm pr-space-sm lg:flex">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
            WORKSPACE SYNC: CLOUD_OK
          </span>
          <span className="h-1.5 w-1.5 rounded-DEFAULT bg-secondary"></span>
        </div>
      </div>

      {/* Main Workspace Grid (60% / 40% Split: 7 Cols vs 5 Cols) */}
      <div className="grid grid-cols-1 items-start gap-space-xl lg:grid-cols-12">
        {/* LEFT COLUMN: Execution & Goals (7 Cols) */}
        <div className="flex flex-col gap-space-xl lg:col-span-7">
          {/* SECTION 01: DAILY LEARNING GOALS */}
          <div
            id="section-goals"
            className="flex flex-col gap-space-md rounded-DEFAULT border border-outline-variant/30 bg-surface-container-lowest p-space-lg shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <span className="font-label-md font-mono text-label-md font-bold uppercase tracking-widest text-secondary">
                  // 01
                </span>
                <h2 className="font-headline-md text-headline-md uppercase tracking-tight text-on-surface">
                  Daily Learning Goals
                </h2>
              </div>
              <span className="rounded-DEFAULT bg-surface-container-high px-space-sm py-0.5 font-label-sm font-mono text-label-sm uppercase tracking-wider text-on-surface-variant">
                {activeOrDoneGoalsCount}/{goals.length} DONE OR ACTIVE
              </span>
            </div>

            {/* Goal Items Stack */}
            <div className="flex flex-col gap-space-sm">
              {goals.map((goal) => {
                if (goal.status === "completed") {
                  return (
                    <div
                      key={goal.id}
                      onClick={() => cycleGoalStatus(goal.id)}
                      className="group flex cursor-pointer items-center justify-between rounded-DEFAULT bg-surface-container-low p-space-md transition-colors hover:bg-surface-container"
                    >
                      <div className="flex min-w-0 items-center gap-space-md">
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-DEFAULT bg-tertiary-fixed">
                          <div className="h-2.5 w-2.5 bg-surface"></div>
                        </div>
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate font-body-md text-body-md text-on-surface-variant line-through">
                            {goal.title}
                          </span>
                          <span className="font-label-sm font-mono text-label-sm uppercase tracking-wider text-outline">
                            {goal.subtitle}
                          </span>
                        </div>
                      </div>
                      <span className="shrink-0 rounded-DEFAULT bg-primary-container/80 px-space-sm py-0.5 font-label-sm font-mono text-label-sm font-semibold uppercase text-on-primary text-primary-fixed">
                        Done
                      </span>
                    </div>
                  );
                }

                if (goal.status === "in_progress") {
                  const progressPct = Math.min(
                    100,
                    Math.round((goal.completedMinutes / goal.targetMinutes) * 100)
                  );
                  return (
                    <div
                      key={goal.id}
                      onClick={() => cycleGoalStatus(goal.id)}
                      className="flex cursor-pointer flex-col gap-space-sm rounded-DEFAULT border border-secondary/30 bg-surface-container-high p-space-md shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-space-md">
                        <div className="flex min-w-0 items-center gap-space-md">
                          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-DEFAULT bg-surface-container-highest">
                            <div className="h-2 w-2 animate-pulse rounded-DEFAULT bg-secondary"></div>
                          </div>
                          <div className="flex min-w-0 flex-col">
                            <span className="truncate font-body-md text-body-md font-medium text-on-surface">
                              {goal.title}
                            </span>
                            <span className="font-label-sm font-mono text-label-sm uppercase tracking-wider text-tertiary-fixed">
                              {goal.subtitle}
                            </span>
                          </div>
                        </div>
                        <span className="shrink-0 rounded-DEFAULT bg-secondary-container px-space-sm py-0.5 font-label-sm font-mono text-label-sm font-semibold uppercase text-on-secondary-container">
                          In Progress
                        </span>
                      </div>
                      {/* Progress Bar */}
                      <div className="h-1.5 w-full overflow-hidden rounded-DEFAULT bg-surface-container-lowest">
                        <div
                          className="h-full rounded-DEFAULT bg-secondary transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={goal.id}
                    onClick={() => cycleGoalStatus(goal.id)}
                    className="flex cursor-pointer items-center justify-between rounded-DEFAULT bg-surface-container-low p-space-md transition-colors hover:bg-surface-container"
                  >
                    <div className="flex min-w-0 items-center gap-space-md">
                      <div className="h-5 w-5 shrink-0 rounded-DEFAULT bg-surface-container-highest"></div>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate font-body-md text-body-md text-on-surface">
                          {goal.title}
                        </span>
                        <span className="font-label-sm font-mono text-label-sm uppercase tracking-wider text-outline">
                          {goal.subtitle}
                        </span>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-DEFAULT bg-surface-container-highest px-space-sm py-0.5 font-label-sm font-mono text-label-sm uppercase tracking-wider text-outline">
                      Pending
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Quick Add Goal Input */}
            <form onSubmit={handleAddGoal} className="relative mt-space-xs flex items-center">
              <span className="absolute left-space-md font-label-md text-label-md font-bold text-primary">
                +
              </span>
              <input
                value={newGoalInput}
                onChange={(e) => setNewGoalInput(e.target.value)}
                className="w-full rounded-DEFAULT border border-outline-variant/30 bg-surface-container-lowest py-space-sm pl-10 pr-space-md font-body-md font-mono text-body-md text-xs uppercase text-on-surface shadow-inner transition-colors placeholder:text-outline focus:bg-surface-container-low focus:outline-none"
                placeholder="QUICK ADD GOAL (ENTER TO DISPATCH)..."
                type="text"
              />
            </form>
          </div>

          {/* SECTION 02: TOPIC COMPLETION & TASK TRACKER */}
          <div
            id="section-tasks"
            className="flex flex-col gap-space-md rounded-DEFAULT border border-outline-variant/30 bg-surface-container-lowest p-space-lg shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <span className="font-label-md font-mono text-label-md font-bold uppercase tracking-widest text-secondary">
                  // 02
                </span>
                <h2 className="font-headline-md text-headline-md uppercase tracking-tight text-on-surface">
                  Task Matrix &amp; Subtasks
                </h2>
              </div>
              <div className="flex items-center gap-space-xs font-label-sm font-mono text-label-sm uppercase text-outline">
                <span className="material-symbols-outlined text-body-md">swap_vert</span>
                <span>DRAG_SORTABLE</span>
              </div>
            </div>

            {/* Interactive Subtask Checklist with Drag & Drop */}
            <div className="flex flex-col gap-space-sm" id="subtask-container">
              {subtasks.map((task, idx) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(idx)}
                  className="group flex cursor-grab items-center justify-between rounded-DEFAULT border border-outline-variant/20 bg-surface-container-low p-space-md transition-colors hover:bg-surface-container active:cursor-grabbing"
                >
                  <div className="flex min-w-0 items-center gap-space-md">
                    <span className="material-symbols-outlined select-none text-outline transition-colors group-hover:text-on-surface-variant">
                      drag_indicator
                    </span>

                    {/* Geometric Checkbox */}
                    <button
                      onClick={() => toggleSubtask(task.id)}
                      className={cn(
                        "flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-DEFAULT transition-all focus:outline-none",
                        task.completed
                          ? "bg-tertiary-fixed"
                          : "bg-surface-container-highest hover:border hover:border-secondary"
                      )}
                    >
                      <div
                        className={cn(
                          "h-2 w-2 bg-surface transition-opacity",
                          task.completed ? "opacity-100" : "opacity-0"
                        )}
                      ></div>
                    </button>

                    <div className="flex min-w-0 flex-col">
                      <span
                        className={cn(
                          "truncate font-body-md text-body-md",
                          task.completed
                            ? "text-on-surface-variant line-through"
                            : "text-on-surface"
                        )}
                      >
                        {task.title}
                      </span>
                      <span className="font-label-sm font-mono text-label-sm uppercase tracking-wider text-outline">
                        {task.dependency}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-space-md">
                    <span
                      className={cn(
                        "rounded-DEFAULT px-space-sm py-0.5 font-label-md font-mono text-label-md",
                        task.completed
                          ? "bg-surface-container-high text-outline"
                          : "bg-surface-container-high font-bold text-tertiary-fixed"
                      )}
                    >
                      {task.durationMinutes} MIN
                    </span>
                    <button
                      onClick={() => deleteSubtask(task.id)}
                      className="material-symbols-outlined cursor-pointer text-body-md text-outline transition-colors hover:text-error"
                      title="Delete subtask"
                    >
                      close
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 03: PERSONAL SYNTHESIS & SCRATCHPAD */}
          <div
            id="section-notes"
            className="flex flex-col gap-space-md rounded-DEFAULT border border-outline-variant/30 bg-surface-container-lowest p-space-lg shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <span className="font-label-md font-mono text-label-md font-bold uppercase tracking-widest text-secondary">
                  // 03
                </span>
                <h2 className="font-headline-md text-headline-md uppercase tracking-tight text-on-surface">
                  Synthesis &amp; Scratchpad
                </h2>
              </div>
              <div className="flex items-center gap-space-sm">
                <span className="h-2 w-2 rounded-DEFAULT bg-secondary"></span>
                <span
                  className="font-label-sm font-mono text-label-sm uppercase tracking-wider text-on-surface-variant"
                  id="sync-status"
                >
                  {syncStatusText}
                </span>
              </div>
            </div>

            {/* Markdown Content Editor */}
            <div className="flex flex-col gap-space-sm rounded-DEFAULT border border-outline-variant/20 bg-surface-container-low p-space-md">
              <div className="flex items-center justify-between pb-space-xs font-label-sm font-mono text-label-sm uppercase text-outline">
                <span>MARKDOWN EDITOR // ATOM_VIEWER</span>
                <div className="flex items-center gap-space-sm">
                  <span
                    onClick={() => setEditorMode("preview")}
                    className={cn(
                      "cursor-pointer transition-colors",
                      editorMode === "preview"
                        ? "font-bold text-tertiary-fixed"
                        : "hover:text-on-surface"
                    )}
                  >
                    PREVIEW
                  </span>
                  <span>/</span>
                  <span
                    onClick={() => setEditorMode("raw")}
                    className={cn(
                      "cursor-pointer transition-colors",
                      editorMode === "raw"
                        ? "font-bold text-tertiary-fixed"
                        : "hover:text-on-surface"
                    )}
                  >
                    RAW
                  </span>
                </div>
              </div>

              {editorMode === "raw" ? (
                <textarea
                  value={markdownContent}
                  onChange={(e) => handleMarkdownChange(e.target.value)}
                  className="min-h-[140px] w-full resize-none bg-transparent font-body-md text-body-md leading-relaxed text-on-surface focus:outline-none"
                  placeholder="Log technical takeaways, algorithmic edge cases, and design trade-offs..."
                  rows={5}
                />
              ) : (
                <div className="min-h-[140px] w-full space-y-2 font-body-md text-body-md leading-relaxed text-on-surface">
                  <div className="font-headline-sm font-bold text-tertiary-fixed">
                    PostgreSQL Isolation Levels &amp; Idempotency Keys
                  </div>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-on-surface-variant">
                    <li>
                      Idempotency guarantees require unique constraint validation directly on{" "}
                      <code className="rounded bg-surface-container px-1 py-0.5 font-mono text-xs text-secondary">
                        idempotency_key
                      </code>
                    </li>
                    <li>
                      Serializable transactions mitigate write-skew anomalies when orchestrating
                      concurrent state updates
                    </li>
                    <li>
                      Ensure cache invalidation cascades immediately prior to returning 201 Created
                    </li>
                  </ul>
                </div>
              )}

              {/* Code Snippet Box */}
              <div className="mt-space-xs flex flex-col gap-space-xs rounded-DEFAULT border border-outline-variant/30 bg-surface-container-highest p-space-md">
                <div className="flex items-center justify-between font-label-sm font-mono text-label-sm uppercase text-on-surface-variant">
                  <span>SQL // SCHEMA_DEFINITION</span>
                  <button
                    onClick={() =>
                      copyCodeSnippet(
                        "CREATE UNIQUE INDEX idx_transactions_idem_key \nON transactions (idempotency_key) \nWHERE status != 'FAILED';"
                      )
                    }
                    className="flex cursor-pointer items-center gap-1 font-bold text-tertiary-fixed transition-colors hover:text-on-surface"
                  >
                    <span className="material-symbols-outlined text-body-sm">content_copy</span>
                    <span>COPY</span>
                  </button>
                </div>
                <pre className="overflow-x-auto whitespace-pre rounded-DEFAULT border border-outline-variant/20 bg-surface-container-lowest p-space-xs font-label-md font-mono text-label-md text-primary">
                  <code>
                    {`CREATE UNIQUE INDEX idx_transactions_idem_key 
ON transactions (idempotency_key) 
WHERE status != 'FAILED';`}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Resources & Deadlines (5 Cols) */}
        <div className="flex flex-col gap-space-xl lg:col-span-5">
          {/* SECTION: FOCUS TIMER WIDGET (BRUTALIST ARCHITECTURAL HUD) */}
          <div
            id="section-timer"
            className="flex flex-col gap-space-md rounded-DEFAULT border border-outline-variant/30 bg-surface-container-lowest p-space-lg shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <span className="font-label-md font-mono text-label-md font-bold uppercase tracking-widest text-secondary">
                  // FOCUS_ENGINE
                </span>
                <h2 className="font-headline-sm text-headline-sm uppercase tracking-tight text-on-surface">
                  Pomodoro Rig
                </h2>
              </div>
              <span className="rounded-DEFAULT bg-primary-container px-space-sm py-0.5 font-label-sm font-mono text-label-sm font-bold uppercase text-primary">
                25m CYCLE
              </span>
            </div>

            <div className="flex flex-col items-center justify-center gap-space-md rounded-DEFAULT border border-outline-variant/20 bg-surface-container-low p-space-lg">
              {/* Digital Readout Display */}
              <div className="flex flex-col items-center">
                <span
                  className="font-headline-xl font-mono text-headline-xl font-bold tracking-tighter text-on-surface"
                  id="timer-display"
                >
                  {formatTimer(secondsRemaining)}
                </span>
                <span className="mt-space-xs font-label-sm font-mono text-label-sm uppercase tracking-widest text-outline">
                  AUTONOMIC CADENCE // BLOCK 02
                </span>
              </div>

              {/* Segmented Brutalist Progress Bar */}
              <div className="grid h-2 w-full grid-cols-5 gap-1.5">
                {[0, 1, 2, 3, 4].map((segIdx) => (
                  <div
                    key={segIdx}
                    className={cn(
                      "rounded-DEFAULT transition-all duration-300",
                      segIdx < activeSegments ? "bg-secondary" : "bg-surface-container-highest"
                    )}
                  ></div>
                ))}
              </div>

              {/* Controls */}
              <div className="mt-space-xs grid w-full grid-cols-2 gap-space-sm">
                <button
                  onClick={toggleTimer}
                  className={cn(
                    "flex cursor-pointer items-center justify-center gap-space-xs rounded-DEFAULT py-space-sm font-label-md text-label-md font-bold uppercase tracking-wider shadow-sm transition-colors",
                    timerRunning
                      ? "bg-error-container text-on-error-container hover:bg-error hover:text-white"
                      : "bg-secondary text-on-secondary hover:bg-secondary-fixed"
                  )}
                  id="timer-btn"
                >
                  <span
                    className="material-symbols-outlined text-body-md"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {timerRunning ? "pause" : "play_arrow"}
                  </span>
                  <span>
                    {timerRunning
                      ? "Pause Focus"
                      : secondsRemaining < 25 * 60
                        ? "Resume Focus"
                        : "Start Focus"}
                  </span>
                </button>

                <button
                  onClick={resetTimer}
                  className="flex cursor-pointer items-center justify-center gap-space-xs rounded-DEFAULT border border-outline-variant/30 bg-surface-container-high py-space-sm font-label-md text-label-md uppercase tracking-wider text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-body-md">restart_alt</span>
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>

          {/* SECTION: BOOKMARKED RESOURCES & VAULT */}
          <div
            id="section-vault"
            className="flex flex-col gap-space-md rounded-DEFAULT border border-outline-variant/30 bg-surface-container-lowest p-space-lg shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <span className="font-label-md font-mono text-label-md font-bold uppercase tracking-widest text-secondary">
                  // VAULT
                </span>
                <h2 className="font-headline-sm text-headline-sm uppercase tracking-tight text-on-surface">
                  Bookmarked Resources
                </h2>
              </div>
              <Link
                href="/resources"
                className="font-label-sm font-mono text-label-sm font-bold uppercase tracking-wider text-tertiary-fixed hover:underline"
              >
                VIEW ALL
              </Link>
            </div>

            <div className="flex flex-col gap-space-sm">
              {resources.map((res) => (
                <div
                  key={res.id}
                  className="group flex cursor-pointer items-center justify-between rounded-DEFAULT border border-outline-variant/20 bg-surface-container-low p-space-md transition-colors hover:bg-surface-container"
                >
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex min-w-0 flex-1 items-center gap-space-md"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-DEFAULT bg-surface-container-highest text-primary">
                      <span
                        className={cn("material-symbols-outlined text-headline-sm", res.iconColor)}
                      >
                        {res.iconName}
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate font-body-md text-body-md font-medium text-on-surface transition-colors group-hover:text-primary">
                        {res.title}
                      </span>
                      <div className="mt-0.5 flex items-center gap-space-sm">
                        <span className="rounded-DEFAULT bg-surface-container-high px-space-xs py-0.5 font-label-sm font-mono text-label-sm text-tertiary-fixed">
                          {res.category}
                        </span>
                        <span className="font-label-sm font-mono text-label-sm text-outline">
                          {res.typeMeta}
                        </span>
                      </div>
                    </div>
                  </a>

                  <button
                    onClick={() => toggleBookmark(res.id)}
                    className="material-symbols-outlined shrink-0 cursor-pointer p-1 text-tertiary transition-colors hover:text-tertiary-fixed"
                    style={{
                      fontVariationSettings: res.isBookmarked ? "'FILL' 1" : "'FILL' 0",
                    }}
                    title="Toggle bookmark"
                  >
                    bookmark
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION: UPCOMING MILESTONES & DEADLINES */}
          <div
            id="section-milestones"
            className="flex flex-col gap-space-md rounded-DEFAULT border border-outline-variant/30 bg-surface-container-lowest p-space-lg shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <span className="font-label-md font-mono text-label-md font-bold uppercase tracking-widest text-secondary">
                  // TIMELINE
                </span>
                <h2 className="font-headline-sm text-headline-sm uppercase tracking-tight text-on-surface">
                  Milestones &amp; Deadlines
                </h2>
              </div>
              <span className="material-symbols-outlined text-outline">schedule</span>
            </div>

            <div className="flex flex-col gap-space-md">
              {milestones.map((m) => (
                <div
                  key={m.id}
                  className="flex flex-col gap-space-sm rounded-DEFAULT border border-outline-variant/20 bg-surface-container-low p-space-md shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "rounded-DEFAULT px-space-sm py-0.5 font-label-sm font-mono text-label-sm font-semibold uppercase",
                        m.isCritical
                          ? "bg-tertiary-fixed font-bold text-on-tertiary-fixed"
                          : "bg-surface-container-high text-on-surface-variant"
                      )}
                    >
                      {m.categoryTag}
                    </span>
                    <span
                      className={cn(
                        "font-label-md font-mono text-label-md",
                        m.isCritical ? "font-bold text-tertiary-fixed" : "text-outline"
                      )}
                    >
                      DUE IN {m.daysRemaining} DAYS
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <h3 className="font-headline-sm text-headline-sm tracking-tight text-on-surface">
                      {m.title}
                    </h3>
                    <p className="mt-0.5 font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
                      {m.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-outline-variant/20 pt-space-xs">
                    <span className="font-label-sm font-mono text-label-sm uppercase text-outline">
                      {m.refCode}
                    </span>
                    <button
                      onClick={() => {
                        toast.info(`Opened rubric / preparation for ${m.title}`);
                      }}
                      className={cn(
                        "flex cursor-pointer items-center gap-1 font-label-sm text-label-sm font-bold uppercase tracking-wider",
                        m.isCritical
                          ? "text-primary hover:underline"
                          : "text-on-surface-variant hover:text-on-surface"
                      )}
                    >
                      <span>{m.actionText}</span>
                      <span className="material-symbols-outlined text-body-sm">arrow_forward</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
