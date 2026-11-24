"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  BookOpen,
  Split,
  HelpCircle,
  FileCode,
  Copy,
  Check,
  ExternalLink,
  BookmarkPlus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TopicExplanationResponse,
  TopicBreakdownResponse,
  ResourceSuggestionResponse,
  QuizResponse,
} from "@/types/ai";
import {
  explainTopicApi,
  breakdownTopicApi,
  fetchAIResourcesApi,
  generateQuizApi,
  createResourceApi,
  addSubtasksToDailyGoalsApi,
} from "@/services/api";
import { toast } from "sonner";

interface NodeAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicTitle: string;
  roadmapId?: string;
  nodeId?: string;
  initialTab?: "explain" | "breakdown" | "resources" | "quiz";
}

export function NodeAIModal({
  isOpen,
  onClose,
  topicTitle,
  roadmapId,
  nodeId,
  initialTab = "explain",
}: NodeAIModalProps) {
  const [activeTab, setActiveTab] = useState<"explain" | "breakdown" | "resources" | "quiz">(
    initialTab
  );
  const [loading, setLoading] = useState(false);

  // Data states
  const [explanation, setExplanation] = useState<TopicExplanationResponse | null>(null);
  const [breakdown, setBreakdown] = useState<TopicBreakdownResponse | null>(null);
  const [resources, setResources] = useState<ResourceSuggestionResponse | null>(null);
  const [quiz, setQuiz] = useState<QuizResponse | null>(null);

  // Quiz interactive state
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  // Saved resources
  const [savedUrls, setSavedUrls] = useState<Set<string>>(new Set());
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && topicTitle) {
      loadTabData(activeTab);
    }
  }, [isOpen, topicTitle, activeTab]);

  const loadTabData = async (tab: typeof activeTab) => {
    setLoading(true);
    try {
      if (tab === "explain" && !explanation) {
        const res = await explainTopicApi({
          topicTitle,
          difficulty: "Intermediate",
          includeCode: true,
        });
        setExplanation(res);
      } else if (tab === "breakdown" && !breakdown) {
        const res = await breakdownTopicApi({
          topicTitle,
          roadmapId,
          nodeId,
          difficulty: "Intermediate",
          depthLevel: "Standard (3-4 subtasks)",
        });
        setBreakdown(res);
      } else if (tab === "resources" && !resources) {
        const res = await fetchAIResourcesApi({
          topicTitle,
          difficulty: "Intermediate",
        });
        setResources(res);
      } else if (tab === "quiz" && !quiz) {
        const res = await generateQuizApi({
          topicTitle,
          difficulty: "Intermediate",
          questionCount: 4,
        });
        setQuiz(res);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to load AI content");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIdx(idx);
    toast.success("Code copied to clipboard");
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  const handleSaveResource = async (res: any) => {
    try {
      await createResourceApi({
        title: res.title,
        url: res.url,
        type: "Documentation",
        author: res.authorOrPlatform || res.domain || "Official Documentation",
        description: res.description,
        tags: [topicTitle, "AI-Suggested"],
        rating: 5,
        isFavorite: false,
        status: "Pending",
      });
      setSavedUrls((prev) => new Set(prev).add(res.url));
      toast.success("Saved to your personal LMS resources!");
    } catch {
      toast.error("Failed to save resource");
    }
  };

  const handleAddBreakdownToGoals = async () => {
    if (!breakdown || breakdown.subtasks.length === 0) return;
    try {
      const today = new Date().toISOString().split("T")[0];
      await addSubtasksToDailyGoalsApi({
        date: today,
        subtasks: breakdown.subtasks,
        topicTitle: breakdown.topicTitle,
        roadmapId,
        nodeId,
      });
      toast.success("Subtasks added as daily study goals for today!");
    } catch {
      toast.error("Failed to add subtasks to daily goals");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#62695D] bg-[#252D26] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#62695D] bg-[#202720] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#62695D] bg-[#2C352D] text-[#D7FF00]">
              <Sparkles className="h-4 w-4 text-[#D7FF00]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="max-w-md truncate font-mono text-sm font-bold text-[#F3F0E6]">
                  {topicTitle}
                </h3>
                <span className="rounded border border-[#62695D] bg-[#252D26] px-2 py-0.5 font-mono text-[10px] font-bold text-[#D7FF00]">
                  AI Context
                </span>
              </div>
              <p className="text-[11px] text-[#B8B9AA]">Node Learning Assistant & Assessment</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#B8B9AA] transition-colors hover:bg-[#2C352D] hover:text-[#EDE8D8]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#62695D] bg-[#202720] px-6">
          {[
            { id: "explain", label: "Explain Topic", icon: Sparkles },
            { id: "breakdown", label: "Break Down", icon: Split },
            { id: "resources", label: "Find Resources", icon: BookOpen },
            { id: "quiz", label: "Practice Quiz", icon: HelpCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 border-b-2 px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider transition-colors",
                  isActive
                    ? "border-[#D7FF00] text-[#D7FF00]"
                    : "border-transparent text-[#B8B9AA] hover:text-[#EDE8D8]"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="custom-scrollbar flex-1 space-y-6 overflow-y-auto bg-[#1B211C] p-6">
          {loading ? (
            <div className="py-20 text-center">
              <RefreshCw className="mx-auto mb-2 h-6 w-6 animate-spin text-[#D7FF00]" />
              <p className="font-mono text-xs text-[#B8B9AA]">Synthesizing node intelligence...</p>
            </div>
          ) : activeTab === "explain" && explanation ? (
            <div className="space-y-5">
              {/* Summary */}
              <div className="rounded-xl border border-[#62695D] bg-[#252D26] p-4">
                <h4 className="mb-2 font-mono text-xs font-bold uppercase tracking-wider text-[#D7FF00]">
                  Executive Concept Summary
                </h4>
                <p className="whitespace-pre-wrap text-xs leading-relaxed text-[#F3F0E6]">
                  {explanation.summary}
                </p>
              </div>

              {/* Key Concepts */}
              {explanation.keyConcepts && explanation.keyConcepts.length > 0 && (
                <div>
                  <h4 className="mb-2 font-mono text-xs font-bold uppercase tracking-wider text-[#EDE8D8]">
                    Core Mechanics & Principles
                  </h4>
                  <ul className="space-y-1.5">
                    {explanation.keyConcepts.map((kc, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-[#F3F0E6]">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#D7FF00]" />
                        <span>{kc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Code Examples */}
              {explanation.codeExamples && explanation.codeExamples.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#EDE8D8]">
                    Production Code Example
                  </h4>
                  {explanation.codeExamples.map((ce, cIdx) => (
                    <div
                      key={cIdx}
                      className="overflow-hidden rounded-xl border border-[#62695D] bg-[#202720]"
                    >
                      <div className="flex items-center justify-between border-b border-[#62695D] bg-[#252D26] px-3 py-1.5 text-[11px] text-[#B8B9AA]">
                        <span className="font-mono font-semibold text-[#EDE8D8]">{ce.title}</span>
                        <button
                          onClick={() => handleCopyCode(ce.code, cIdx)}
                          className="flex items-center gap-1 transition-colors hover:text-[#EDE8D8]"
                        >
                          {copiedCodeIdx === cIdx ? (
                            <Check className="h-3 w-3 text-[#D7FF00]" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                          <span>{copiedCodeIdx === cIdx ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                      <pre className="overflow-x-auto p-3 font-mono text-xs leading-relaxed text-[#D7FF00]">
                        <code>{ce.code}</code>
                      </pre>
                      <div className="border-t border-[#62695D] bg-[#202720] p-2.5 text-[11px] text-[#B8B9AA]">
                        {ce.explanation}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Analogies & Pitfalls */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {explanation.analogies && (
                  <div className="space-y-2 rounded-xl border border-[#62695D] bg-[#252D26] p-4">
                    <h5 className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#D7FF00]">
                      Intuitive Analogy
                    </h5>
                    {explanation.analogies.map((an, i) => (
                      <p key={i} className="text-xs italic leading-relaxed text-[#F3F0E6]">
                        &quot;{an}&quot;
                      </p>
                    ))}
                  </div>
                )}

                {explanation.commonPitfalls && (
                  <div className="space-y-2 rounded-xl border border-rose-600/40 bg-[#252D26] p-4">
                    <h5 className="font-mono text-[11px] font-bold uppercase tracking-wider text-rose-300">
                      Common Pitfalls to Avoid
                    </h5>
                    <ul className="space-y-1">
                      {explanation.commonPitfalls.map((pit, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-[#F3F0E6]">
                          <span className="font-bold text-rose-400">•</span>
                          <span>{pit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === "breakdown" && breakdown ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-[#62695D] bg-[#252D26] p-3.5">
                <span className="font-mono text-xs font-bold text-[#EDE8D8]">
                  {breakdown.subtasks.length} Subtasks (~{breakdown.totalEstimatedHours}h Total)
                </span>
                <button
                  onClick={handleAddBreakdownToGoals}
                  className="flex items-center gap-1.5 rounded-lg bg-[#D7FF00] px-3 py-1.5 font-mono text-xs font-bold uppercase text-[#1B211C] transition-colors hover:bg-[#c2e600]"
                >
                  <span>+ Add to Today&apos;s Daily Goals</span>
                </button>
              </div>

              {breakdown.subtasks.map((st, i) => (
                <div
                  key={i}
                  className="space-y-2 rounded-xl border border-[#62695D] bg-[#252D26] p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#F3F0E6]">
                      {i + 1}. {st.title}
                    </span>
                    <span className="rounded bg-[#D7FF00] px-2 py-0.5 font-mono text-[10px] font-bold text-[#1B211C]">
                      ~{st.estimatedMinutes}m
                    </span>
                  </div>
                  <p className="text-xs text-[#B8B9AA]">{st.description}</p>
                  <div className="rounded-lg border border-[#62695D] bg-[#202720] p-2.5 font-mono text-[11px] text-[#EDE8D8]">
                    <span className="font-bold text-[#D7FF00]">Exercise: </span>
                    {st.practicalExercise}
                  </div>
                </div>
              ))}
            </div>
          ) : activeTab === "resources" && resources ? (
            <div className="space-y-3">
              {resources.resources.map((res, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-4 rounded-xl border border-[#62695D] bg-[#252D26] p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded border border-[#62695D] bg-[#202720] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#D7FF00]">
                        {res.type}
                      </span>
                      <span className="font-mono text-xs font-bold text-[#F3F0E6]">
                        {res.title}
                      </span>
                    </div>
                    <p className="text-xs text-[#B8B9AA]">{res.description}</p>
                    <span className="font-mono text-[10px] text-[#B8B9AA]">{res.domain}</span>
                  </div>

                  <div className="flex flex-shrink-0 items-center gap-2">
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-[#62695D] bg-[#202720] p-2 text-[#B8B9AA] transition-colors hover:border-[#D7FF00] hover:text-[#EDE8D8]"
                      title="Open link"
                    >
                      <ExternalLink className="h-4 w-4 text-[#D7FF00]" />
                    </a>
                    <button
                      onClick={() => handleSaveResource(res)}
                      disabled={savedUrls.has(res.url)}
                      className="rounded-lg border border-[#62695D] bg-[#202720] p-2 text-[#B8B9AA] transition-colors hover:bg-[#2C352D] hover:text-[#EDE8D8]"
                      title="Save to LMS"
                    >
                      {savedUrls.has(res.url) ? (
                        <Check className="h-4 w-4 text-[#D7FF00]" />
                      ) : (
                        <BookmarkPlus className="h-4 w-4 text-[#EDE8D8]" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : activeTab === "quiz" && quiz ? (
            <div className="space-y-6">
              {quiz.questions.map((q, qIdx) => {
                const selectedOption = userAnswers[q.id];
                const isAnswered = selectedOption !== undefined;

                return (
                  <div
                    key={q.id || qIdx}
                    className="space-y-3 rounded-xl border border-[#62695D] bg-[#252D26] p-5"
                  >
                    <div className="flex items-center justify-between font-mono text-[11px] text-[#B8B9AA]">
                      <span className="font-bold text-[#EDE8D8]">Question #{qIdx + 1}</span>
                      <span className="rounded border border-[#62695D] bg-[#202720] px-2 py-0.5">
                        {q.difficulty}
                      </span>
                    </div>

                    <p className="text-xs font-semibold leading-relaxed text-[#F3F0E6]">
                      {q.question}
                    </p>

                    <div className="space-y-2 pt-1">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = selectedOption === optIdx;
                        const isCorrect = q.correctOptionIndex === optIdx;

                        let optionStyle =
                          "bg-[#202720] border-[#62695D] text-[#B8B9AA] hover:border-[#D7FF00]";
                        if (isAnswered) {
                          if (isCorrect) {
                            optionStyle = "bg-[#2C352D] border-[#D7FF00] text-[#D7FF00] font-bold";
                          } else if (isSelected && !isCorrect) {
                            optionStyle = "bg-rose-950/70 border-rose-500 text-rose-200";
                          } else {
                            optionStyle =
                              "bg-[#202720] border-[#62695D]/40 text-[#B8B9AA] opacity-40";
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={isAnswered}
                            onClick={() => setUserAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                            className={cn(
                              "flex w-full items-center justify-between rounded-xl border p-3 text-left font-mono text-xs transition-all",
                              optionStyle
                            )}
                          >
                            <span>{opt}</span>
                            {isAnswered && isCorrect && (
                              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#D7FF00]" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {isAnswered && (
                      <div className="rounded-lg border border-[#62695D] bg-[#202720] p-3 text-xs text-[#F3F0E6]">
                        <span className="font-mono font-bold text-[#D7FF00]">Explanation: </span>
                        <span>{q.explanation}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
