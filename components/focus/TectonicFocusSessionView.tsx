"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  fetchRoadmaps,
  fetchUserProfileApi,
  createNoteApi,
  deleteNoteApi,
  fetchStudySessions,
  logManualStudySessionApi,
} from "@/services/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type SessionState = "WORKING" | "PAUSED" | "RECOVERY" | "COMPLETED";

interface SubObjective {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: string;
  isTarget?: boolean;
}

interface ScratchNote {
  id: string;
  timestamp: string;
  content: string;
  category?: string;
  dbId?: string;
}

interface BoundSpec {
  id: string;
  title: string;
  type: string;
  url: string;
  source: string;
}

interface PastSessionRecord {
  _id: string;
  title: string;
  durationMinutes: number;
  sessionDate: string;
  reflection?: string;
}

const DEFAULT_SUB_OBJECTIVES: SubObjective[] = [
  {
    id: "obj-1",
    text: "Parse incoming X-Idempotency-Key header with UUIDv4 validation",
    completed: true,
    completedAt: "14:22 UTC",
  },
  {
    id: "obj-2",
    text: "Acquire distributed Redis Redlock with 10s lease and 150ms retry jitter",
    completed: false,
    isTarget: true,
  },
  {
    id: "obj-3",
    text: "Replay cached idempotency payload on duplicate key collision",
    completed: false,
  },
  {
    id: "obj-4",
    text: "Commit atomic write-ahead ledger entry with state machine commit",
    completed: false,
  },
];

const DEFAULT_NOTES: ScratchNote[] = [
  {
    id: "n-1",
    timestamp: "14:38:10 UTC",
    content:
      "Redis Redlock quorum requires (N/2)+1 nodes. With 3-node cluster, quorum is 2. Clock drift must not exceed validity factor (0.01).",
    category: "CONSENSUS",
  },
  {
    id: "n-2",
    timestamp: "14:15:22 UTC",
    content:
      "Sendfile zero-copy disk writes bypass user space memory buffers when streaming replay segments back to ingress workers.",
    category: "PERF",
  },
];

const DEFAULT_SPECS: BoundSpec[] = [
  {
    id: "spec-1",
    title: "RFC 9110 HTTP Semantics § 9.3.8 (Idempotent Methods)",
    type: "RFC / IETF SPEC",
    url: "https://www.rfc-editor.org/rfc/rfc9110.html#section-9.3.8",
    source: "IETF RFC 9110",
  },
  {
    id: "spec-2",
    title: "Redis Distributed Lock Algorithm Whitepaper",
    type: "DISTRIBUTED SYSTEMS SPEC",
    url: "https://redis.io/docs/latest/develop/use/patterns/distributed-locks/",
    source: "REDIS ARCHIVE",
  },
];

const INITIAL_CODE_SNIPPET = `package transactions

import (
    "context"
    "crypto/rand"
    "math/big"
    "time"
    "github.com/go-redsync/redsync/v4"
)

// AcquireLockWithJitter prevents thundering herd on partition heal
func (v *Validator) AcquireLockWithJitter(ctx context.Context, key string) (*redsync.Mutex, error) {
    baseTTL := 10 * time.Second
    // 5-15% random TTL jitter injected
    jitterMs, _ := rand.Int(rand.Reader, big.NewInt(1500))
    effectiveTTL := baseTTL + time.Duration(jitterMs.Int64())*time.Millisecond

    mutex := v.rs.NewMutex("lock:"+key, redsync.WithExpiry(effectiveTTL))
    if err := mutex.LockContext(ctx); err != nil {
        return nil, ErrDuplicateTransactionInProgress
    }
    return mutex, nil
}`;

const LOCAL_STORAGE_KEY = "mypath_focus_session_v2";

