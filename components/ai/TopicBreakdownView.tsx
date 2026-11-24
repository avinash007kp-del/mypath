"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Split,
  Clock,
  Sparkles,
  CheckCircle2,
  CalendarPlus,
  Layers,
  Copy,
  Check,
  RefreshCw,
  HelpCircle,
  FileCode,
  ArrowRight,
} from "lucide-react";
import { TopicBreakdownResponse, SubtaskItem } from "@/types/ai";
import {
  breakdownTopicApi,
  addSubtasksToDailyGoalsApi,
  addSubtopicsToRoadmapNodeApi,
} from "@/services/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function TopicBreakdownView() {
  const searchParams = useSearchParams();
  const initialTopic = searchParams.get("topic") || "";
  const roadmapId = searchParams.get("roadmapId") || undefined;
  const nodeId = searchParams.get("nodeId") || undefined;

  const [topicTitle, setTopicTitle] = useState(initialTopic);
  const [difficulty, setDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">(
    "Intermediate"
  );
  const [depthLevel, setDepthLevel] = useState<
    "Standard (3-4 subtasks)" | "Detailed (5-7 subtasks)"
  >("Standard (3-4 subtasks)");
  const [loading, setLoading] = useState(false);
  const [addingToGoals, setAddingToGoals] = useState(false);
  const [savingToNode, setSavingToNode] = useState(false);
  const [data, setData] = useState<TopicBreakdownResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const handleBreakdown = async (overrideTopic?: string) => {
    const query = (overrideTopic || topicTitle).trim();
    if (!query) {
      toast.error("Please enter a topic to break down");
      return;
    }

    setLoading(true);
    try {
      const res = await breakdownTopicApi({
        topicTitle: query,
        roadmapId,
        nodeId,
        difficulty,
        depthLevel,
      });
      setData(res);
    } catch (err: any) {
      toast.error(err?.message || "Failed to break down topic");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialTopic) {
      setTopicTitle(initialTopic);
      handleBreakdown(initialTopic);
    }
  }, [initialTopic]);

  const handleAddToGoals = async () => {
    if (!data || data.subtasks.length === 0) return;
    try {
      setAddingToGoals(true);
      const today = new Date().toISOString().split("T")[0];
      await addSubtasksToDailyGoalsApi({
        date: today,
        subtasks: data.subtasks,
        topicTitle: data.topicTitle,
        roadmapId: data.roadmapId,
        nodeId: data.nodeId,
      });
      toast.success("Subtasks added as daily study goals for today!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to add subtasks to daily goals");
    } finally {
      setAddingToGoals(false);
    }
  };

  const handleSaveToNode = async () => {
    if (!data || !data.nodeId) return;
    try {
      setSavingToNode(true);
      await addSubtopicsToRoadmapNodeApi({
        nodeId: data.nodeId,
        subtasks: data.subtasks,
      });
      toast.success("Subtopics attached to roadmap node metadata!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to attach subtopics to node");
    } finally {
      setSavingToNode(false);
    }
  };

  const handleCopy = () => {
    if (!data) return;
    const text = `# ${data.topicTitle} Breakdown\nEstimated Hours: ~${data.totalEstimatedHours}h\n\n## Objectives:\n${data.objectives
      .map((o) => `- ${o}`)
      .join("\n")}\n\n## Subtasks:\n${data.subtasks
      .map(
        (s, i) =>
          `### ${i + 1}. ${s.title} (${s.estimatedMinutes}m)\n${s.description}\nExercise: ${s.practicalExercise}\nSuccess: ${s.successCriteria}\n`
      )
      .join("\n")}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Breakdown copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-8">
      {/* Header */}
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#62695D] bg-[#252D26] px-3 py-1 font-mono text-xs font-semibold text-[#D7FF00]">
          <Split className="h-3.5 w-3.5 text-[#D7FF00]" />
          <span>MICRO-TASK DECONSTRUCTION ENGINE</span>
        </div>
        <h1 className="font-mono text-2xl font-bold uppercase tracking-tight text-[#F3F0E6] sm:text-3xl">
          AI Topic Breakdown Assistant
        </h1>
        <p className="mt-1 max-w-2xl text-xs text-[#B8B9AA] sm:text-sm">
          Turn large, intimidating engineering concepts into actionable 25-45 minute exercises with
          measurable success criteria.
        </p>
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleBreakdown();
        }}
        className="space-y-4 rounded-2xl border border-[#62695D] bg-[#252D26] p-5"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={topicTitle}
            onChange={(e) => setTopicTitle(e.target.value)}
            placeholder="e.g. Distributed Database Sharding, React Server Actions, Kubernetes Ingress"
            className="flex-1 rounded-xl border border-[#62695D] bg-[#202720] px-4 py-2.5 font-mono text-xs text-[#F3F0E6] placeholder-[#B8B9AA]/50 focus:border-[#D7FF00] focus:outline-none"
          />

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as any)}
            className="rounded-xl border border-[#62695D] bg-[#202720] px-3 py-2.5 font-mono text-xs text-[#F3F0E6] focus:border-[#D7FF00] focus:outline-none"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          <select
            value={depthLevel}
            onChange={(e) => setDepthLevel(e.target.value as any)}
            className="rounded-xl border border-[#62695D] bg-[#202720] px-3 py-2.5 font-mono text-xs text-[#F3F0E6] focus:border-[#D7FF00] focus:outline-none"
          >
            <option value="Standard (3-4 subtasks)">Standard (3-4 subtasks)</option>
            <option value="Detailed (5-7 subtasks)">Detailed (5-7 subtasks)</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-[#D7FF00] px-6 py-2.5 font-mono text-xs font-bold uppercase text-[#1B211C] transition-all hover:bg-[#c2e600] disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin text-[#1B211C]" />
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-[#1B211C]" />
                <span>Break Down</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Breakdown Content */}
      {loading ? (
        <div className="py-20 text-center">
          <RefreshCw className="mx-auto mb-2 h-6 w-6 animate-spin text-[#D7FF00]" />
          <p className="font-mono text-xs text-[#B8B9AA]">
            Deconstructing topic into modular exercises...
          </p>
        </div>
      ) : !data ? (
        <div className="rounded-2xl border border-[#62695D] bg-[#252D26] p-6 py-16 text-center">
          <Split className="mx-auto mb-2 h-8 w-8 text-[#B8B9AA]" />
          <h3 className="mb-1 font-mono text-sm font-bold text-[#F3F0E6]">
            Enter a Topic to Deconstruct
          </h3>
          <p className="mx-auto max-w-sm text-xs text-[#B8B9AA]">
            Get practical mini-exercises, clear success metrics, and attach them directly to your
            daily study schedule.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Bar with Action Buttons */}
          <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#62695D] bg-[#252D26] p-5 sm:flex-row sm:items-center">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="rounded border border-[#62695D] bg-[#202720] px-2 py-0.5 font-mono text-[10px] font-bold text-[#D7FF00]">
                  ~{data.totalEstimatedHours}h Study Plan
                </span>
                <span className="rounded border border-[#62695D] bg-[#202720] px-2 py-0.5 font-mono text-[10px] text-[#B8B9AA]">
                  {data.subtasks.length} Subtasks
                </span>
              </div>
              <h2 className="font-mono text-base font-bold text-[#F3F0E6]">{data.topicTitle}</h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-xl border border-[#62695D] bg-[#202720] px-3 py-2 font-mono text-xs text-[#B8B9AA] transition-colors hover:bg-[#2C352D] hover:text-[#EDE8D8]"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-[#D7FF00]" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>

              {data.nodeId && (
                <button
                  onClick={handleSaveToNode}
                  disabled={savingToNode}
                  className="flex items-center gap-1.5 rounded-xl border border-[#62695D] bg-[#202720] px-3 py-2 font-mono text-xs text-[#B8B9AA] transition-colors hover:bg-[#2C352D] hover:text-[#EDE8D8] disabled:opacity-50"
                >
                  <Layers className="h-3.5 w-3.5 text-[#D7FF00]" />
                  <span>{savingToNode ? "Saving..." : "+ Save to Node"}</span>
                </button>
              )}

              <button
                onClick={handleAddToGoals}
                disabled={addingToGoals}
                className="flex items-center gap-1.5 rounded-xl bg-[#D7FF00] px-4 py-2 font-mono text-xs font-bold uppercase text-[#1B211C] shadow-md shadow-[#D7FF00]/15 transition-colors hover:bg-[#c2e600] disabled:opacity-50"
              >
                <CalendarPlus className="h-3.5 w-3.5 text-[#1B211C]" />
                <span>{addingToGoals ? "Adding..." : "+ Add to Daily Goals"}</span>
              </button>
            </div>
          </div>

          {/* Core Objectives Card */}
          {data.objectives && data.objectives.length > 0 && (
            <div className="rounded-2xl border border-[#62695D] bg-[#252D26] p-5">
              <h3 className="mb-2.5 font-mono text-xs font-bold uppercase tracking-wider text-[#D7FF00]">
                Core Learning Objectives
              </h3>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {data.objectives.map((obj, oIdx) => (
                  <div key={oIdx} className="flex items-start gap-2 text-xs text-[#F3F0E6]">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#D7FF00]" />
                    <span>{obj}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sequential Subtasks Cards */}
          <div className="space-y-4">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#B8B9AA]">
              Step-by-Step Practical Subtasks
            </h3>

            {data.subtasks.map((st, idx) => (
              <div
                key={st.id || idx}
                className="space-y-3 rounded-2xl border border-[#62695D] bg-[#252D26] p-5"
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg border border-[#62695D] bg-[#202720] font-mono text-xs font-bold text-[#D7FF00]">
                      {idx + 1}
                    </span>
                    <h4 className="font-mono text-sm font-bold text-[#F3F0E6]">{st.title}</h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded border border-[#62695D]/50 bg-[#202720] px-2 py-0.5 font-mono text-[11px] text-[#B8B9AA]">
                      ~{st.estimatedMinutes}m
                    </span>
                    <span className="rounded border border-[#62695D]/50 bg-[#202720] px-1.5 py-0.5 font-mono text-[10px] text-[#B8B9AA]">
                      {st.difficulty}
                    </span>
                  </div>
                </div>

                {/* Explanation */}
                <p className="text-xs leading-relaxed text-[#B8B9AA]">{st.description}</p>

                {/* Practical Exercise Box */}
                <div className="space-y-1 rounded-xl border border-[#62695D] bg-[#202720] p-3.5">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#D7FF00]">
                    <FileCode className="h-3.5 w-3.5 text-[#D7FF00]" />
                    <span>Hands-on Exercise:</span>
                  </div>
                  <p className="font-mono text-xs leading-relaxed text-[#EDE8D8]">
                    {st.practicalExercise}
                  </p>
                </div>

                {/* Success Criteria */}
                <div className="flex items-start gap-2 pt-1 text-xs text-[#B8B9AA]">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#D7FF00]" />
                  <div>
                    <span className="font-semibold text-[#EDE8D8]">Success Criteria: </span>
                    <span>{st.successCriteria}</span>
                  </div>
                </div>

                {/* Terminology Tags */}
                {st.keyTerminology && st.keyTerminology.length > 0 && (
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="font-mono text-[10px] text-[#B8B9AA]">Key Terms:</span>
                    <div className="flex flex-wrap gap-1">
                      {st.keyTerminology.map((term, tIdx) => (
                        <span
                          key={tIdx}
                          className="rounded border border-[#62695D] bg-[#202720] px-1.5 py-0.5 font-mono text-[9px] text-[#B8B9AA]"
                        >
                          {term}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
