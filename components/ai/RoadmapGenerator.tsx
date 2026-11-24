"use client";

import React, { useState } from "react";
import {
  Compass,
  Sparkles,
  Clock,
  Target,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Sliders,
  CheckCircle,
} from "lucide-react";
import { IGeneratedRoadmap } from "@/types/ai";
import { generateAIRoadmapApi } from "@/services/api";
import { GeneratedRoadmapPreview } from "./GeneratedRoadmapPreview";
import { toast } from "sonner";

const QUICK_GOALS = [
  "Senior Full-Stack Engineer (Next.js & TypeScript)",
  "AI & Machine Learning Systems Architect",
  "Distributed Cloud & Systems Specialist",
  "DevOps & Kubernetes SRE Specialist",
  "Modern React & Frontend Platform Engineer",
];

export function RoadmapGenerator() {
  const [careerGoal, setCareerGoal] = useState("");
  const [currentLevel, setCurrentLevel] = useState<
    | "Complete Beginner"
    | "Novice / Basic Familiarity"
    | "Intermediate / Working Knowledge"
    | "Advanced / Upskilling"
  >("Intermediate / Working Knowledge");
  const [dailyHours, setDailyHours] = useState(2);
  const [targetDuration, setTargetDuration] = useState("12 Weeks");
  const [learningStyle, setLearningStyle] = useState<
    "Hands-on Projects" | "Deep Conceptual & Theory" | "Fast-paced & Practical" | "Balanced"
  >("Balanced");
  const [existingKnowledge, setExistingKnowledge] = useState("");
  const [focusAreas, setFocusAreas] = useState("");

  const [loading, setLoading] = useState(false);
  const [generatedRoadmap, setGeneratedRoadmap] = useState<IGeneratedRoadmap | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!careerGoal.trim()) {
      toast.error("Please enter a career goal or target role");
      return;
    }

    setLoading(true);
    try {
      const res = await generateAIRoadmapApi({
        careerGoal,
        currentLevel,
        dailyHours,
        targetDuration,
        learningStyle,
        existingKnowledge: existingKnowledge.trim() || undefined,
        focusAreas: focusAreas.trim() || undefined,
      });

      setGeneratedRoadmap(res.roadmap);
      toast.success("Roadmap generated successfully!");
      if (res.isFallback) {
        toast.info("Generated using MyPath curated curriculum blueprint");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate roadmap");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl p-4 sm:p-8">
      {/* Top Header */}
      <div className="mb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#62695D] bg-[#252D26] px-3 py-1 font-mono text-xs font-semibold text-[#D7FF00]">
          <Compass className="h-3.5 w-3.5 text-[#D7FF00]" />
          <span>INTELLIGENT CURRICULUM ARCHITECTURE</span>
        </div>
        <h1 className="font-mono text-2xl font-bold uppercase tracking-tight text-[#F3F0E6] sm:text-3xl">
          AI Roadmap Generator
        </h1>
        <p className="mt-1 max-w-2xl text-xs leading-relaxed text-[#B8B9AA] sm:text-sm">
          Enter your target software engineering role, study capacity, and experience level. MyPath
          AI generates an interconnected curriculum graph with realistic hours, prerequisites, and
          capstone milestones.
        </p>
      </div>

      {generatedRoadmap ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#62695D] pb-4">
            <button
              onClick={() => setGeneratedRoadmap(null)}
              className="flex items-center gap-1.5 font-mono text-xs text-[#B8B9AA] transition-colors hover:text-[#EDE8D8]"
            >
              ← Back to Generator Form
            </button>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#D7FF00]">
              Reviewing Generated Blueprint
            </span>
          </div>

          <GeneratedRoadmapPreview roadmap={generatedRoadmap} />
        </div>
      ) : (
        <form onSubmit={handleGenerate} className="space-y-6">
          {/* Section 1: Career Target */}
          <div className="space-y-4 rounded-2xl border border-[#62695D] bg-[#252D26] p-6">
            <h2 className="flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-wide text-[#F3F0E6]">
              <Target className="h-4 w-4 text-[#D7FF00]" />
              <span>1. Target Engineering Role or Career Goal</span>
            </h2>

            <div>
              <input
                type="text"
                required
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
                placeholder="e.g. Senior Full-Stack Engineer, AI Systems Architect, Mobile Developer"
                className="w-full rounded-xl border border-[#62695D] bg-[#202720] p-3 font-mono text-xs text-[#F3F0E6] placeholder-[#B8B9AA]/50 focus:border-[#D7FF00] focus:outline-none"
              />

              {/* Quick suggestion tags */}
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {QUICK_GOALS.map((goal, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCareerGoal(goal)}
                    className="rounded-lg border border-[#62695D] bg-[#202720] px-2.5 py-1 font-mono text-[11px] text-[#B8B9AA] transition-colors hover:bg-[#2C352D] hover:text-[#EDE8D8]"
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Experience & Commitment */}
          <div className="grid grid-cols-1 gap-6 rounded-2xl border border-[#62695D] bg-[#252D26] p-6 md:grid-cols-2">
            {/* Current Level */}
            <div>
              <label className="mb-2 block font-mono text-xs font-bold uppercase tracking-wider text-[#F3F0E6]">
                Current Experience Level
              </label>
              <select
                value={currentLevel}
                onChange={(e) => setCurrentLevel(e.target.value as any)}
                className="w-full rounded-xl border border-[#62695D] bg-[#202720] p-3 font-mono text-xs text-[#F3F0E6] focus:border-[#D7FF00] focus:outline-none"
              >
                <option value="Complete Beginner">Complete Beginner (No prior programming)</option>
                <option value="Novice / Basic Familiarity">
                  Novice / Basic Familiarity (Know basic syntax)
                </option>
                <option value="Intermediate / Working Knowledge">
                  Intermediate / Working Knowledge (Can build standard apps)
                </option>
                <option value="Advanced / Upskilling">
                  Advanced / Upskilling (Senior engineer learning new domain)
                </option>
              </select>
            </div>

            {/* Target Duration */}
            <div>
              <label className="mb-2 block font-mono text-xs font-bold uppercase tracking-wider text-[#F3F0E6]">
                Target Timeline / Duration
              </label>
              <select
                value={targetDuration}
                onChange={(e) => setTargetDuration(e.target.value)}
                className="w-full rounded-xl border border-[#62695D] bg-[#202720] p-3 font-mono text-xs text-[#F3F0E6] focus:border-[#D7FF00] focus:outline-none"
              >
                <option value="4 Weeks (Intensive Sprint)">4 Weeks (Intensive Sprint)</option>
                <option value="8 Weeks (2 Months)">8 Weeks (2 Months)</option>
                <option value="12 Weeks (Quarterly)">12 Weeks (Quarterly)</option>
                <option value="16 Weeks (4 Months)">16 Weeks (4 Months)</option>
                <option value="6 Months (Deep Mastery)">6 Months (Deep Mastery)</option>
              </select>
            </div>

            {/* Daily Study Hours Slider */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="font-mono text-xs font-bold uppercase tracking-wider text-[#F3F0E6]">
                  Daily Study Commitment
                </label>
                <span className="rounded bg-[#D7FF00] px-2 py-0.5 font-mono text-xs font-bold text-[#1B211C]">
                  {dailyHours} hours/day
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="8"
                step="0.5"
                value={dailyHours}
                onChange={(e) => setDailyHours(parseFloat(e.target.value))}
                className="w-full cursor-pointer accent-[#D7FF00]"
              />
              <div className="mt-1 flex justify-between font-mono text-[10px] text-[#B8B9AA]">
                <span>30 min (Casual)</span>
                <span>2 hrs (Standard)</span>
                <span>8 hrs (Full-time)</span>
              </div>
            </div>

            {/* Learning Style */}
            <div>
              <label className="mb-2 block font-mono text-xs font-bold uppercase tracking-wider text-[#F3F0E6]">
                Preferred Learning Style
              </label>
              <select
                value={learningStyle}
                onChange={(e) => setLearningStyle(e.target.value as any)}
                className="w-full rounded-xl border border-[#62695D] bg-[#202720] p-3 font-mono text-xs text-[#F3F0E6] focus:border-[#D7FF00] focus:outline-none"
              >
                <option value="Balanced">Balanced (Theory + Hands-on Practice)</option>
                <option value="Hands-on Projects">
                  Hands-on Projects (Build real software first)
                </option>
                <option value="Deep Conceptual & Theory">
                  Deep Conceptual & Theory (Mental models & internals)
                </option>
                <option value="Fast-paced & Practical">
                  Fast-paced & Practical (Just what is needed on the job)
                </option>
              </select>
            </div>
          </div>

          {/* Section 3: Fine-Tuning & Customization */}
          <div className="grid grid-cols-1 gap-4 rounded-2xl border border-[#62695D] bg-[#252D26] p-6 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block font-mono text-xs font-bold uppercase tracking-wider text-[#F3F0E6]">
                Existing Knowledge to Skip (Optional)
              </label>
              <input
                type="text"
                value={existingKnowledge}
                onChange={(e) => setExistingKnowledge(e.target.value)}
                placeholder="e.g. Already fluent in HTML/CSS and basic JavaScript"
                className="w-full rounded-xl border border-[#62695D] bg-[#202720] p-3 font-mono text-xs text-[#F3F0E6] placeholder-[#B8B9AA]/50 focus:border-[#D7FF00] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block font-mono text-xs font-bold uppercase tracking-wider text-[#F3F0E6]">
                Special Focus Areas (Optional)
              </label>
              <input
                type="text"
                value={focusAreas}
                onChange={(e) => setFocusAreas(e.target.value)}
                placeholder="e.g. Distributed caching, microservices, high concurrency"
                className="w-full rounded-xl border border-[#62695D] bg-[#202720] p-3 font-mono text-xs text-[#F3F0E6] placeholder-[#B8B9AA]/50 focus:border-[#D7FF00] focus:outline-none"
              />
            </div>
          </div>

          {/* Submit CTA Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-[#D7FF00] px-8 py-3.5 font-mono text-xs font-bold uppercase tracking-wider text-[#1B211C] shadow-lg shadow-[#D7FF00]/15 transition-all hover:bg-[#c2e600] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-[#1B211C]" />
                  <span>Synthesizing Curriculum & Milestones...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-[#1B211C]" />
                  <span>Generate Personalized Roadmap</span>
                  <ArrowRight className="h-4 w-4 text-[#1B211C]" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
