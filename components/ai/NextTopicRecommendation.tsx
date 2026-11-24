"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Target,
  Sparkles,
  Zap,
  CheckCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  BookOpen,
  Split,
  Layers,
  AlertCircle,
} from "lucide-react";
import { NextTopicResponse, NextTopicItem } from "@/types/ai";
import { IRoadmap } from "@/types";
import { fetchAINextTopicApi, fetchRoadmaps } from "@/services/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function NextTopicRecommendation() {
  const [roadmaps, setRoadmaps] = useState<IRoadmap[]>([]);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string>("All");
  const [quickWins, setQuickWins] = useState(false);
  const [data, setData] = useState<NextTopicResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Load roadmaps list for filter dropdown
  useEffect(() => {
    async function loadRoadmaps() {
      try {
        const list = await fetchRoadmaps();
        setRoadmaps(list);
      } catch {
        // ignore
      }
    }
    loadRoadmaps();
  }, []);

  // Fetch recommendations
  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const res = await fetchAINextTopicApi({
        roadmapId: selectedRoadmapId !== "All" ? selectedRoadmapId : undefined,
        quickWins,
      });
      setData(res);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load topic recommendations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, [selectedRoadmapId, quickWins]);

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "quick_win":
        return {
          label: "QUICK WIN",
          icon: Zap,
          className: "bg-[#252D26] text-[#D7FF00] border-[#62695D]",
        };
      case "career_critical":
        return {
          label: "CORE GATEWAY",
          icon: Sparkles,
          className: "bg-[#D7FF00] text-[#1B211C] border-[#D7FF00] font-bold",
        };
      case "revision":
        return {
          label: "SPACED REVISION",
          icon: Clock,
          className: "bg-[#252D26] text-[#EDE8D8] border-[#62695D]",
        };
      default:
        return {
          label: "NEXT UP",
          icon: Target,
          className: "bg-[#2C352D] text-[#D7FF00] border-[#62695D]",
        };
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#62695D] bg-[#252D26] px-3 py-1 font-mono text-xs font-semibold text-[#D7FF00]">
            <Target className="h-3.5 w-3.5 text-[#D7FF00]" />
            <span>DEPENDENCY GRAPH & READINESS ENGINE</span>
          </div>
          <h1 className="font-mono text-2xl font-bold uppercase tracking-tight text-[#F3F0E6] sm:text-3xl">
            AI Next Topic Recommender
          </h1>
          <p className="mt-1 text-xs text-[#B8B9AA] sm:text-sm">
            Calculated directly from your completed topics, prerequisite edges, and study velocity.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedRoadmapId}
            onChange={(e) => setSelectedRoadmapId(e.target.value)}
            className="rounded-xl border border-[#62695D] bg-[#202720] px-3 py-2 font-mono text-xs text-[#F3F0E6] focus:border-[#D7FF00] focus:outline-none"
          >
            <option value="All">All Active Roadmaps</option>
            {roadmaps.map((r) => (
              <option key={r._id} value={r._id}>
                {r.title}
              </option>
            ))}
          </select>

          <button
            onClick={() => setQuickWins(!quickWins)}
            className={cn(
              "flex items-center gap-1.5 rounded-xl border px-3 py-2 font-mono text-xs font-bold transition-colors",
              quickWins
                ? "border-[#D7FF00] bg-[#D7FF00] text-[#1B211C]"
                : "border-[#62695D] bg-[#202720] text-[#B8B9AA] hover:text-[#EDE8D8]"
            )}
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Quick Wins (&lt;45m)</span>
          </button>

          <button
            onClick={loadRecommendations}
            disabled={loading}
            className="rounded-xl border border-[#62695D] bg-[#202720] p-2 text-[#B8B9AA] transition-colors hover:text-[#EDE8D8]"
            title="Refresh recommendations"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin text-[#D7FF00]")} />
          </button>
        </div>
      </div>

      {/* Analysis Summary Callout */}
      {data && (
        <div className="flex items-center justify-between rounded-xl border border-[#62695D] bg-[#252D26] p-4 text-xs text-[#F3F0E6]">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#D7FF00]" />
            <span className="font-mono">{data.summary}</span>
          </div>
          <span className="hidden font-mono text-[11px] text-[#B8B9AA] sm:inline">
            {data.completedTopicsCount} topics mastered
          </span>
        </div>
      )}

      {/* Recommendations Cards List */}
      {loading ? (
        <div className="py-20 text-center">
          <RefreshCw className="mx-auto mb-2 h-6 w-6 animate-spin text-[#D7FF00]" />
          <p className="font-mono text-xs text-[#B8B9AA]">
            Analyzing prerequisite dependency graphs...
          </p>
        </div>
      ) : !data || data.recommendations.length === 0 ? (
        <div className="rounded-2xl border border-[#62695D] bg-[#252D26] p-6 py-16 text-center">
          <AlertCircle className="mx-auto mb-2 h-8 w-8 text-[#B8B9AA]" />
          <h3 className="mb-1 font-mono text-sm font-bold text-[#F3F0E6]">
            No Unblocked Topics Found
          </h3>
          <p className="mx-auto mb-4 max-w-sm text-xs text-[#B8B9AA]">
            You might have finished all topics in this roadmap, or all pending topics are waiting on
            prerequisites.
          </p>
          <Link
            href="/ai-assistant/roadmap-generator"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#D7FF00] px-4 py-2 font-mono text-xs font-bold text-[#1B211C] transition-colors hover:bg-[#c2e600]"
          >
            <Sparkles className="h-4 w-4 text-[#1B211C]" />
            <span>Generate a New Roadmap</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {data.recommendations.map((rec, index) => {
            const badge = getTypeBadge(rec.type);
            const Icon = badge.icon;

            return (
              <div
                key={rec.nodeId || index}
                className="space-y-4 rounded-2xl border border-[#62695D] bg-[#252D26] p-5 transition-all hover:border-[#D7FF00]"
              >
                {/* Card Header */}
                <div className="flex flex-col justify-between gap-2 border-b border-[#62695D]/40 pb-3 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-[#B8B9AA]">#{index + 1}</span>
                    <div
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold",
                        badge.className
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      <span>{badge.label}</span>
                    </div>
                    <span className="text-xs text-[#B8B9AA]">
                      in{" "}
                      <span className="font-mono font-bold text-[#EDE8D8]">{rec.roadmapTitle}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 rounded-md border border-[#62695D]/50 bg-[#202720] px-2.5 py-1 font-mono text-[11px] text-[#B8B9AA]">
                      <Clock className="h-3.5 w-3.5 text-[#D7FF00]" />
                      <span>~{rec.estimatedMinutes}m</span>
                    </div>
                    <div className="flex items-center gap-1 rounded-md border border-[#62695D]/50 bg-[#202720] px-2.5 py-1 font-mono text-[11px]">
                      <span className="font-bold text-[#D7FF00]">{rec.priorityScore}%</span>
                      <span className="text-[#B8B9AA]">match</span>
                    </div>
                  </div>
                </div>

                {/* Topic Title & Rationale */}
                <div>
                  <h3 className="mb-1.5 font-mono text-base font-bold text-[#F3F0E6]">
                    {rec.topicTitle}
                  </h3>
                  <p className="rounded-xl border border-[#62695D] bg-[#202720] p-3 text-xs leading-relaxed text-[#F3F0E6]">
                    <span className="font-mono font-bold text-[#D7FF00]">
                      Recommendation Rationale:{" "}
                    </span>
                    {rec.rationale}
                  </p>
                </div>

                {/* Prerequisites Status & Badges */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    {rec.prerequisitesMet ? (
                      <span className="inline-flex items-center gap-1 rounded border border-[#62695D] bg-[#2C352D] px-2 py-0.5 font-mono text-[11px] text-[#D7FF00]">
                        <CheckCircle className="h-3 w-3 text-[#D7FF00]" />
                        Prerequisites Satisfied
                      </span>
                    ) : (
                      <span className="rounded border border-amber-600/50 bg-[#2C352D] px-2 py-0.5 font-mono text-[11px] text-amber-300">
                        Missing: {rec.unmetPrerequisites?.join(", ")}
                      </span>
                    )}
                    <span className="rounded border border-[#62695D] bg-[#202720] px-2 py-0.5 font-mono text-[11px] text-[#B8B9AA]">
                      {rec.difficulty}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/ai-assistant/resource-finder?topic=${encodeURIComponent(
                        rec.topicTitle
                      )}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#62695D] bg-[#202720] px-2.5 py-1.5 font-mono text-[11px] text-[#B8B9AA] transition-colors hover:border-[#D7FF00] hover:text-[#EDE8D8]"
                    >
                      <BookOpen className="h-3 w-3 text-[#D7FF00]" />
                      <span>Find Resources</span>
                    </Link>

                    <Link
                      href={`/ai-assistant/topic-breakdown?topic=${encodeURIComponent(
                        rec.topicTitle
                      )}&roadmapId=${rec.roadmapId}&nodeId=${rec.nodeId}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#62695D] bg-[#202720] px-2.5 py-1.5 font-mono text-[11px] text-[#B8B9AA] transition-colors hover:border-[#D7FF00] hover:text-[#EDE8D8]"
                    >
                      <Split className="h-3 w-3 text-[#EDE8D8]" />
                      <span>Break Down</span>
                    </Link>

                    <Link
                      href={`/roadmaps/${rec.roadmapId}/editor`}
                      className="inline-flex items-center gap-1 rounded-lg bg-[#D7FF00] px-3 py-1.5 font-mono text-[11px] font-bold text-[#1B211C] transition-colors hover:bg-[#c2e600]"
                    >
                      <span>Open Canvas</span>
                      <ArrowRight className="h-3 w-3 text-[#1B211C]" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
