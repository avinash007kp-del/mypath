"use client";

import React from "react";
import Link from "next/link";
import {
  Flame,
  Target,
  Calendar,
  FileText,
  Play,
  ArrowRight,
  History,
  Clock,
  Sparkles,
} from "lucide-react";
import { DashboardLMSOverview } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface LmsDashboardWidgetsProps {
  overview: DashboardLMSOverview | null;
  isLoading: boolean;
}

export function LmsDashboardWidgets({ overview, isLoading }: LmsDashboardWidgetsProps) {
  if (isLoading || !overview) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="h-80 animate-pulse rounded-2xl border border-[#65685B] bg-[#171C18] lg:col-span-2" />
          <div className="h-80 animate-pulse rounded-2xl border border-[#65685B] bg-[#171C18]" />
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-2xl border border-[#65685B] bg-[#171C18]"
            />
          ))}
        </div>
      </div>
    );
  }

  const { todayGoal, learningStreak, upcomingMilestones, recentNotes, recentSessions } = overview;

  const hours = Math.floor(todayGoal.completedMinutes / 60);
  const minutes = todayGoal.completedMinutes % 60;
  const timeFormatted = `${String(hours).padStart(2, "0")} : ${String(minutes).padStart(2, "0")} : 00`;

  return (
    <div className="space-y-6">
      {/* 1. Today's Focus Goal & Streak Grid (Matching Image 2's Focused Study Timer & Guide) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Today's Focus Goal Card (Mirroring Focused Study Timer in Image 2) */}
        <div className="flex flex-col justify-between space-y-5 rounded-2xl border border-[#65685B] bg-[#171C18] p-6 shadow-sm sm:p-7 lg:col-span-2">
          {/* Header Row with Lime Icon and Three Slashes */}
          <div className="flex items-center justify-between border-b border-[#65685B]/30 pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#D7FF00] font-black text-[#111512] shadow-sm">
                <Target className="h-4 w-4 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-space text-sm font-bold uppercase tracking-wider text-[#F3F0E6] sm:text-base">
                  TODAY&apos;S FOCUS GOAL
                </h3>
                <p className="font-sans text-xs text-[#A5A79B]">
                  Track actual study time synchronized directly to MongoDB.
                </p>
              </div>
            </div>

            {/* Three Diagonal Lime Slashes (Matching Image 2) */}
            <div className="hidden select-none font-mono text-xl font-black tracking-tighter text-[#D7FF00] sm:block">
              ///
            </div>
          </div>

          {/* Central Warm Ivory Display Box (Mirroring Countdown Clock in Image 2) */}
          <div className="select-none rounded-xl bg-[#EDE8D8] p-5 text-center text-[#111512] shadow-sm sm:p-6">
            <div className="font-space text-3xl font-black tracking-tight text-[#111512] sm:text-4xl md:text-5xl">
              {timeFormatted}
            </div>
            <div className="mt-1.5 flex items-center justify-center gap-6 font-mono text-[9px] font-bold uppercase tracking-widest text-[#111512]/75 sm:gap-10 sm:text-[10px]">
              <span>HOURS</span>
              <span>:</span>
              <span>MINUTES</span>
              <span>:</span>
              <span>SECONDS</span>
            </div>
          </div>

          {/* Progress Bar & Task Details */}
          <div className="space-y-2">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-[#A5A79B]">
                {todayGoal.completedMinutes}m completed / {todayGoal.targetMinutes}m target
              </span>
              <span className="font-bold text-[#D7FF00]">
                {todayGoal.completionPercentage}% GOAL
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full border border-[#65685B]/60 bg-[#202720]">
              <div
                className="h-full rounded-full bg-[#D7FF00] transition-all duration-500"
                style={{ width: `${Math.min(100, todayGoal.completionPercentage)}%` }}
              />
            </div>
          </div>

          {/* Action Button Row */}
          <div className="flex flex-col items-center gap-3 pt-1 sm:flex-row">
            <Link href="/daily-goals" className="w-full sm:w-auto">
              <button className="w-full select-none rounded-xl border border-[#65685B] bg-[#202720] px-4 py-3 font-space text-xs font-bold text-[#EDE8D8] transition-colors hover:bg-[#202720]/80 sm:w-auto">
                Plan Daily Goals
              </button>
            </Link>

            <Link href="/study-session" className="w-full flex-1">
              <button className="notched-corner-sm flex w-full select-none items-center justify-center gap-2 rounded-xl bg-[#D7FF00] px-6 py-3 font-space text-xs font-black uppercase tracking-wider text-[#111512] shadow-sm transition-all hover:bg-[#c4eb00] sm:text-sm">
                <Play className="h-3.5 w-3.5 fill-[#111512]" />
                <span>START STUDY SESSION</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Focus Streak & Study Technique Guide (Mirroring Study Technique Guide in Image 2) */}
        <div className="flex flex-col justify-between space-y-4 rounded-2xl border border-[#65685B] bg-[#171C18] p-6 shadow-sm sm:p-7">
          <div>
            {/* Header with Lime Icon */}
            <div className="flex items-center gap-3 border-b border-[#65685B]/30 pb-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#D7FF00] font-black text-[#111512] shadow-sm">
                <Flame className="h-4 w-4 fill-[#111512]" />
              </div>
              <h3 className="font-space text-sm font-bold uppercase tracking-wider text-[#F3F0E6] sm:text-base">
                FOCUS STREAK & GUIDE
              </h3>
            </div>

            {/* Large Streak Metric */}
            <div className="py-4">
              <div className="font-space text-3xl font-black text-[#F3F0E6] sm:text-4xl">
                {learningStreak.currentStreak}{" "}
                <span className="font-mono text-sm font-normal text-[#A5A79B]">
                  {learningStreak.currentStreak === 1 ? "day streak" : "days streak"}
                </span>
              </div>
              <p className="mt-1 font-mono text-xs text-[#A5A79B]">
                All-time personal record:{" "}
                <span className="font-bold text-[#EDE8D8]">
                  {learningStreak.longestStreak} consecutive days
                </span>
              </p>
            </div>

            {/* Bullet Points with Lime Squares (Matching Image 2 Guide) */}
            <div className="space-y-3 border-t border-[#65685B]/30 pt-2 text-xs text-[#A5A79B]">
              <div className="flex items-start gap-2.5">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-[2px] bg-[#D7FF00]" />
                <p className="leading-relaxed">
                  <strong className="text-[#F3F0E6]">The 25/5 Pomodoro:</strong> Focus with zero
                  distractions for 25 minutes, then take a 5-minute break.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-[2px] bg-[#D7FF00]" />
                <p className="leading-relaxed">
                  <strong className="text-[#F3F0E6]">Active Recall:</strong> Always end each session
                  by writing 1–2 bullet reflections of what you actually built.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-[2px] bg-[#D7FF00]" />
                <p className="leading-relaxed">
                  <strong className="text-[#F3F0E6]">Deep Work:</strong> Turn off social media tabs
                  and close messaging apps during focus intervals.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[#65685B]/30 pt-3 text-xs text-[#A5A79B]">
            <span className="font-mono text-[11px]">Daily Habit Engine</span>
            <Link
              href="/study-session"
              className="font-space text-xs font-bold uppercase tracking-wider text-[#D7FF00] hover:underline"
            >
              Focus Now →
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Bottom Outlined Sections (Deadlines, Notes, Focus Sessions - Matching Study Sessions Log in Image 2) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Upcoming Deadlines */}
        <div className="flex flex-col justify-between space-y-4 rounded-2xl border border-[#65685B] bg-[#171C18] p-5 shadow-sm sm:p-6">
          <div>
            <div className="flex items-center justify-between border-b border-[#65685B]/30 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#D7FF00] font-black text-[#111512]">
                  <Calendar className="h-3.5 w-3.5" />
                </div>
                <h3 className="font-space text-xs font-bold uppercase tracking-wider text-[#F3F0E6] sm:text-sm">
                  UPCOMING DEADLINES
                </h3>
              </div>
              <span className="rounded-full border border-[#65685B] bg-[#202720] px-2.5 py-0.5 font-mono text-[11px] text-[#A5A79B]">
                {upcomingMilestones.length} milestones
              </span>
            </div>

            {upcomingMilestones.length === 0 ? (
              <div className="my-4 rounded-xl border border-dashed border-[#65685B]/50 py-10 text-center">
                <Clock className="mx-auto mb-2 h-6 w-6 stroke-[1.5] text-[#65685B]" />
                <p className="font-mono text-xs text-[#A5A79B]">No upcoming deadlines.</p>
                <p className="mt-0.5 text-[11px] text-[#A5A79B]/60">
                  Schedule target dates in milestones.
                </p>
              </div>
            ) : (
              <div className="space-y-2 pt-3">
                {upcomingMilestones.slice(0, 3).map((m) => (
                  <div
                    key={m._id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-[#65685B]/40 bg-[#202720] p-3"
                  >
                    <div className="min-w-0">
                      <span className="block truncate font-space text-xs font-semibold text-[#F3F0E6]">
                        {m.title}
                      </span>
                      <span className="font-mono text-[10px] text-[#A5A79B]">
                        Target: {m.targetDate?.substring(0, 10)}
                      </span>
                    </div>
                    <Badge
                      variant={m.status === "Overdue" ? "destructive" : "outline"}
                      className="shrink-0 py-0 font-mono text-[10px] uppercase"
                    >
                      {m.status === "Overdue" ? "Overdue" : m.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/calendar"
            className="flex items-center justify-end gap-1 border-t border-[#65685B]/30 pt-2 font-space text-[11px] font-bold uppercase tracking-wider text-[#D7FF00] hover:underline"
          >
            Calendar View <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Recent Notes */}
        <div className="flex flex-col justify-between space-y-4 rounded-2xl border border-[#65685B] bg-[#171C18] p-5 shadow-sm sm:p-6">
          <div>
            <div className="flex items-center justify-between border-b border-[#65685B]/30 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#D7FF00] font-black text-[#111512]">
                  <FileText className="h-3.5 w-3.5" />
                </div>
                <h3 className="font-space text-xs font-bold uppercase tracking-wider text-[#F3F0E6] sm:text-sm">
                  RECENT NOTES
                </h3>
              </div>
              <span className="rounded-full border border-[#65685B] bg-[#202720] px-2.5 py-0.5 font-mono text-[11px] text-[#A5A79B]">
                {recentNotes.length} notes
              </span>
            </div>

            {recentNotes.length === 0 ? (
              <div className="my-4 rounded-xl border border-dashed border-[#65685B]/50 py-10 text-center">
                <FileText className="mx-auto mb-2 h-6 w-6 stroke-[1.5] text-[#65685B]" />
                <p className="font-mono text-xs text-[#A5A79B]">No notes recorded yet.</p>
                <p className="mt-0.5 text-[11px] text-[#A5A79B]/60">
                  Synthesize learnings from topics.
                </p>
              </div>
            ) : (
              <div className="space-y-2 pt-3">
                {recentNotes.slice(0, 3).map((n) => (
                  <Link
                    key={n._id}
                    href={`/notes/${n._id}`}
                    className="group block rounded-xl border border-[#65685B]/40 bg-[#202720] p-3 transition-colors hover:border-[#D7FF00]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate font-space text-xs font-semibold text-[#F3F0E6] transition-colors group-hover:text-[#D7FF00]">
                        {n.title}
                      </span>
                      <span className="ml-1 shrink-0 font-mono text-[10px] text-[#A5A79B]">
                        {n.updatedAt?.substring(0, 10)}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-1 font-sans text-[11px] text-[#A5A79B]">
                      {n.content.replace(/#+\s/g, "")}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/notes"
            className="flex items-center justify-end gap-1 border-t border-[#65685B]/30 pt-2 font-space text-[11px] font-bold uppercase tracking-wider text-[#D7FF00] hover:underline"
          >
            All Notes <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Focus Sessions (Mirroring Study Sessions Log directly) */}
        <div className="flex flex-col justify-between space-y-4 rounded-2xl border border-[#65685B] bg-[#171C18] p-5 shadow-sm sm:p-6">
          <div>
            <div className="flex items-center justify-between border-b border-[#65685B]/30 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#D7FF00] font-black text-[#111512]">
                  <History className="h-3.5 w-3.5" />
                </div>
                <h3 className="font-space text-xs font-bold uppercase tracking-wider text-[#F3F0E6] sm:text-sm">
                  FOCUS SESSIONS LOG
                </h3>
              </div>
              <span className="rounded-full border border-[#65685B] bg-[#202720] px-2.5 py-0.5 font-mono text-[11px] text-[#A5A79B]">
                {recentSessions.length} sessions
              </span>
            </div>

            {recentSessions.length === 0 ? (
              <div className="my-4 rounded-xl border border-dashed border-[#65685B]/50 py-10 text-center">
                <Clock className="mx-auto mb-2 h-6 w-6 stroke-[1.5] text-[#65685B]" />
                <p className="font-mono text-xs text-[#A5A79B]">No study sessions recorded yet.</p>
                <p className="mt-0.5 text-[11px] text-[#A5A79B]/60">
                  Start your first focus session to see it here.
                </p>
              </div>
            ) : (
              <div className="space-y-2 pt-3">
                {recentSessions.slice(0, 3).map((s) => (
                  <div
                    key={s._id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-[#65685B]/40 bg-[#202720] p-3"
                  >
                    <div className="min-w-0">
                      <span className="block truncate font-space text-xs font-semibold text-[#F3F0E6]">
                        {s.title || "Study Session"}
                      </span>
                      <span className="font-mono text-[10px] text-[#A5A79B]">
                        {s.sessionDate?.substring(0, 10) || s.startedAt?.substring(0, 10)}
                      </span>
                    </div>
                    <span className="shrink-0 rounded border border-[#65685B]/60 bg-[#171C18] px-2 py-0.5 font-mono text-[11px] font-bold text-[#D7FF00]">
                      {s.durationMinutes}m
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/study-session"
            className="flex items-center justify-end gap-1 border-t border-[#65685B]/30 pt-2 font-space text-[11px] font-bold uppercase tracking-wider text-[#D7FF00] hover:underline"
          >
            Tracker Studio <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