export function TectonicFocusSessionView() {
  const router = useRouter();

  // Session State Machine: WORKING, PAUSED, RECOVERY, COMPLETED
  const [sessionState, setSessionState] = useState<SessionState>("WORKING");
  const [cycleIndex, setCycleIndex] = useState(2);
  const [totalCycles] = useState(3);

  // Focus Durations (seconds)
  const [workDurationSec, setWorkDurationSec] = useState(50 * 60); // 50 mins default
  const [recoveryDurationSec, setRecoveryDurationSec] = useState(10 * 60); // 10 mins default

  // Seconds Left in current interval
  const [secondsLeft, setSecondsLeft] = useState(38 * 60 + 42); // 38:42 default
  const [elapsedSec, setElapsedSec] = useState(11 * 60 + 18); // 11m 18s elapsed

  // Blinders Distraction-Reduction Mode
  const [blindersActive, setBlindersActive] = useState(false);

  // Objectives & Micro-Syllabus
  const [roadmapTitle, setRoadmapTitle] = useState("FULL STACK DEVELOPMENT");
  const [moduleTitle, setModuleTitle] = useState("MODULE 04: BACKEND DEVELOPMENT");
  const [targetDeliverable, setTargetDeliverable] = useState(
    "Implement Distributed Idempotency Key Validation on Write-Ahead Transaction Pipeline"
  );
  const [targetDescription, setTargetDescription] = useState(
    "Guarantee strictly-once transaction execution semantics under heavy network partitions and out-of-order ingress payloads utilizing Redis Redlock clusters."
  );
  const [objectives, setObjectives] = useState<SubObjective[]>(DEFAULT_SUB_OBJECTIVES);
  const [newObjectiveText, setNewObjectiveText] = useState("");
  const [editingObjective, setEditingObjective] = useState<SubObjective | null>(null);

  // Scratchpad Code & Notes
  const [codeContent, setCodeContent] = useState(INITIAL_CODE_SNIPPET);
  const [isEditingCode, setIsEditingCode] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [notes, setNotes] = useState<ScratchNote[]>(DEFAULT_NOTES);
  const [newNoteInput, setNewNoteInput] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [editingNote, setEditingNote] = useState<ScratchNote | null>(null);

  // Bound Specifications
  const [specs, setSpecs] = useState<BoundSpec[]>(DEFAULT_SPECS);
  const [showAttachSpecModal, setShowAttachSpecModal] = useState(false);
  const [newSpecForm, setNewSpecForm] = useState({
    title: "",
    type: "RFC / WHITE PAPER",
    url: "",
    source: "",
  });

  // Past Sessions History Modal
  const [showPastSessionsModal, setShowPastSessionsModal] = useState(false);
  const [pastSessions, setPastSessions] = useState<PastSessionRecord[]>([]);

  // Modals
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);

  // Timer Ref for timestamp calculations
  const lastTickRef = useRef<number>(Date.now());

  // 1. Initial State Recovery from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.sessionState) setSessionState(parsed.sessionState);
        if (parsed.cycleIndex) setCycleIndex(parsed.cycleIndex);
        if (parsed.workDurationSec) setWorkDurationSec(parsed.workDurationSec);
        if (parsed.recoveryDurationSec) setRecoveryDurationSec(parsed.recoveryDurationSec);
        if (parsed.objectives?.length) setObjectives(parsed.objectives);
        if (parsed.notes?.length) setNotes(parsed.notes);
        if (parsed.codeContent) setCodeContent(parsed.codeContent);

        // Resume timer accurately based on wall-clock delta if was working
        if (parsed.sessionState === "WORKING" && parsed.lastSavedTimestamp) {
          const deltaSec = Math.floor((Date.now() - parsed.lastSavedTimestamp) / 1000);
          const nextRemaining = Math.max(0, (parsed.secondsLeft || 0) - deltaSec);
          const nextElapsed = (parsed.elapsedSec || 0) + deltaSec;
          setSecondsLeft(nextRemaining);
          setElapsedSec(nextElapsed);
        } else if (parsed.secondsLeft !== undefined) {
          setSecondsLeft(parsed.secondsLeft);
          setElapsedSec(parsed.elapsedSec || 0);
        }
      }
    } catch {
      // Graceful fallback to default
    }
  }, []);

  // 2. Persist Active Session to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          sessionState,
          cycleIndex,
          workDurationSec,
          recoveryDurationSec,
          secondsLeft,
          elapsedSec,
          lastSavedTimestamp: Date.now(),
          objectives,
          notes,
          codeContent,
        })
      );
    } catch {
      // Handle storage quota gracefully
    }
  }, [
    sessionState,
    cycleIndex,
    workDurationSec,
    recoveryDurationSec,
    secondsLeft,
    elapsedSec,
    objectives,
    notes,
    codeContent,
  ]);

  // 3. Fetch user preferred focus interval from Scholar Profile & MongoDB Roadmaps
  useEffect(() => {
    let mounted = true;

    fetchUserProfileApi()
      .then((prof) => {
        if (!mounted || !prof?.preferences?.focusInterval) return;
        const interval = prof.preferences.focusInterval;
        if (interval.includes("25m")) {
          setWorkDurationSec(25 * 60);
          setRecoveryDurationSec(5 * 60);
        } else if (interval.includes("90m")) {
          setWorkDurationSec(90 * 60);
          setRecoveryDurationSec(20 * 60);
        } else {
          setWorkDurationSec(50 * 60);
          setRecoveryDurationSec(10 * 60);
        }
      })
      .catch(() => {});

    fetchRoadmaps()
      .then((rmList) => {
        if (!mounted || !Array.isArray(rmList) || rmList.length === 0) return;
        setRoadmapTitle(rmList[0].title.toUpperCase());
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  // 4. High-Precision Interval Timer
  useEffect(() => {
    if (sessionState !== "WORKING" && sessionState !== "RECOVERY") return;

    lastTickRef.current = Date.now();
    const interval = setInterval(() => {
      const now = Date.now();
      const deltaSec = Math.floor((now - lastTickRef.current) / 1000);

      if (deltaSec >= 1) {
        lastTickRef.current = now;
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            handleIntervalZero();
            return 0;
          }
          return prev - deltaSec;
        });

        if (sessionState === "WORKING") {
          setElapsedSec((prev) => prev + deltaSec);
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [sessionState]);

  // When timer hits zero
  const handleIntervalZero = () => {
    if (sessionState === "WORKING") {
      toast.success("Focus block completed! Triggering system recovery.");
      setSessionState("RECOVERY");
      setSecondsLeft(recoveryDurationSec);
    } else if (sessionState === "RECOVERY") {
      toast.info("Recovery interval finished. Commencing next cycle.");
      if (cycleIndex < totalCycles) {
        setCycleIndex((prev) => prev + 1);
        setSessionState("WORKING");
        setSecondsLeft(workDurationSec);
      } else {
        setSessionState("COMPLETED");
      }
    }
  };

  // Format MM:SS or HH:MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Toggle Pause / Resume
  const handleTogglePause = () => {
    if (sessionState === "WORKING") {
      setSessionState("PAUSED");
      toast.info("Cadence paused. Elapsed time preserved.");
    } else if (sessionState === "PAUSED") {
      setSessionState("WORKING");
      toast.success("Cadence resumed.");
    }
  };

  // Toggle Objective Completion
  const handleToggleObjective = (id: string) => {
    setObjectives((prev) =>
      prev.map((obj) => {
        if (obj.id === id) {
          const nextCompleted = !obj.completed;
          return {
            ...obj,
            completed: nextCompleted,
            completedAt: nextCompleted
              ? new Date().toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                }) + " UTC"
              : undefined,
          };
        }
        return obj;
      })
    );
  };

  // Add Sub-objective
  const handleAddObjective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObjectiveText.trim()) return;

    const newObj: SubObjective = {
      id: `obj-${Date.now()}`,
      text: newObjectiveText.trim(),
      completed: false,
    };
    setObjectives((prev) => [...prev, newObj]);
    setNewObjectiveText("");
    toast.success("Sub-objective added to active mission.");
  };

  // Delete Objective
  const handleDeleteObjective = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setObjectives((prev) => prev.filter((o) => o.id !== id));
    toast.info("Objective removed.");
  };

  // Move Objective Up / Down
  const handleMoveObjective = (index: number, direction: "up" | "down", e: React.MouseEvent) => {
    e.stopPropagation();
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= objectives.length) return;

    const updated = [...objectives];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);
    setObjectives(updated);
  };

  // Save Edited Objective
  const handleSaveEditedObjective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingObjective) return;
    setObjectives((prev) => prev.map((o) => (o.id === editingObjective.id ? editingObjective : o)));
    setEditingObjective(null);
    toast.success("Objective updated.");
  };

  // Push Note
  const handlePushNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteInput.trim() || isSavingNote) return;

    setIsSavingNote(true);
    const text = newNoteInput.trim();
    const nowTime =
      new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }) + " UTC";

    const noteItem: ScratchNote = {
      id: `note-${Date.now()}`,
      timestamp: nowTime,
      content: text,
      category: "SESSION_INSIGHT",
    };

    setNotes((prev) => [noteItem, ...prev]);
    setNewNoteInput("");

    try {
      const createdNote = await createNoteApi({
        title: `Focus Note // ${targetDeliverable.slice(0, 32)}`,
        content: text,
        tags: ["focus-session", "deep-work"],
      });
      if (createdNote?._id) {
        noteItem.dbId = createdNote._id;
      }
      toast.success("Insight buffered and saved to Session Vault.");
    } catch {
      // Gracefully retained in local scratchpad
    } finally {
      setIsSavingNote(false);
    }
  };

  // Delete Note
  const handleDeleteNote = async (id: string, dbId?: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    toast.info("Note removed from buffer.");
    if (dbId) {
      deleteNoteApi(dbId).catch(() => {});
    }
  };

  // Save Edited Note
  const handleSaveEditedNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNote) return;
    setNotes((prev) => prev.map((n) => (n.id === editingNote.id ? editingNote : n)));
    setEditingNote(null);
    toast.success("Note insight updated.");
  };

  // Insert AI Jitter Pattern
  const handleInsertJitterPattern = () => {
    const jitterCode = `// [PATHFINDER SENTINEL APPLIED] Random TTL Jitter added:
jitterMs, _ := rand.Int(rand.Reader, big.NewInt(1500))
effectiveTTL := baseTTL + time.Duration(jitterMs.Int64())*time.Millisecond // 5-15% random jitter prevents thundering herd`;

    setCodeContent((prev) => {
      if (prev.includes("jitterMs")) return prev;
      return prev.replace(
        "baseTTL := 10 * time.Second",
        `baseTTL := 10 * time.Second\n    ${jitterCode}`
      );
    });

    toast.success("Applied random TTL jitter boilerplate into code specification.", {
      description: "Heuristic Sentinel pattern active.",
    });
  };

  // Copy Code to Clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeContent).catch(() => {});
    setCodeCopied(true);
    toast.success("Code specification copied to clipboard.");
    setTimeout(() => setCodeCopied(false), 2000);
  };

  // Remove Spec
  const handleRemoveSpec = (id: string) => {
    setSpecs((prev) => prev.filter((s) => s.id !== id));
    toast.info("Specification unlinked from session.");
  };

  // Complete Block & Trigger Recovery
  const handleCompleteBlockAndRecovery = async () => {
    const durationMinutes = Math.max(1, Math.round(elapsedSec / 60));

    try {
      await logManualStudySessionApi({
        title: targetDeliverable,
        sessionDate: new Date().toISOString().split("T")[0],
        durationMinutes: durationMinutes,
        reflection: `Deep work cadence on ${targetDeliverable}. Completed ${objectives.filter((o) => o.completed).length} of ${objectives.length} sub-objectives.`,
      });
      toast.success(`Completed ${durationMinutes}m focus block. Logged to database.`);
    } catch (err: any) {
      console.warn("Could not save session to MongoDB:", err);
    }

    setSessionState("RECOVERY");
    setSecondsLeft(recoveryDurationSec);
    setShowRecoveryModal(true);
  };

  // Terminate & Log partial session
  const handleTerminateAndLog = async () => {
    const durationMinutes = Math.max(1, Math.round(elapsedSec / 60));

    try {
      await logManualStudySessionApi({
        title: `[TERMINATED] ${targetDeliverable}`,
        sessionDate: new Date().toISOString().split("T")[0],
        durationMinutes: durationMinutes,
        reflection: `Cadence terminated early at ${durationMinutes} minutes. ${objectives.filter((o) => o.completed).length} sub-objectives mastered.`,
      });
      toast.info(`Session ended. ${durationMinutes}m logged.`);
    } catch {
      // Handled
    }

    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {}

    setShowTerminateModal(false);
    router.push("/workspace");
  };

  // Open Past Sessions Modal
  const handleOpenPastSessions = async () => {
    setShowPastSessionsModal(true);
    try {
      const data = await fetchStudySessions();
      if (Array.isArray(data)) {
        setPastSessions(
          data.map((s: any) => ({
            _id: s._id,
            title: s.title || "Focus Cadence",
            durationMinutes: s.durationMinutes || s.duration || 0,
            sessionDate: s.sessionDate || s.createdAt?.split("T")[0] || "Recent",
            reflection: s.reflection,
          }))
        );
      }
    } catch {
      // Handled
    }
  };

  // Progress Bar percentage calculation
  const totalDuration = workDurationSec;
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((elapsedSec / totalDuration) * 100))
  );

  return (
    <div
      className={cn(
        "flex min-h-screen w-full flex-col bg-surface font-body-md text-on-surface antialiased transition-all duration-300 selection:bg-secondary selection:text-surface-container-lowest",
        blindersActive && "bg-[#0d0e0e]"
      )}
    >
      {/* 1. TOP SESSION RIBBON — ARCHITECTURAL STATUS BAR */}
      <div className="sticky top-20 z-40 w-full border-b border-outline-variant/40 bg-surface-container-lowest">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-space-sm px-gutter py-2 font-mono text-xs md:flex-row md:items-center">
          {/* Breadcrumb Hierarchy */}
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap text-outline">
            <span>ROADMAPS</span>
            <span className="text-surface-container-highest">/</span>
            <span className="font-bold text-secondary">{roadmapTitle}</span>
            <span className="text-surface-container-highest">/</span>
            <span className="text-tertiary-fixed">{moduleTitle}</span>
            <span className="text-surface-container-highest">/</span>
            <span className="font-bold text-primary">ACTIVE FOCUS RIG</span>
          </div>

          {/* Controls Group */}
          <div className="flex shrink-0 flex-wrap items-center gap-space-sm">
            <div className="flex items-center gap-1.5 rounded-DEFAULT border border-outline-variant/30 bg-surface-container px-2 py-0.5 text-[10px] font-bold uppercase text-tertiary-fixed">
              <span className="h-2 w-2 animate-pulse rounded-full bg-secondary"></span>
              <span>LIVE TELEMETRY STREAM // CADENCE ACTIVE</span>
            </div>

            <button
              onClick={handleOpenPastSessions}
              className="rounded-DEFAULT border border-outline-variant/40 bg-surface-container px-2.5 py-1 text-[11px] font-bold uppercase text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
            >
              PAST SESSIONS
            </button>

            <button
              onClick={handleTogglePause}
              className={cn(
                "rounded-DEFAULT border px-2.5 py-1 text-[11px] font-bold uppercase transition-colors",
                sessionState === "PAUSED"
                  ? "border-secondary bg-secondary text-surface-container-lowest"
                  : "border-outline-variant/40 bg-surface-container text-on-surface hover:bg-surface-container-high"
              )}
            >
              {sessionState === "PAUSED" ? "RESUME CADENCE" : "PAUSE CADENCE"}
            </button>

            <button
              onClick={() => {
                setBlindersActive(!blindersActive);
                toast.info(blindersActive ? "Blinders Mode Disabled" : "Blinders Mode Locked [ON]");
              }}
              className={cn(
                "flex items-center gap-1 rounded-DEFAULT border px-2.5 py-1 text-[11px] font-bold uppercase transition-colors",
                blindersActive
                  ? "border-tertiary-fixed bg-tertiary-fixed text-surface-container-lowest"
                  : "border-outline-variant/40 bg-surface-container text-outline hover:bg-surface-container-high"
              )}
            >
              <span className="material-symbols-outlined text-[14px]">visibility_off</span>
              <span>BLINDERS: {blindersActive ? "LOCKED [ON]" : "[OFF]"}</span>
            </button>

            <button
              onClick={() => setShowTerminateModal(true)}
              className="rounded-DEFAULT border border-outline-variant/40 bg-surface-container px-2.5 py-1 text-[11px] font-bold uppercase text-error transition-colors hover:bg-surface-container-high hover:text-white"
            >
              TERMINATE &amp; LOG
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-space-lg px-gutter py-space-md">
        {/* 2. MAIN FOCUS STAGE: CHRONOMETER (5 COLS) & MISSION (7 COLS) */}
        <section className="grid grid-cols-1 items-stretch gap-space-lg lg:grid-cols-12">
          {/* CHRONOMETER DISPLAY (5 COLS) */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-DEFAULT border border-outline-variant/40 bg-surface-container-low p-space-lg shadow-xl lg:col-span-5">
            <div className="flex items-center justify-between border-b border-surface-container-highest/60 pb-space-sm font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-secondary">timer</span>
                <span className="font-bold uppercase tracking-wider text-secondary">
                  SYS.CHRONO // CADENCE ENGINE
                </span>
              </div>
              <span className="rounded-DEFAULT border border-outline-variant/30 bg-surface-container px-2 py-0.5 font-bold text-tertiary-fixed">
                CYCLE 0{cycleIndex} / 0{totalCycles}
              </span>
            </div>

            {/* Huge Chronometer Digits */}
            <div className="flex flex-col items-center justify-center py-space-xl text-center">
              <div className="select-none font-headline-xl font-mono text-[76px] font-black leading-none tracking-tighter text-on-surface lg:text-[88px]">
                {formatTime(secondsLeft)}
              </div>
              <div className="mt-2 font-mono text-xs uppercase tracking-widest text-outline">
                {sessionState === "WORKING" && (
                  <span className="flex items-center gap-1.5 font-bold text-secondary">
                    <span className="h-2 w-2 animate-ping rounded-full bg-secondary"></span>
                    ACTIVE DEEP WORK INTERVAL // CONCENTRATION LOCKED
                  </span>
                )}
                {sessionState === "PAUSED" && (
                  <span className="font-bold text-tertiary-fixed">
                    CADENCE SUSPENDED // CLOCK RETAINED
                  </span>
                )}
                {sessionState === "RECOVERY" && (
                  <span className="font-bold text-primary">
                    SYSTEM RECOVERY IN PROGRESS // HYDRATE &amp; REST
                  </span>
                )}
              </div>
            </div>

            {/* Segmented Progress Matrix */}
            <div className="flex flex-col gap-space-xs border-t border-surface-container-highest/60 pt-space-md">
              {/* Segmented Bar */}
              <div className="grid h-3 w-full grid-cols-10 gap-1">
                {Array.from({ length: 10 }).map((_, idx) => {
                  const segThreshold = (idx + 1) * 10;
                  const isElapsed = progressPercent >= segThreshold;
                  const isCurrent = !isElapsed && progressPercent >= idx * 10;
                  return (
                    <div
                      key={idx}
                      className={cn(
                        "rounded-sm transition-all duration-300",
                        isElapsed
                          ? "bg-secondary"
                          : isCurrent
                            ? "animate-pulse bg-tertiary-fixed"
                            : "bg-surface-container-highest"
                      )}
                    />
                  );
                })}
              </div>

              {/* Stats Row */}
              <div className="flex justify-between pt-1 font-mono text-[11px] text-outline">
                <span className="font-bold text-secondary">{progressPercent}% CONSUMED</span>
                <span>ELAPSED: {formatTime(elapsedSec)}</span>
                <span>REMAINING: {formatTime(secondsLeft)}</span>
                <span className="text-tertiary-fixed">TARGET: {formatTime(workDurationSec)}</span>
              </div>
            </div>
          </div>

          {/* MISSION & MICRO-SYLLABUS (7 COLS) */}
          <div className="flex flex-col justify-between rounded-DEFAULT border border-outline-variant/40 bg-surface-container-low p-space-lg shadow-xl lg:col-span-7">
            <div className="flex flex-col gap-space-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-1 font-mono text-xs font-bold uppercase tracking-widest text-secondary">
                  <span className="h-1.5 w-1.5 rounded-DEFAULT bg-secondary"></span>
                  // TARGET DELIVERABLE FOR THIS SESSION
                </span>
                <span className="rounded-DEFAULT border border-outline-variant/30 bg-surface-container px-2 py-0.5 font-mono text-[10px] uppercase text-outline">
                  EST. 10.0 HRS // 4 CREDITS
                </span>
              </div>

              <h2 className="font-headline-sm text-2xl font-bold uppercase tracking-tight text-on-surface">
                {targetDeliverable}
              </h2>
              <p className="font-body-sm leading-relaxed text-on-surface-variant">
                {targetDescription}
              </p>
            </div>

            {/* Synchronized Sub-objectives Checklist */}
            <div className="mt-space-md flex flex-col gap-space-xs border-t border-surface-container-highest/60 pt-space-sm">
              <span className="block font-mono text-[11px] uppercase tracking-wider text-outline">
                Session Sub-Objectives Checklist:
              </span>

              <div className="flex flex-col gap-1.5">
                {objectives.map((obj, idx) => (
                  <div
                    key={obj.id}
                    onClick={() => handleToggleObjective(obj.id)}
                    className={cn(
                      "group flex cursor-pointer items-start justify-between gap-3 rounded-DEFAULT border p-2.5 transition-all",
                      obj.completed
                        ? "border-outline-variant/30 bg-surface-container/60 text-outline"
                        : obj.isTarget
                          ? "border-secondary/60 bg-surface-container text-on-surface shadow-[2px_2px_0px_#86db70]"
                          : "border-outline-variant/30 bg-surface-container text-on-surface hover:border-outline-variant/60"
                    )}
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-2.5">
                      <div
                        className={cn(
                          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-none border transition-colors",
                          obj.completed
                            ? "border-tertiary-fixed bg-tertiary-fixed text-surface-container-lowest"
                            : "border-secondary bg-surface-container-lowest"
                        )}
                      >
                        {obj.completed && (
                          <span className="material-symbols-outlined text-[13px] font-bold">
                            check
                          </span>
                        )}
                      </div>

                      <span
                        className={cn(
                          "break-words font-mono text-xs",
                          obj.completed && "line-through opacity-70"
                        )}
                      >
                        {obj.text}
                      </span>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 font-mono text-[10px]">
                      {obj.completed ? (
                        <span className="text-secondary">{obj.completedAt || "DONE"}</span>
                      ) : obj.isTarget ? (
                        <span className="py-0.2 rounded-DEFAULT bg-secondary px-1.5 font-bold text-surface-container-lowest">
                          ACTIVE TARGET
                        </span>
                      ) : (
                        <span className="uppercase text-outline">PENDING</span>
                      )}

                      {/* Objective Actions: Edit, Move Up, Move Down, Delete */}
                      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingObjective(obj);
                          }}
                          title="Edit objective"
                          className="text-outline hover:text-secondary"
                        >
                          <span className="material-symbols-outlined text-[14px]">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleMoveObjective(idx, "up", e)}
                          disabled={idx === 0}
                          title="Move up"
                          className="text-outline hover:text-secondary disabled:opacity-20"
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            arrow_upward
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleMoveObjective(idx, "down", e)}
                          disabled={idx === objectives.length - 1}
                          title="Move down"
                          className="text-outline hover:text-secondary disabled:opacity-20"
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            arrow_downward
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteObjective(obj.id, e)}
                          title="Delete objective"
                          className="text-outline hover:text-error"
                        >
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Objective form */}
              <form onSubmit={handleAddObjective} className="mt-2 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="+ Append sub-objective to this session..."
                  value={newObjectiveText}
                  onChange={(e) => setNewObjectiveText(e.target.value)}
                  className="flex-1 rounded-DEFAULT border border-outline-variant/40 bg-surface-container p-2 font-mono text-xs text-on-surface placeholder:text-outline/60 focus:border-secondary focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-DEFAULT border border-outline-variant/40 bg-surface-container px-3 py-2 font-mono text-xs uppercase text-secondary hover:bg-surface-container-high"
                >
                  ADD TASK
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* 3. LOWER WORKSPACE: SCRATCHPAD (7 COLS) & RIGHT RAIL (5 COLS) */}
        <section className="grid grid-cols-1 items-start gap-space-lg lg:grid-cols-12">
          {/* LEFT: SESSION SCRATCHPAD (7 COLS) */}
          <div className="flex flex-col gap-space-md lg:col-span-7">
            {/* Scratchpad Header & Code Panel */}
            <div className="flex flex-col gap-space-sm rounded-DEFAULT border border-outline-variant/40 bg-surface-container-low p-space-md shadow-md">
              <div className="flex items-center justify-between border-b border-surface-container-highest/60 pb-2">
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-primary">
                  <span className="material-symbols-outlined text-[16px]">terminal</span>
                  <span>// SESSION_SCRATCHPAD // AUTOSAVED CLOUD_SYNC</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 font-mono text-[10px] font-bold uppercase text-secondary">
                    <span className="h-1.5 w-1.5 rounded-full bg-secondary"></span>
                    SAVED
                  </span>
                  <button
                    onClick={() => setIsEditingCode(!isEditingCode)}
                    className="flex cursor-pointer items-center gap-1 font-mono text-[11px] uppercase text-outline hover:text-tertiary-fixed"
                  >
                    <span className="material-symbols-outlined text-[14px]">edit_note</span>
                    <span>{isEditingCode ? "DONE EDITING" : "EDIT CODE"}</span>
                  </button>
                  <button
                    onClick={handleCopyCode}
                    className="flex cursor-pointer items-center gap-1 font-mono text-[11px] uppercase text-tertiary-fixed hover:text-secondary"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {codeCopied ? "done" : "content_copy"}
                    </span>
                    <span>{codeCopied ? "COPIED" : "COPY CODE"}</span>
                  </button>
                </div>
              </div>

              {/* Code Panel Header */}
              <div className="flex items-center justify-between pt-1 font-mono text-[11px] text-outline">
                <span>pkg/transactions/idempotency_validator.go</span>
                <span className="text-tertiary-fixed">GO 1.22.4 // CONCURRENCY PRIMITIVES</span>
              </div>

              {/* Code Syntax Block or Editable Textarea */}
              {isEditingCode ? (
                <textarea
                  rows={14}
                  value={codeContent}
                  onChange={(e) => setCodeContent(e.target.value)}
                  className="w-full resize-y rounded-DEFAULT border border-secondary/50 bg-surface-container-lowest p-space-md font-mono text-xs leading-relaxed text-[#b8f1b9] focus:outline-none"
                />
              ) : (
                <div className="max-h-80 overflow-x-auto overflow-y-auto rounded-DEFAULT border border-outline-variant/30 bg-surface-container-lowest p-space-md font-mono text-xs leading-relaxed text-[#b8f1b9]">
                  <pre>
                    <code>{codeContent}</code>
                  </pre>
                </div>
              )}

              {/* Architectural Schematic Snapshot */}
              <div className="mt-space-xs border-t border-surface-container-highest/60 pt-space-sm">
                <div className="mb-2 flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-outline">
                  <span className="material-symbols-outlined text-[14px] text-secondary">
                    schema
                  </span>
                  <span>PIPELINE SCHEMATIC SNAPSHOT</span>
                </div>

                <div className="w-full overflow-x-auto rounded-DEFAULT border border-outline-variant/30 bg-surface-container-lowest p-3">
                  <svg className="h-16 w-full min-w-[500px]" viewBox="0 0 600 60">
                    <rect
                      x="10"
                      y="15"
                      width="110"
                      height="30"
                      rx="3"
                      fill="#1f201f"
                      stroke="#414940"
                      strokeWidth="1"
                    />
                    <text
                      x="65"
                      y="34"
                      fill="#e4e2e0"
                      fontSize="10"
                      fontFamily="Space Mono"
                      textAnchor="middle"
                    >
                      INGRESS HTTP
                    </text>

                    <line
                      x1="120"
                      y1="30"
                      x2="160"
                      y2="30"
                      stroke="#86db70"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                    <polygon points="160,30 155,27 155,33" fill="#86db70" />

                    <rect
                      x="160"
                      y="10"
                      width="160"
                      height="40"
                      rx="3"
                      fill="#1e5128"
                      stroke="#86db70"
                      strokeWidth="1.5"
                    />
                    <text
                      x="240"
                      y="27"
                      fill="#d9eaa9"
                      fontSize="10"
                      fontFamily="Space Mono"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      REDIS REDLOCK
                    </text>
                    <text
                      x="240"
                      y="42"
                      fill="#86db70"
                      fontSize="9"
                      fontFamily="Space Mono"
                      textAnchor="middle"
                    >
                      (150MS TTL JITTER)
                    </text>

                    <line
                      x1="320"
                      y1="30"
                      x2="360"
                      y2="30"
                      stroke="#86db70"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                    <polygon points="360,30 355,27 355,33" fill="#86db70" />

                    <rect
                      x="360"
                      y="15"
                      width="120"
                      height="30"
                      rx="3"
                      fill="#1f201f"
                      stroke="#414940"
                      strokeWidth="1"
                    />
                    <text
                      x="420"
                      y="34"
                      fill="#e4e2e0"
                      fontSize="10"
                      fontFamily="Space Mono"
                      textAnchor="middle"
                    >
                      TX WRITE-AHEAD
                    </text>

                    <line x1="480" y1="30" x2="510" y2="30" stroke="#86db70" strokeWidth="1.5" />
                    <polygon points="510,30 505,27 505,33" fill="#86db70" />

                    <rect
                      x="510"
                      y="15"
                      width="80"
                      height="30"
                      rx="3"
                      fill="#1f201f"
                      stroke="#414940"
                      strokeWidth="1"
                    />
                    <text
                      x="550"
                      y="34"
                      fill="#86db70"
                      fontSize="10"
                      fontFamily="Space Mono"
                      textAnchor="middle"
                    >
                      DISPATCH
                    </text>
                  </svg>
                </div>
              </div>
            </div>

            {/* REAL-TIME INSIGHT BUFFER */}
            <div className="flex flex-col gap-space-sm rounded-DEFAULT border border-outline-variant/40 bg-surface-container-low p-space-md shadow-md">
              <div className="flex items-center justify-between border-b border-surface-container-highest/60 pb-2">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-tertiary-fixed">
                  REAL-TIME INSIGHT BUFFER (LOGGED TO SESSION VAULT)
                </span>
                <span className="font-mono text-[10px] uppercase text-outline">
                  {notes.length} INSIGHTS
                </span>
              </div>

              {/* Quick Append Form */}
              <form onSubmit={handlePushNote} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="+ Append immediate realization or mental bookmark..."
                  value={newNoteInput}
                  onChange={(e) => setNewNoteInput(e.target.value)}
                  className="flex-1 rounded-DEFAULT border border-outline-variant/40 bg-surface-container p-2 font-mono text-xs text-on-surface placeholder:text-outline/60 focus:border-secondary focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isSavingNote || !newNoteInput.trim()}
                  className="rounded-DEFAULT bg-secondary px-space-md py-2 font-mono text-xs font-bold uppercase text-surface-container-lowest transition-colors hover:bg-tertiary-fixed disabled:opacity-50"
                >
                  PUSH NOTE
                </button>
              </form>

              {/* Notes List */}
              <div className="mt-1 flex flex-col gap-2">
                {notes.map((n) => (
                  <div
                    key={n.id}
                    className="group flex flex-col gap-1 rounded-DEFAULT border border-outline-variant/20 bg-surface-container p-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between font-mono text-[10px] text-outline">
                      <span className="font-bold text-secondary">[{n.timestamp}]</span>
                      <div className="flex items-center gap-2">
                        {n.category && (
                          <span className="py-0.2 rounded-DEFAULT bg-surface-container-highest px-1.5 text-tertiary">
                            {n.category}
                          </span>
                        )}
                        <button
                          onClick={() => setEditingNote(n)}
                          className="text-outline opacity-0 transition-opacity hover:text-secondary group-hover:opacity-100"
                          title="Edit note"
                        >
                          <span className="material-symbols-outlined text-[13px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteNote(n.id, n.dbId)}
                          className="text-outline opacity-0 transition-opacity hover:text-error group-hover:opacity-100"
                          title="Delete note"
                        >
                          <span className="material-symbols-outlined text-[13px]">delete</span>
                        </button>
                      </div>
                    </div>
                    <p className="font-mono leading-relaxed text-on-surface">{n.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT RAIL: COGNITIVE TELEMETRY & SENTINEL (5 COLS) */}
          <div className="flex flex-col gap-space-md lg:col-span-5">
            {/* CARD 1: COGNITIVE TELEMETRY (NEURO-METRICS) */}
            <div className="flex flex-col gap-space-sm rounded-DEFAULT border border-outline-variant/40 bg-surface-container-low p-space-md shadow-md">
              <div className="flex items-center justify-between border-b border-surface-container-highest/60 pb-2">
                <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-secondary">
                  <span className="material-symbols-outlined text-[16px]">monitoring</span>
                  <span>NEURO-METRICS &amp; HARNESS</span>
                </div>
                <span className="font-mono text-[10px] font-bold text-tertiary-fixed">
                  ALPHA SYNC
                </span>
              </div>

              {/* Focus Efficiency Tile */}
              <div className="flex items-center justify-between rounded-DEFAULT border border-outline-variant/30 bg-surface-container p-3">
                <div>
                  <span className="block font-mono text-[10px] uppercase text-outline">
                    FOCUS EFFICIENCY
                  </span>
                  <span className="font-headline-sm text-2xl font-bold text-tertiary-fixed">
                    94.8%
                  </span>
                </div>
                <div className="text-right">
                  <span className="block font-mono text-[10px] font-bold text-secondary">
                    ZERO DROPPED CADENCE
                  </span>
                  <span className="font-mono text-xs text-outline">P95 LATENCY: 14MS</span>
                </div>
              </div>

              {/* Metric Grid */}
              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                <div className="rounded-DEFAULT border border-outline-variant/20 bg-surface-container p-2.5">
                  <span className="block text-[10px] text-outline">SESSION RUNTIME</span>
                  <span className="text-sm font-bold text-on-surface">
                    {formatTime(elapsedSec)}
                  </span>
                </div>
                <div className="rounded-DEFAULT border border-outline-variant/20 bg-surface-container p-2.5">
                  <span className="block text-[10px] text-outline">INTERRUPTIONS</span>
                  <span className="text-sm font-bold text-secondary">0 RECORDED</span>
                </div>
              </div>

              {/* Mini Sparkline */}
              <div className="flex h-6 items-end gap-1 pt-1">
                <div className="h-2 w-full rounded-DEFAULT bg-surface-container-high"></div>
                <div className="h-3 w-full rounded-DEFAULT bg-primary-container"></div>
                <div className="h-4 w-full rounded-DEFAULT bg-primary-container"></div>
                <div className="h-5 w-full rounded-DEFAULT bg-secondary"></div>
                <div className="h-6 w-full rounded-DEFAULT bg-secondary"></div>
                <div className="h-6 w-full animate-pulse rounded-DEFAULT bg-tertiary-fixed"></div>
              </div>
            </div>

            {/* CARD 2: PATHFINDER AI LIVE SENTINEL */}
            <div className="flex flex-col gap-space-sm rounded-DEFAULT border border-secondary/50 bg-surface-container-low p-space-md shadow-[3px_3px_0px_#1e5128]">
              <div className="flex items-center justify-between border-b border-surface-container-highest/60 pb-2">
                <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-secondary">
                  <span className="material-symbols-outlined text-[16px]">cognition</span>
                  <span>PATHFINDER_SENTINEL // HEURISTIC ENGINE</span>
                </div>
                <span className="py-0.2 rounded-DEFAULT bg-secondary px-1.5 font-mono text-[10px] font-bold text-surface-container-lowest">
                  ACTIVE AGENT
                </span>
              </div>

              <div className="flex flex-col gap-2 rounded-DEFAULT border border-outline-variant/20 bg-surface-container p-3">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined mt-0.5 shrink-0 text-[18px] text-tertiary-fixed">
                    warning
                  </span>
                  <p className="font-body-sm text-xs leading-relaxed text-on-surface">
                    “You are constructing atomic locks with hard-coded expiration windows. In
                    distributed write bursts, this causes thundering herd evictions. Introduce a
                    5-15% random TTL jitter before setting Redlock keys.”
                  </p>
                </div>

                <button
                  onClick={handleInsertJitterPattern}
                  className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-DEFAULT bg-tertiary-fixed py-2 font-mono text-xs font-bold uppercase text-surface-container-lowest shadow-sm transition-colors hover:bg-secondary"
                >
                  <span className="material-symbols-outlined text-[16px]">bolt</span>
                  <span>INSERT JITTER PATTERN BOILERPLATE</span>
                </button>
              </div>
            </div>

            {/* CARD 3: BOUND SPECIFICATIONS */}
            <div className="flex flex-col gap-space-sm rounded-DEFAULT border border-outline-variant/40 bg-surface-container-low p-space-md shadow-md">
              <div className="flex items-center justify-between border-b border-surface-container-highest/60 pb-2">
                <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-tertiary-fixed">
                  <span className="material-symbols-outlined text-[16px]">menu_book</span>
                  <span>BOUND SPECIFICATIONS</span>
                </div>
                <button
                  onClick={() => setShowAttachSpecModal(true)}
                  className="flex cursor-pointer items-center gap-0.5 font-mono text-[10px] uppercase text-secondary hover:text-tertiary-fixed"
                >
                  <span className="material-symbols-outlined text-[12px]">add</span>
                  <span>ATTACH</span>
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {specs.map((sp) => (
                  <div
                    key={sp.id}
                    className="group relative flex flex-col gap-1 rounded-DEFAULT border border-outline-variant/30 bg-surface-container p-2.5 transition-colors hover:bg-surface-container-high"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold uppercase text-secondary">
                        {sp.type}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleRemoveSpec(sp.id)}
                          className="text-outline opacity-0 transition-opacity hover:text-error group-hover:opacity-100"
                          title="Unlink specification"
                        >
                          <span className="material-symbols-outlined text-[12px]">close</span>
                        </button>
                        <a
                          href={sp.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="material-symbols-outlined text-[14px] text-outline transition-all group-hover:translate-x-0.5 group-hover:text-tertiary-fixed"
                        >
                          arrow_forward
                        </a>
                      </div>
                    </div>
                    <a
                      href={sp.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-headline-sm text-xs font-semibold text-on-surface transition-colors group-hover:text-primary"
                    >
                      {sp.title}
                    </a>
                    <span className="font-mono text-[10px] text-outline">{sp.source}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 4. BOTTOM TELEMETRY COMMAND BAR */}
      <footer className="sticky bottom-0 z-40 w-full border-t border-outline-variant/40 bg-surface-container-lowest py-space-sm shadow-2xl">
        <div className="mx-auto flex max-w-7xl flex-col items-stretch justify-between gap-space-md px-gutter lg:flex-row lg:items-center">
          {/* Telemetry Metrics */}
          <div className="grid grid-cols-2 gap-4 font-mono text-xs sm:grid-cols-4">
            <div>
              <span className="block text-[10px] uppercase text-outline">SESSION RUNTIME</span>
              <span className="text-sm font-bold text-secondary">{formatTime(elapsedSec)}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase text-outline">TASKS MASTERED</span>
              <span className="text-sm font-bold text-tertiary-fixed">
                {objectives.filter((o) => o.completed).length} / {objectives.length} COMPLETED
              </span>
            </div>
            <div>
              <span className="block text-[10px] uppercase text-outline">INSIGHTS CAPTURED</span>
              <span className="text-sm font-bold text-primary">{notes.length} NOTES LOGGED</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase text-outline">CADENCE PERSISTENCE</span>
              <span className="text-sm font-bold text-secondary">96% TARGET RETENTION</span>
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={handleCompleteBlockAndRecovery}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-DEFAULT bg-secondary px-space-lg py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-surface-container-lowest shadow-md transition-all duration-150 hover:bg-tertiary-fixed"
          >
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>
              COMPLETE BLOCK &amp; TRIGGER {Math.round(recoveryDurationSec / 60)}-MIN SYSTEM
              RECOVERY
            </span>
          </button>
        </div>
      </footer>

      {/* MODAL 1: Terminate & Log Confirmation */}
      {showTerminateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="flex w-full max-w-md flex-col gap-space-md rounded-xl border border-primary-container bg-surface-container-low p-space-lg shadow-2xl">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-space-sm">
              <div className="flex items-center gap-space-xs font-headline-sm text-headline-sm uppercase text-on-surface">
                <span className="material-symbols-outlined text-[20px] text-error">
                  stop_circle
                </span>
                <span>Terminate Cadence?</span>
              </div>
              <button
                onClick={() => setShowTerminateModal(false)}
                className="text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <p className="text-xs leading-relaxed text-on-surface-variant">
              Ending this session will pause active telemetry and log{" "}
              <strong className="text-secondary">{Math.round(elapsedSec / 60)} minutes</strong> of
              verified focus as an interrupted cadence. All captured notes and sub-objectives will
              be preserved.
            </p>

            <div className="flex items-center justify-end gap-space-sm border-t border-outline-variant/30 pt-space-xs">
              <button
                onClick={() => setShowTerminateModal(false)}
                className="rounded-DEFAULT bg-surface-container px-space-md py-space-sm font-label-sm text-label-sm uppercase text-on-surface hover:bg-surface-container-high"
              >
                Resume Session
              </button>
              <button
                onClick={handleTerminateAndLog}
                className="rounded-DEFAULT bg-error px-space-lg py-space-sm font-label-sm text-label-sm font-bold uppercase text-surface-container-lowest transition-colors hover:bg-red-400"
              >
                Confirm &amp; Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Recovery Mode Dialog */}
      {showRecoveryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="flex w-full max-w-md flex-col gap-space-md rounded-xl border border-secondary bg-surface-container-low p-space-lg text-center shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-container text-secondary">
              <span className="material-symbols-outlined text-[28px]">spa</span>
            </div>

            <h3 className="font-headline-sm text-xl font-bold uppercase text-on-surface">
              System Recovery Cadence Active
            </h3>

            <p className="text-xs leading-relaxed text-on-surface-variant">
              Step away from the screen, hydrate, and allow ultradian memory consolidation to settle
              neural pathways.
            </p>

            <div className="py-2 font-mono text-3xl font-bold text-tertiary-fixed">
              {formatTime(secondsLeft)}
            </div>

            <div className="flex items-center justify-center gap-space-sm border-t border-outline-variant/30 pt-space-xs">
              <button
                onClick={() => {
                  setShowRecoveryModal(false);
                  setSessionState("WORKING");
                  setSecondsLeft(workDurationSec);
                  toast.success("Commenced next focus cycle.");
                }}
                className="rounded-DEFAULT bg-secondary px-space-lg py-space-sm font-label-sm text-label-sm font-bold uppercase text-surface-container-lowest transition-colors hover:bg-tertiary-fixed"
              >
                Skip Recovery &amp; Start Cycle 0{Math.min(3, cycleIndex + 1)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Attach Bound Specification */}
      {showAttachSpecModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="flex w-full max-w-md flex-col gap-space-md rounded-xl border border-primary-container bg-surface-container-low p-space-lg shadow-2xl">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-space-sm">
              <div className="flex items-center gap-space-xs font-headline-sm text-headline-sm uppercase text-on-surface">
                <span className="material-symbols-outlined text-[20px] text-secondary">
                  add_link
                </span>
                <span>Attach Bound Spec</span>
              </div>
              <button
                onClick={() => setShowAttachSpecModal(false)}
                className="text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newSpecForm.title || !newSpecForm.url) return;
                setSpecs((prev) => [
                  ...prev,
                  {
                    id: `spec-${Date.now()}`,
                    title: newSpecForm.title,
                    type: newSpecForm.type,
                    url: newSpecForm.url,
                    source: newSpecForm.source || "USER BOUND",
                  },
                ]);
                setShowAttachSpecModal(false);
                toast.success("Bound specification linked.");
              }}
              className="flex flex-col gap-space-sm font-mono text-xs"
            >
              <div className="flex flex-col gap-1">
                <label className="uppercase text-outline">Specification Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Raft Consensus Algorithm RFC"
                  value={newSpecForm.title}
                  onChange={(e) => setNewSpecForm({ ...newSpecForm, title: e.target.value })}
                  className="rounded border border-outline-variant/40 bg-surface-container p-2 text-on-surface"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="uppercase text-outline">Resource URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={newSpecForm.url}
                  onChange={(e) => setNewSpecForm({ ...newSpecForm, url: e.target.value })}
                  className="rounded border border-outline-variant/40 bg-surface-container p-2 text-on-surface"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="uppercase text-outline">Spec Category</label>
                <input
                  type="text"
                  value={newSpecForm.type}
                  onChange={(e) => setNewSpecForm({ ...newSpecForm, type: e.target.value })}
                  className="rounded border border-outline-variant/40 bg-surface-container p-2 text-on-surface"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-outline-variant/30 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAttachSpecModal(false)}
                  className="rounded bg-surface-container px-3 py-1.5 uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-secondary px-4 py-1.5 font-bold uppercase text-surface-container-lowest"
                >
                  Bind Spec
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Edit Sub-objective */}
      {editingObjective && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="flex w-full max-w-md flex-col gap-space-md rounded-xl border border-primary-container bg-surface-container-low p-space-lg shadow-2xl">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-space-sm">
              <div className="flex items-center gap-space-xs font-headline-sm text-headline-sm uppercase text-on-surface">
                <span className="material-symbols-outlined text-[20px] text-secondary">edit</span>
                <span>Edit Sub-Objective</span>
              </div>
              <button
                onClick={() => setEditingObjective(null)}
                className="text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form
              onSubmit={handleSaveEditedObjective}
              className="flex flex-col gap-space-sm font-mono text-xs"
            >
              <textarea
                rows={3}
                required
                value={editingObjective.text}
                onChange={(e) => setEditingObjective({ ...editingObjective, text: e.target.value })}
                className="rounded border border-outline-variant/40 bg-surface-container p-2 text-on-surface focus:border-secondary focus:outline-none"
              />

              <div className="flex justify-end gap-2 border-t border-outline-variant/30 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingObjective(null)}
                  className="rounded bg-surface-container px-3 py-1.5 uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-secondary px-4 py-1.5 font-bold uppercase text-surface-container-lowest"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: Edit Note */}
      {editingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="flex w-full max-w-md flex-col gap-space-md rounded-xl border border-primary-container bg-surface-container-low p-space-lg shadow-2xl">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-space-sm">
              <div className="flex items-center gap-space-xs font-headline-sm text-headline-sm uppercase text-on-surface">
                <span className="material-symbols-outlined text-[20px] text-secondary">
                  edit_note
                </span>
                <span>Edit Insight Note</span>
              </div>
              <button
                onClick={() => setEditingNote(null)}
                className="text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form
              onSubmit={handleSaveEditedNote}
              className="flex flex-col gap-space-sm font-mono text-xs"
            >
              <textarea
                rows={4}
                required
                value={editingNote.content}
                onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                className="rounded border border-outline-variant/40 bg-surface-container p-2 text-on-surface focus:border-secondary focus:outline-none"
              />

              <div className="flex justify-end gap-2 border-t border-outline-variant/30 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingNote(null)}
                  className="rounded bg-surface-container px-3 py-1.5 uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-secondary px-4 py-1.5 font-bold uppercase text-surface-container-lowest"
                >
                  Save Insight
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: Past Focus Sessions Logs */}
      {showPastSessionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="flex max-h-[80vh] w-full max-w-lg flex-col gap-space-md overflow-hidden rounded-xl border border-primary-container bg-surface-container-low p-space-lg shadow-2xl">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-space-sm">
              <div className="flex items-center gap-space-xs font-headline-sm text-headline-sm uppercase text-on-surface">
                <span className="material-symbols-outlined text-[20px] text-secondary">
                  history
                </span>
                <span>Verified Past Focus Sessions</span>
              </div>
              <button
                onClick={() => setShowPastSessionsModal(false)}
                className="text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-2 overflow-y-auto pr-1">
              {pastSessions.length === 0 ? (
                <div className="py-6 text-center font-mono text-xs text-outline">
                  No previous sessions logged yet. Complete your current focus block to record
                  telemetry.
                </div>
              ) : (
                pastSessions.map((ps) => (
                  <div
                    key={ps._id}
                    className="flex flex-col gap-1 rounded-DEFAULT border border-outline-variant/30 bg-surface-container p-3 font-mono text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-on-surface">{ps.title}</span>
                      <span className="font-bold text-secondary">{ps.durationMinutes} MINS</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-outline">
                      <span>DATE: {ps.sessionDate}</span>
                      {ps.reflection && (
                        <span className="max-w-[200px] truncate">{ps.reflection}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end border-t border-outline-variant/30 pt-2">
              <button
                onClick={() => setShowPastSessionsModal(false)}
                className="rounded bg-surface-container px-4 py-1.5 font-mono text-xs uppercase text-on-surface"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
