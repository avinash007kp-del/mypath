"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  CheckCircle2,
  Clock,
  Flame,
  ArrowRight,
  Target,
  Trophy,
  BookOpen,
  Play,
  Sparkles,
} from "lucide-react";
import { fetchRoadmaps, fetchLMSDashboardOverview } from "@/services/api";
import { IRoadmap, DashboardLMSOverview } from "@/types";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";

export default function MyLearningPage() {
  const [roadmaps, setRoadmaps] = useState<IRoadmap[]>([]);
  const [lmsOverview, setLmsOverview] = useState<DashboardLMSOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchRoadmaps(), fetchLMSDashboardOverview()])
      .then(([rData, lmsData]) => {
        setRoadmaps(rData);
        setLmsOverview(lmsData);
      })
      .catch((err) => console.error("Error loading learning data:", err))
      .finally(() => setLoading(false));
  }, []);

  const inProgressRoadmaps = roadmaps.filter((r) => r.progress > 0 && r.progress < 100);
  const completedRoadmaps = roadmaps.filter((r) => r.progress === 100);
  const notStartedRoadmaps = roadmaps.filter((r) => r.progress === 0);

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#62695D] bg-[#252D26] px-3 py-1 font-mono text-xs font-semibold text-[#D7FF00]">
            <GraduationCap className="h-3.5 w-3.5 text-[#D7FF00]" />
            <span>LEARNING JOURNEY &amp; MASTERY TRACKER</span>
          </div>
          <h1 className="font-mono text-2xl font-bold uppercase tracking-tight text-[#F3F0E6] sm:text-3xl">
            My Learning Journey
          </h1>
          <p className="mt-1 text-xs text-[#B8B9AA] md:text-sm">
            Track active progress, study momentum, and mastered developer milestones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/study-session">
            <Button
              variant="primary"
              size="sm"
              className="flex items-center gap-1.5 font-mono font-bold uppercase shadow-lg shadow-[#D7FF00]/15"
            >
              <Play className="h-3.5 w-3.5 fill-[#1B211C]" />
              Start Focus Timer
            </Button>
          </Link>
          <Link href="/daily-goals">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5 font-mono text-xs"
            >
              <Target className="h-4 w-4" />
              Daily Goals
            </Button>
          </Link>
        </div>
      </div>

      {/* Habits & Momentum Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Streak Counter */}
        <div className="flex flex-col justify-between rounded-xl border border-[#62695D] bg-[#252D26] p-4">
          <div className="flex items-center justify-between font-mono text-xs font-bold text-[#D7FF00]">
            <span>STUDY STREAK</span>
            <Flame className="h-4 w-4 fill-[#D7FF00]" />
          </div>
          <div className="my-2">
            <div className="font-mono text-3xl font-bold text-[#F3F0E6]">
              {lmsOverview?.learningStreak.currentStreak || 0}{" "}
              <span className="text-xs font-normal text-[#B8B9AA]">days</span>
            </div>
            <p className="mt-0.5 font-mono text-[11px] text-[#B8B9AA]">
              Best record: {lmsOverview?.learningStreak.longestStreak || 0} days
            </p>
          </div>
          <div className="font-mono text-[11px] font-bold text-[#D7FF00]">
            Keep the flame alive today!
          </div>
        </div>

        {/* Today's Goal Progress */}
        <div className="flex flex-col justify-between rounded-xl border border-[#62695D] bg-[#252D26] p-4">
          <div className="flex items-center justify-between font-mono text-xs font-bold text-[#EDE8D8]">
            <span>TODAY&apos;S FOCUS</span>
            <Clock className="h-4 w-4 text-[#D7FF00]" />
          </div>
          <div className="my-2">
            <div className="font-mono text-3xl font-bold text-[#F3F0E6]">
              {lmsOverview?.todayGoal.completedMinutes || 0}
              <span className="text-xs font-normal text-[#B8B9AA]">
                {" "}
                / {lmsOverview?.todayGoal.targetMinutes || 120}m
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full border border-[#62695D] bg-[#202720]">
              <div
                className="h-full rounded-full bg-[#D7FF00]"
                style={{
                  width: `${lmsOverview?.todayGoal.completionPercentage || 0}%`,
                }}
              />
            </div>
          </div>
          <div className="font-mono text-[11px] text-[#B8B9AA]">
            {lmsOverview?.todayGoal.tasksCompleted || 0} / {lmsOverview?.todayGoal.tasksTotal || 0}{" "}
            tasks finished
          </div>
        </div>

        {/* Weekly Study Pace */}
        <div className="flex flex-col justify-between rounded-xl border border-[#62695D] bg-[#252D26] p-4">
          <div className="flex items-center justify-between font-mono text-xs font-bold text-[#B8B9AA]">
            <span>WEEKLY PACE</span>
            <Target className="h-4 w-4 text-[#D7FF00]" />
          </div>
          <div className="my-2">
            <div className="font-mono text-3xl font-bold text-[#F3F0E6]">
              {lmsOverview?.weeklyGoal.actualHours || 0}
              <span className="text-xs font-normal text-[#B8B9AA]">
                {" "}
                / {lmsOverview?.weeklyGoal.targetHours || 10} hrs
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full border border-[#62695D] bg-[#202720]">
              <div
                className="h-full rounded-full bg-[#EDE8D8]"
                style={{
                  width: `${lmsOverview?.weeklyGoal.completionPercentage || 0}%`,
                }}
              />
            </div>
          </div>
          <div className="font-mono text-[11px] text-[#B8B9AA]">
            {lmsOverview?.weeklyGoal.remainingHours || 0} hrs remaining this week
          </div>
        </div>

        {/* Total Mastered Topics */}
        <div className="flex flex-col justify-between rounded-xl border border-[#62695D] bg-[#252D26] p-4">
          <div className="flex items-center justify-between font-mono text-xs font-bold text-[#D7FF00]">
            <span>MASTERED TOPICS</span>
            <CheckCircle2 className="h-4 w-4 text-[#D7FF00]" />
          </div>
          <div className="my-2">
            <div className="font-mono text-3xl font-bold text-[#D7FF00]">
              {lmsOverview?.topicsCompleted || 0}
            </div>
            <p className="mt-0.5 font-mono text-[11px] text-[#B8B9AA]">
              {lmsOverview?.topicsInProgress || 0} in active study
            </p>
          </div>
          <div className="font-mono text-[11px] text-[#B8B9AA]">
            Across {lmsOverview?.totalRoadmaps || 0} roadmaps
          </div>
        </div>
      </div>

      {/* Currently In Progress Roadmaps */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-mono text-base font-bold uppercase text-[#F3F0E6]">
            <Flame className="h-4 w-4 text-[#D7FF00]" />
            Active Curriculums ({inProgressRoadmaps.length})
          </h2>
          <Link
            href="/roadmaps"
            className="flex items-center gap-1 font-mono text-xs text-[#D7FF00] hover:underline"
          >
            Browse all roadmaps <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-36 w-full rounded-xl bg-[#252D26]" />
            ))}
          </div>
        ) : inProgressRoadmaps.length === 0 ? (
          <div className="space-y-3 rounded-xl border border-[#62695D] bg-[#252D26] p-8 text-center font-mono text-xs text-[#B8B9AA]">
            <p>No roadmaps are currently in progress.</p>
            <Link href="/roadmaps">
              <Button variant="outline" size="sm">
                Explore Roadmaps
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {inProgressRoadmaps.map((r) => (
              <div
                key={r._id}
                className="flex flex-col justify-between space-y-4 rounded-xl border border-[#62695D] bg-[#252D26] p-5 transition-colors hover:border-[#D7FF00]"
              >
                <div>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="select-none text-2xl">{r.icon}</span>
                    <Badge variant="default">{r.category}</Badge>
                  </div>
                  <h3 className="font-mono text-base font-bold text-[#F3F0E6]">{r.title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-[#B8B9AA]">{r.description}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-[#B8B9AA]">
                      {r.completedTopics} of {r.totalTopics} topics
                    </span>
                    <span className="font-bold text-[#D7FF00]">{r.progress}%</span>
                  </div>
                  <ProgressBar value={r.progress} />
                </div>

                <div className="flex items-center justify-between border-t border-[#62695D]/40 pt-2">
                  <span className="font-mono text-xs text-[#B8B9AA]">
                    Est. {r.estimatedDuration || "Flexible"}
                  </span>
                  <Link href={`/roadmaps/${r._id}/editor`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1 font-mono text-xs font-bold text-[#D7FF00]"
                    >
                      Open Editor <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Roadmaps */}
      {completedRoadmaps.length > 0 && (
        <div className="space-y-4">
          <h2 className="flex items-center gap-2 font-mono text-base font-bold uppercase text-[#F3F0E6]">
            <CheckCircle2 className="h-4 w-4 text-[#D7FF00]" />
            Completed Roadmaps ({completedRoadmaps.length})
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {completedRoadmaps.map((r) => (
              <div
                key={r._id}
                className="flex flex-col justify-between rounded-xl border border-[#62695D] bg-[#252D26] p-4"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xl">{r.icon}</span>
                  <div className="min-w-0">
                    <h3 className="truncate font-mono text-xs font-bold text-[#F3F0E6]">
                      {r.title}
                    </h3>
                    <span className="font-mono text-[10px] font-bold text-[#D7FF00]">
                      100% Mastered
                    </span>
                  </div>
                </div>
                <Link href={`/roadmaps/${r._id}/editor`} className="mt-2">
                  <span className="font-mono text-[11px] text-[#D7FF00] hover:underline">
                    Review Curriculum →
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
