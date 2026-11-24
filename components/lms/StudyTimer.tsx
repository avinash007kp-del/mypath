"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  Square,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Clock,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  fetchActiveStudySession,
  startStudySessionApi,
  completeStudySessionApi,
  fetchRoadmaps,
} from "@/services/api";
import { IStudySession, IRoadmap } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface StudyTimerProps {
  initialRoadmapId?: string;
  initialNodeId?: string;
  initialTopicTitle?: string;
  onSessionCompleted?: (session: IStudySession) => void;
  compact?: boolean;
}

export function StudyTimer({
  initialRoadmapId,
  initialNodeId,
  initialTopicTitle,
  onSessionCompleted,
  compact = false,
}: StudyTimerProps) {
  const [session, setSession] = useState<IStudySession | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [roadmaps, setRoadmaps] = useState<IRoadmap[]>([]);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState(initialRoadmapId || "");
  const [topicTitle, setTopicTitle] = useState(initialTopicTitle || "");
  const [reflection, setReflection] = useState("");
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load roadmaps for dropdown
  useEffect(() => {
    fetchRoadmaps()
      .then((data) => setRoadmaps(data))
      .catch((err) => console.error("Error fetching roadmaps:", err));
  }, []);

  // Restore active session on mount
  useEffect(() => {
    fetchActiveStudySession()
      .then((active) => {
        if (active) {
          setSession(active);
          setIsRunning(active.status === "active");
          if (active.roadmapId) setSelectedRoadmapId(active.roadmapId);
          if (active.title) setTopicTitle(active.title);

          const startMs = new Date(active.startedAt).getTime();
          const nowMs = Date.now();
          const elapsed = Math.max(0, Math.floor((nowMs - startMs) / 1000));
          setElapsedSeconds(elapsed);
        }
      })
      .catch((err) => console.error("Error restoring session:", err));
  }, []);

  // Timer ticker
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;

  const handleStart = async () => {
    try {
      const newSession = await startStudySessionApi({
        roadmapId: selectedRoadmapId || undefined,
        nodeId: initialNodeId,
        title: topicTitle.trim() || "Deep Study Session",
      });

      setSession(newSession);
      setIsRunning(true);
      setElapsedSeconds(0);
      toast.success("Study session started! Timer running in background.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to start study session");
    }
  };

  const handlePauseResume = () => {
    setIsRunning(!isRunning);
  };

  const handleOpenFinishModal = () => {
    setShowReflectionModal(true);
  };

  const handleCompleteSession = async () => {
    if (!session) return;
    setIsEnding(true);

    try {
      const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
      const completed = await completeStudySessionApi(session._id, {
        reflection: reflection.trim() || undefined,
        durationMinutes,
      });

      if (timerRef.current) clearInterval(timerRef.current);
      setIsRunning(false);
      setSession(null);
      setElapsedSeconds(0);
      setReflection("");
      setShowReflectionModal(false);

      toast.success(`Study session recorded (${durationMinutes} mins logged)!`);
      if (onSessionCompleted) {
        onSessionCompleted(completed);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to complete study session");
    } finally {
      setIsEnding(false);
    }
  };

  return (
    <div className="space-y-6 rounded-2xl border border-[#62695D] bg-[#252D26] p-6">
      {/* Header Info */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-space text-base font-bold uppercase tracking-wider text-[#F3F0E6]">
            Focused Study Timer
          </h2>
          {isRunning && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D7FF00] px-2.5 py-1 font-mono text-[10px] font-bold text-[#1B211C]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#1B211C]" />
              RECORDING
            </span>
          )}
        </div>
        <p className="mt-1 text-xs leading-relaxed text-[#B8B9AA]">
          Persistent timer synchronized with database timestamps. Seamless across browser reloads.
        </p>
      </div>

      {/* Large Warm Ivory Timer Display */}
      <div className="notched-corner relative select-none rounded-2xl border border-[#EDE8D8] bg-[#EDE8D8] p-6 text-[#1B211C] shadow-md sm:p-8">
        {/* Top subtle label */}
        <div className="mb-4 flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-widest text-[#1B211C]/60">
          <span>Active Clock Sequence</span>
          <span>Precision Counter</span>
        </div>

        {/* Big Digit Blocks */}
        <div className="flex items-baseline justify-center gap-2 font-mono font-bold sm:gap-4">
          {/* Hours */}
          <div className="flex flex-col items-center">
            <span className="text-5xl tracking-tight sm:text-7xl md:text-8xl">
              {hours.toString().padStart(2, "0")}
            </span>
            <span className="mt-1 font-space text-[10px] font-bold uppercase tracking-wider text-[#1B211C]/70 sm:text-xs">
              Hours
            </span>
          </div>

          <span className="-translate-y-2 text-4xl font-bold opacity-40 sm:text-6xl md:text-7xl">
            :
          </span>

          {/* Minutes */}
          <div className="flex flex-col items-center">
            <span className="text-5xl tracking-tight sm:text-7xl md:text-8xl">
              {minutes.toString().padStart(2, "0")}
            </span>
            <span className="mt-1 font-space text-[10px] font-bold uppercase tracking-wider text-[#1B211C]/70 sm:text-xs">
              Minutes
            </span>
          </div>

          <span className="-translate-y-2 text-4xl font-bold opacity-40 sm:text-6xl md:text-7xl">
            :
          </span>

          {/* Seconds */}
          <div className="flex flex-col items-center">
            <span className="text-5xl tracking-tight sm:text-7xl md:text-8xl">
              {seconds.toString().padStart(2, "0")}
            </span>
            <span className="mt-1 font-space text-[10px] font-bold uppercase tracking-wider text-[#1B211C]/70 sm:text-xs">
              Seconds
            </span>
          </div>
        </div>

        {/* Notched bottom corner accent indicator */}
        <div className="absolute bottom-2 right-3 font-mono text-[9px] font-bold uppercase tracking-widest text-[#1B211C]/50">
          SECURE SYNC
        </div>
      </div>

      {/* Inputs: Roadmap Selector & Focus Topic */}
      {!session && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block font-space text-xs font-bold uppercase tracking-wider text-[#EDE8D8]">
              Associate Roadmap
            </label>
            <select
              value={selectedRoadmapId}
              onChange={(e) => setSelectedRoadmapId(e.target.value)}
              className="w-full rounded-xl border border-[#62695D] bg-[#202720] px-3.5 py-2.5 text-xs text-[#F3F0E6] transition-colors focus:border-[#D7FF00] focus:outline-none"
            >
              <option value="">General (No specific roadmap)</option>
              {roadmaps.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.title} ({r.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block font-space text-xs font-bold uppercase tracking-wider text-[#EDE8D8]">
              Topic or Focus Subject
            </label>
            <input
              type="text"
              value={topicTitle}
              onChange={(e) => setTopicTitle(e.target.value)}
              placeholder="e.g. Asynchronous Node.js Streams, React Fiber Architecture"
              className="w-full rounded-xl border border-[#62695D] bg-[#202720] px-3.5 py-2.5 text-xs text-[#F3F0E6] placeholder-[#B8B9AA]/50 transition-colors focus:border-[#D7FF00] focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Running Session Overview Pill */}
      {session && (
        <div className="flex items-center justify-between rounded-xl border border-[#62695D] bg-[#202720] p-3.5 text-xs">
          <div>
            <span className="block font-mono text-[10px] uppercase tracking-wider text-[#B8B9AA]">
              Active Focus Subject
            </span>
            <span className="text-sm font-bold text-[#F3F0E6]">{topicTitle}</span>
          </div>
          <span className="rounded-lg border border-[#62695D] bg-[#1B211C] px-2.5 py-1 font-mono text-[11px] text-[#D7FF00]">
            Live Session
          </span>
        </div>
      )}

      {/* Action Controls */}
      <div className="pt-2">
        {!session ? (
          <button
            onClick={handleStart}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#D7FF00] px-6 py-4 font-space text-sm font-bold uppercase tracking-wider text-[#1B211C] shadow-md shadow-[#D7FF00]/15 transition-all duration-150 hover:bg-[#c4eb00] active:scale-[0.99]"
          >
            <Play className="h-5 w-5 fill-[#1B211C]" />
            <span>Start Study Session</span>
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handlePauseResume}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3.5 font-space text-xs font-bold uppercase tracking-wider transition-all",
                isRunning
                  ? "border-[#62695D] bg-[#2C352D] text-[#EDE8D8] hover:bg-[#343e35]"
                  : "border-[#D7FF00] bg-[#D7FF00] text-[#1B211C] hover:bg-[#c4eb00]"
              )}
            >
              {isRunning ? (
                <>
                  <Pause className="h-4 w-4 fill-current" />
                  <span>Pause Timer</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-current" />
                  <span>Resume Timer</span>
                </>
              )}
            </button>

            <button
              onClick={handleOpenFinishModal}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#D7FF00] px-4 py-3.5 font-space text-xs font-bold uppercase tracking-wider text-[#1B211C] shadow-md shadow-[#D7FF00]/15 transition-all hover:bg-[#c4eb00]"
            >
              <Square className="h-4 w-4 fill-current" />
              <span>Finish & Record</span>
            </button>
          </div>
        )}
      </div>

      {/* Reflection Completion Modal */}
      {showReflectionModal && (
        <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg space-y-4 rounded-2xl border border-[#62695D] bg-[#252D26] p-6 shadow-2xl">
            <div>
              <span className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-widest text-[#D7FF00]">
                Active Recall Reflection
              </span>
              <h3 className="font-space text-lg font-bold text-[#F3F0E6]">
                Complete Study Session
              </h3>
              <p className="mt-1 text-xs text-[#B8B9AA]">
                You studied for{" "}
                <span className="font-mono font-bold text-[#D7FF00]">
                  {Math.max(1, Math.round(elapsedSeconds / 60))} minutes
                </span>
                . Solidify your understanding with 1–2 key learnings before saving.
              </p>
            </div>

            <div>
              <label className="mb-2 block font-space text-xs font-bold uppercase tracking-wider text-[#EDE8D8]">
                Session Reflection & Breakthroughs
              </label>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                rows={4}
                placeholder="What did you build, read, or resolve? (e.g. Learned how MongoDB compound indexes optimize prefix equality queries)"
                className="w-full rounded-xl border border-[#62695D] bg-[#202720] p-3.5 text-xs text-[#F3F0E6] placeholder-[#B8B9AA]/50 focus:border-[#D7FF00] focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowReflectionModal(false)}
                className="rounded-xl border border-[#62695D] bg-[#202720] px-4 py-2.5 text-xs font-semibold text-[#B8B9AA] hover:text-[#F3F0E6]"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteSession}
                disabled={isEnding}
                className="rounded-xl bg-[#D7FF00] px-5 py-2.5 font-space text-xs font-bold uppercase tracking-wider text-[#1B211C] transition-all hover:bg-[#c4eb00] disabled:opacity-50"
              >
                {isEnding ? "Recording..." : "Save to History"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
