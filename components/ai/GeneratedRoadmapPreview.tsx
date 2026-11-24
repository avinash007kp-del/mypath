"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Compass,
  Clock,
  Calendar,
  CheckCircle2,
  Trash2,
  Edit2,
  Plus,
  ArrowRight,
  Sparkles,
  Award,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { IGeneratedRoadmap, GeneratedRoadmapStage, GeneratedRoadmapTopic } from "@/types/ai";
import { saveAIRoadmapApi } from "@/services/api";
import { toast } from "sonner";

interface GeneratedRoadmapPreviewProps {
  roadmap: IGeneratedRoadmap;
  onUpdateRoadmap?: (updated: IGeneratedRoadmap) => void;
}

export function GeneratedRoadmapPreview({
  roadmap,
  onUpdateRoadmap,
}: GeneratedRoadmapPreviewProps) {
  const router = useRouter();
  const [stages, setStages] = useState<GeneratedRoadmapStage[]>(roadmap.stages || []);
  const [customTitle, setCustomTitle] = useState(roadmap.title);
  const [saving, setSaving] = useState(false);
  const [collapsedStages, setCollapsedStages] = useState<Record<number, boolean>>({});

  const toggleStageCollapse = (index: number) => {
    setCollapsedStages((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleDeleteTopic = (stageIndex: number, topicId: string) => {
    const updatedStages = [...stages];
    updatedStages[stageIndex].topics = updatedStages[stageIndex].topics.filter(
      (t) => t.id !== topicId
    );
    setStages(updatedStages);
    toast.success("Topic removed from preview");
  };

  const handleSaveAndOpenInEditor = async () => {
    try {
      setSaving(true);
      const res = await saveAIRoadmapApi({
        generatedRoadmapId: roadmap._id,
        customTitle,
      });

      toast.success("Roadmap generated and converted to visual canvas!");
      router.push(`/roadmaps/${res.roadmapId}/editor`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to convert roadmap to canvas");
    } finally {
      setSaving(false);
    }
  };

  const totalTopicsCount = stages.reduce((acc, stage) => acc + (stage.topics?.length || 0), 0);
  const totalEstimatedHours = stages.reduce((acc, stage) => acc + (stage.estimatedHours || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#62695D] bg-[#252D26] p-5 sm:flex-row sm:items-center">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded-full bg-[#D7FF00] px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#1B211C]">
              AI-Generated Blueprint
            </span>
            <span className="rounded border border-[#62695D] bg-[#202720] px-2 py-0.5 font-mono text-[10px] text-[#B8B9AA]">
              {roadmap.difficulty}
            </span>
            <span className="rounded border border-[#62695D] bg-[#202720] px-2 py-0.5 font-mono text-[10px] text-[#B8B9AA]">
              {roadmap.category}
            </span>
          </div>
          <input
            type="text"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            className="w-full border-b border-transparent bg-transparent font-mono text-lg font-bold text-[#F3F0E6] transition-colors hover:border-[#D7FF00] focus:border-[#D7FF00] focus:outline-none"
            title="Click to rename roadmap"
          />
          <p className="mt-1 text-xs text-[#B8B9AA]">{roadmap.description}</p>
        </div>

        <button
          onClick={handleSaveAndOpenInEditor}
          disabled={saving}
          className="flex flex-shrink-0 items-center justify-center gap-2 rounded-xl bg-[#D7FF00] px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider text-[#1B211C] shadow-lg shadow-[#D7FF00]/15 transition-all hover:bg-[#c2e600] disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4 text-[#1B211C]" />
          <span>{saving ? "Converting to Canvas..." : "Save & Open in Visual Editor"}</span>
          <ArrowRight className="h-4 w-4 text-[#1B211C]" />
        </button>
      </div>

      {/* Curriculum Summary Metric Pills */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-[#62695D] bg-[#252D26] p-3.5">
          <div className="mb-1 flex items-center gap-2 font-mono text-xs text-[#B8B9AA]">
            <Layers className="h-4 w-4 text-[#D7FF00]" />
            <span>Stages</span>
          </div>
          <div className="font-mono text-base font-bold text-[#F3F0E6]">{stages.length} Stages</div>
        </div>

        <div className="rounded-xl border border-[#62695D] bg-[#252D26] p-3.5">
          <div className="mb-1 flex items-center gap-2 font-mono text-xs text-[#B8B9AA]">
            <CheckCircle2 className="h-4 w-4 text-[#D7FF00]" />
            <span>Topics</span>
          </div>
          <div className="font-mono text-base font-bold text-[#F3F0E6]">
            {totalTopicsCount} Topics
          </div>
        </div>

        <div className="rounded-xl border border-[#62695D] bg-[#252D26] p-3.5">
          <div className="mb-1 flex items-center gap-2 font-mono text-xs text-[#B8B9AA]">
            <Clock className="h-4 w-4 text-[#D7FF00]" />
            <span>Estimated Hours</span>
          </div>
          <div className="font-mono text-base font-bold text-[#F3F0E6]">
            ~{totalEstimatedHours}h
          </div>
        </div>

        <div className="rounded-xl border border-[#62695D] bg-[#252D26] p-3.5">
          <div className="mb-1 flex items-center gap-2 font-mono text-xs text-[#B8B9AA]">
            <Calendar className="h-4 w-4 text-[#D7FF00]" />
            <span>Target Duration</span>
          </div>
          <div className="font-mono text-base font-bold text-[#F3F0E6]">
            {roadmap.estimatedDuration}
          </div>
        </div>
      </div>

      {/* Stages Accordion List */}
      <div className="space-y-4">
        <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#B8B9AA]">
          Roadmap Stages & Topics Breakdown
        </h3>

        {stages.map((stage, stageIndex) => {
          const isCollapsed = collapsedStages[stageIndex];
          return (
            <div
              key={stageIndex}
              className="overflow-hidden rounded-2xl border border-[#62695D] bg-[#252D26]"
            >
              {/* Stage Header */}
              <div
                onClick={() => toggleStageCollapse(stageIndex)}
                className="flex cursor-pointer items-center justify-between border-b border-[#62695D]/40 bg-[#202720] p-4 transition-colors hover:bg-[#2C352D]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#62695D] bg-[#2C352D] font-mono text-xs font-bold text-[#D7FF00]">
                    {stageIndex + 1}
                  </div>
                  <div>
                    <h4 className="font-mono text-sm font-bold text-[#F3F0E6]">{stage.name}</h4>
                    <p className="text-[11px] text-[#B8B9AA]">{stage.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="rounded-md border border-[#62695D] bg-[#252D26] px-2.5 py-1 font-mono text-[11px] font-bold text-[#D7FF00]">
                    ~{stage.estimatedHours}h
                  </span>
                  {isCollapsed ? (
                    <ChevronDown className="h-4 w-4 text-[#B8B9AA]" />
                  ) : (
                    <ChevronUp className="h-4 w-4 text-[#B8B9AA]" />
                  )}
                </div>
              </div>

              {/* Topics Grid */}
              {!isCollapsed && (
                <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 lg:grid-cols-3">
                  {stage.topics.map((topic) => (
                    <div
                      key={topic.id}
                      className="group flex flex-col justify-between rounded-xl border border-[#62695D] bg-[#202720] p-3.5 transition-colors hover:border-[#D7FF00]"
                    >
                      <div>
                        <div className="mb-1.5 flex items-center justify-between gap-2">
                          <span className="rounded border border-[#62695D] bg-[#252D26] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[#D7FF00]">
                            {topic.difficulty}
                          </span>
                          <span className="font-mono text-[10px] text-[#B8B9AA]">
                            {topic.estimatedHours}h
                          </span>
                        </div>

                        <h5 className="text-xs font-bold text-[#F3F0E6] transition-colors group-hover:text-[#D7FF00]">
                          {topic.title}
                        </h5>
                        <p className="mt-1 text-[11px] leading-snug text-[#B8B9AA]">
                          {topic.description}
                        </p>

                        {/* Subtopics Pills */}
                        {topic.subtopics && topic.subtopics.length > 0 && (
                          <div className="mt-2.5 flex flex-wrap gap-1">
                            {topic.subtopics.map((sub, sIdx) => (
                              <span
                                key={sIdx}
                                className="rounded border border-[#62695D] bg-[#252D26] px-1.5 py-0.5 font-mono text-[9px] text-[#B8B9AA]"
                              >
                                {sub}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Mini Project */}
                        {topic.practicalProject && (
                          <div className="mt-2.5 rounded-lg border border-[#62695D] bg-[#252D26] p-2 text-[10px] text-[#EDE8D8]">
                            <span className="font-mono font-bold text-[#D7FF00]">
                              Mini-Project:{" "}
                            </span>
                            {topic.practicalProject}
                          </div>
                        )}
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-[#62695D]/40 pt-3">
                        <span className="font-mono text-[9px] text-[#B8B9AA]">
                          {topic.prerequisites?.length
                            ? `Prereqs: ${topic.prerequisites.length}`
                            : "Direct Start"}
                        </span>
                        <button
                          onClick={() => handleDeleteTopic(stageIndex, topic.id)}
                          className="p-1 text-[#B8B9AA] opacity-0 transition-opacity hover:text-rose-400 group-hover:opacity-100"
                          title="Remove topic"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progressive Milestones */}
      {roadmap.milestones && roadmap.milestones.length > 0 && (
        <div className="rounded-2xl border border-[#62695D] bg-[#252D26] p-5">
          <div className="mb-3 flex items-center gap-2">
            <Award className="h-4 w-4 text-[#D7FF00]" />
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#F3F0E6]">
              Curriculum Milestones
            </h4>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {roadmap.milestones.map((m, idx) => (
              <div key={idx} className="rounded-xl border border-[#62695D] bg-[#202720] p-3">
                <div className="mb-1 flex items-center justify-between font-mono text-[10px] text-[#B8B9AA]">
                  <span className="font-bold text-[#D7FF00]">Target Week {m.targetWeek}</span>
                  <span>Checkpoint #{idx + 1}</span>
                </div>
                <div className="font-mono text-xs font-bold text-[#F3F0E6]">{m.title}</div>
                <p className="mt-1 text-[11px] text-[#B8B9AA]">{m.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Capstone Project Section */}
      {roadmap.capstoneProject && (
        <div className="rounded-2xl border border-[#62695D] bg-[#252D26] p-5">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#D7FF00]" />
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#F3F0E6]">
              Capstone Portfolio Project
            </h4>
          </div>
          <h3 className="font-mono text-sm font-bold text-[#EDE8D8]">
            {roadmap.capstoneProject.title}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-[#B8B9AA]">
            {roadmap.capstoneProject.description}
          </p>

          {roadmap.capstoneProject.deliverables && (
            <div className="mt-3">
              <span className="font-mono text-[11px] font-bold text-[#D7FF00]">
                Core Deliverables:
              </span>
              <ul className="mt-1.5 space-y-1">
                {roadmap.capstoneProject.deliverables.map((del, dIdx) => (
                  <li key={dIdx} className="flex items-center gap-2 text-xs text-[#F3F0E6]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#D7FF00]" />
                    <span>{del}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
