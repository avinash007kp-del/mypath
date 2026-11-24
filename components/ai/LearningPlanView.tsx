"use client";

import React, { useState, useEffect } from "react";
import {
  CalendarDays,
  Clock,
  Sparkles,
  Target,
  Lightbulb,
  CheckCircle2,
  RefreshCw,
  Flame,
  ArrowRight,
} from "lucide-react";
import { PersonalizedLearningPlanResponse } from "@/types/ai";
import { generateLearningPlanApi } from "@/services/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function LearningPlanView() {
  const [weeklyHours, setWeeklyHours] = useState(14);
  const [targetMilestone, setTargetMilestone] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PersonalizedLearningPlanResponse | null>(null);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await generateLearningPlanApi({
        weeklyHours,
        targetMilestone: targetMilestone.trim() || undefined,
      });
      setData(res);
      toast.success("Personalized learning plan generated!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate learning plan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGenerate();
  }, []);

  const getActionColor = (action: string) => {
    switch (action) {
      case "Hands-on Exercise":
        return "bg-[#252D26] text-[#D7FF00] border-[#62695D]";
      case "Build Mini-Project":
        return "bg-[#D7FF00] text-[#1B211C] border-[#D7FF00] font-bold";
      case "Review & Flashcards":
        return "bg-[#252D26] text-[#EDE8D8] border-[#62695D]";
      default:
        return "bg-[#2C352D] text-[#D7FF00] border-[#62695D]";
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-8">
      {/* Header */}
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#62695D] bg-[#252D26] px-3 py-1 font-mono text-xs font-semibold text-[#D7FF00]">
          <CalendarDays className="h-3.5 w-3.5 text-[#D7FF00]" />
          <span>ADAPTIVE STUDY CADENCE</span>
        </div>
        <h1 className="font-mono text-2xl font-bold uppercase tracking-tight text-[#F3F0E6] sm:text-3xl">
          AI Personalized Weekly Learning Plan
        </h1>
        <p className="mt-1 max-w-2xl text-xs text-[#B8B9AA] sm:text-sm">
          Balances cognitive theory, deliberate coding practice, and weekly milestone delivery
          tailored to your active roadmaps and available study hours.
        </p>
      </div>

      {/* Configuration Controls Bar */}
      <form
        onSubmit={handleGenerate}
        className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#62695D] bg-[#252D26] p-5 md:flex-row"
      >
        <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-center md:w-auto">
          <div>
            <label className="mb-1 block font-mono text-[11px] font-bold uppercase text-[#B8B9AA]">
              Weekly Hours Target
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="2"
                max="60"
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(parseInt(e.target.value, 10) || 14)}
                className="w-20 rounded-xl border border-[#62695D] bg-[#202720] px-3 py-2 font-mono text-xs font-bold text-[#F3F0E6] focus:border-[#D7FF00] focus:outline-none"
              />
              <span className="font-mono text-xs text-[#B8B9AA]">
                hours/week (~{Number((weeklyHours / 7).toFixed(1))}h/day)
              </span>
            </div>
          </div>

          <div className="w-full sm:w-64">
            <label className="mb-1 block font-mono text-[11px] font-bold uppercase text-[#B8B9AA]">
              Target Milestone (Optional)
            </label>
            <input
              type="text"
              value={targetMilestone}
              onChange={(e) => setTargetMilestone(e.target.value)}
              placeholder="e.g. Master React hooks & state"
              className="w-full rounded-xl border border-[#62695D] bg-[#202720] px-3 py-2 font-mono text-xs text-[#F3F0E6] placeholder-[#B8B9AA]/50 focus:border-[#D7FF00] focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#D7FF00] px-6 py-2.5 font-mono text-xs font-bold uppercase text-[#1B211C] transition-all hover:bg-[#c2e600] disabled:opacity-50 md:w-auto"
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin text-[#1B211C]" />
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-[#1B211C]" />
              <span>Regenerate Schedule</span>
            </>
          )}
        </button>
      </form>

      {/* Plan Display */}
      {loading ? (
        <div className="py-20 text-center">
          <RefreshCw className="mx-auto mb-2 h-6 w-6 animate-spin text-[#D7FF00]" />
          <p className="font-mono text-xs text-[#B8B9AA]">
            Balancing study hours and active curriculum topics...
          </p>
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Summary and Habit Banner */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Overview */}
            <div className="space-y-2 rounded-2xl border border-[#62695D] bg-[#252D26] p-5">
              <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[#D7FF00]">
                <Target className="h-4 w-4 text-[#D7FF00]" />
                <span>Weekly Milestone</span>
              </div>
              <p className="font-mono text-sm font-bold text-[#EDE8D8]">{data.weeklyMilestone}</p>
              <p className="text-xs leading-relaxed text-[#B8B9AA]">{data.summary}</p>
            </div>

            {/* Habit Advice */}
            <div className="space-y-2 rounded-2xl border border-[#62695D] bg-[#252D26] p-5">
              <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[#D7FF00]">
                <Flame className="h-4 w-4 text-[#D7FF00]" />
                <span>Behavioral & Habit Recommendation</span>
              </div>
              <p className="text-xs leading-relaxed text-[#F3F0E6]">{data.habitRecommendation}</p>
            </div>
          </div>

          {/* 7-Day Visual Schedule Grid */}
          <div className="space-y-3">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#B8B9AA]">
              7-Day Study Cadence
            </h3>

            <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-3">
              {data.dailySchedules.map((schedule, idx) => {
                const isWeekend = schedule.day === "Saturday" || schedule.day === "Sunday";

                return (
                  <div
                    key={schedule.day || idx}
                    className={cn(
                      "flex flex-col justify-between rounded-2xl border border-[#62695D] bg-[#252D26] p-4 transition-colors hover:border-[#D7FF00]"
                    )}
                  >
                    <div>
                      {/* Day Header */}
                      <div className="mb-2.5 flex items-center justify-between border-b border-[#62695D]/40 pb-2.5">
                        <span className="font-mono text-xs font-bold uppercase text-[#F3F0E6]">
                          {schedule.day}
                        </span>
                        <div className="flex items-center gap-1 rounded border border-[#62695D] bg-[#202720] px-2 py-0.5 font-mono text-[11px] font-bold text-[#D7FF00]">
                          <Clock className="h-3 w-3 text-[#D7FF00]" />
                          <span>~{schedule.targetHours}h</span>
                        </div>
                      </div>

                      {/* Focus Topics */}
                      <div className="mb-3 space-y-2">
                        {schedule.focusTopics.map((topic, tIdx) => (
                          <div
                            key={tIdx}
                            className="rounded-xl border border-[#62695D]/40 bg-[#202720] p-2.5"
                          >
                            <div className="mb-1 flex items-center justify-between gap-1">
                              <span
                                className={cn(
                                  "rounded border px-1.5 py-0.5 font-mono text-[9px]",
                                  getActionColor(topic.action)
                                )}
                              >
                                {topic.action}
                              </span>
                              <span className="font-mono text-[10px] text-[#B8B9AA]">
                                ~{topic.estimatedMinutes}m
                              </span>
                            </div>
                            <h5 className="text-xs font-bold text-[#F3F0E6]">{topic.topicTitle}</h5>
                            <span className="block truncate font-mono text-[10px] text-[#B8B9AA]">
                              {topic.roadmapTitle}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Daily Practical Tip */}
                    <div className="flex items-start gap-1.5 border-t border-[#62695D]/40 pt-2 text-[11px] text-[#B8B9AA]">
                      <Lightbulb className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#D7FF00]" />
                      <span className="leading-tight">{schedule.practicalTip}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
