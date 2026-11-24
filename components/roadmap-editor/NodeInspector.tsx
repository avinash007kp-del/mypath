"use client";

import React, { useState, useEffect } from "react";
import { Node } from "@xyflow/react";
import {
  Sliders,
  Trash2,
  Copy,
  Info,
  Clock,
  Layers,
  Sparkles,
  Link2,
  CheckCircle2,
  Flame,
  CircleDashed,
  PauseCircle,
  X,
  ExternalLink,
  FileText,
  Trophy,
  Calendar,
  History,
  Plus,
  Play,
  Star,
  Check,
} from "lucide-react";
import { IRoadmapNode, RoadmapNodeType, NodeStatus, NodePriority } from "@/types/roadmap";
import {
  IRoadmap,
  ILearningNote,
  ILearningResource,
  IMilestone,
  IStudySession,
  ILearningProgress,
  ProgressPercentage,
} from "@/types";
import { NODE_TYPES, NODE_STATUSES, NODE_PRIORITIES } from "@/lib/validations/roadmap-node";
import { ROADMAP_DIFFICULTIES } from "@/lib/validations/roadmap";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AddResourceModal } from "@/components/lms/AddResourceModal";
import { AddMilestoneModal } from "@/components/lms/AddMilestoneModal";
import { NodeAIModal } from "@/components/ai/NodeAIModal";
import {
  fetchTopicProgress,
  updateTopicProgressApi,
  fetchNotes,
  createNoteApi,
  fetchResources,
  fetchMilestones,
  fetchStudySessions,
} from "@/services/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface NodeInspectorProps {
  selectedNode: Node<IRoadmapNode> | null;
  roadmap: IRoadmap | null;
  prerequisiteTitles: string[];
  onUpdateNodeData: (nodeId: string, partialData: Partial<IRoadmapNode>) => void;
  onDuplicateNode: (node: Node<IRoadmapNode>) => void;
  onDeleteNode: (nodeId: string) => void;
  onDeselect: () => void;
}

type InspectorTab =
  "overview" | "progress" | "ai" | "notes" | "resources" | "deadlines" | "history";

export function NodeInspector({
  selectedNode,
  roadmap,
  prerequisiteTitles,
  onUpdateNodeData,
  onDuplicateNode,
  onDeleteNode,
  onDeselect,
}: NodeInspectorProps) {
  const [activeTab, setActiveTab] = useState<InspectorTab>("overview");

  // LMS Data States for selected node
  const [topicProgress, setTopicProgress] = useState<ILearningProgress | null>(null);
  const [notes, setNotes] = useState<ILearningNote[]>([]);
  const [resources, setResources] = useState<ILearningResource[]>([]);
  const [milestones, setMilestones] = useState<IMilestone[]>([]);
  const [sessions, setSessions] = useState<IStudySession[]>([]);
  const [isLoadingLms, setIsLoadingLms] = useState(false);

  // Modals & Forms
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiModalTab, setAiModalTab] = useState<"explain" | "breakdown" | "resources" | "quiz">(
    "explain"
  );
  const [showAddNoteForm, setShowAddNoteForm] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Fetch LMS data when selected node changes
  useEffect(() => {
    if (!selectedNode || !roadmap?._id) return;

    const nodeId = selectedNode.id;
    const roadmapId = roadmap._id;

    setIsLoadingLms(true);
    Promise.all([
      fetchTopicProgress(roadmapId, nodeId).catch(() => null),
      fetchNotes({ roadmapId, nodeId }).catch(() => []),
      fetchResources({ roadmapId, nodeId }).catch(() => []),
      fetchMilestones({ roadmapId }).catch(() => []),
      fetchStudySessions({ roadmapId, nodeId }).catch(() => []),
    ])
      .then(([prog, notesData, resData, mData, sessData]) => {
        setTopicProgress(prog);
        setNotes(notesData);
        setResources(resData);
        // Filter milestones for this node or roadmap
        setMilestones(mData.filter((m) => m.nodeId === nodeId || !m.nodeId));
        setSessions(sessData);
      })
      .finally(() => setIsLoadingLms(false));
  }, [selectedNode?.id, roadmap?._id]);

  if (!selectedNode) {
    /* No node selected: show roadmap info & canvas tips */
    return (
      <aside className="custom-scrollbar flex h-full w-80 shrink-0 select-none flex-col space-y-5 overflow-y-auto border-l border-[#62695D] bg-[#252D26] p-4 md:w-96">
        <div>
          <div className="flex items-center gap-1.5 border-b border-[#62695D]/40 pb-2">
            <Info className="h-4 w-4 text-[#D7FF00]" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#F3F0E6]">
              Roadmap Overview
            </h3>
          </div>

          {roadmap && (
            <div className="mt-3 space-y-2 rounded-2xl border border-[#62695D] bg-[#202720] p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="select-none text-xl">{roadmap.icon || "🚀"}</span>
                <h4 className="truncate text-sm font-bold text-[#F3F0E6]">{roadmap.title}</h4>
              </div>
              <p className="line-clamp-2 text-xs text-[#B8B9AA]">
                {roadmap.description || "No description provided."}
              </p>
              <div className="flex items-center justify-between border-t border-[#62695D]/40 pt-2 font-mono text-[11px] text-[#D7FF00]">
                <span>{roadmap.category}</span>
                <span>{roadmap.progress}% Completed</span>
              </div>
            </div>
          )}
        </div>

        {/* Canvas Guide & Tips */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 border-b border-[#62695D]/40 pb-2">
            <Sparkles className="h-4 w-4 text-[#D7FF00]" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#F3F0E6]">
              Canvas Navigation Tips
            </h3>
          </div>

          <div className="space-y-2 text-xs text-[#B8B9AA]">
            <div className="rounded-xl border border-[#62695D]/60 bg-[#202720] p-3">
              <span className="mb-0.5 block font-bold text-[#F3F0E6]">Connecting Nodes:</span>
              Click and drag from any circular handle on a source node to a target node handle.
            </div>

            <div className="rounded-xl border border-[#62695D]/60 bg-[#202720] p-3">
              <span className="mb-0.5 block font-bold text-[#F3F0E6]">
                Topic Learning Progress:
              </span>
              Select any node on the canvas to update completion status, write markdown notes, and
              attach resources.
            </div>

            <div className="rounded-xl border border-[#62695D]/60 bg-[#202720] p-3">
              <span className="mb-0.5 block font-bold text-[#F3F0E6]">Focus Timer:</span>
              Launch study sessions directly from the topic panel to record your actual learning
              hours in MongoDB.
            </div>
          </div>
        </div>
      </aside>
    );
  }

  /* Node Selected View */
  const nodeData = selectedNode.data;

  const handleChange = (field: keyof IRoadmapNode, value: unknown) => {
    onUpdateNodeData(selectedNode.id, { [field]: value });
  };

  // Handle Progress Percentage Change
  const handleUpdateProgressPercentage = async (percent: ProgressPercentage) => {
    if (!roadmap?._id) return;
    const roadmapId = roadmap._id;
    const nodeId = selectedNode.id;

    const newStatus: NodeStatus =
      percent === 100 ? "Completed" : percent > 0 ? "In Progress" : "Not Started";

    // Optimistically update React Flow node
    onUpdateNodeData(nodeId, {
      status: newStatus,
      metadata: {
        ...nodeData.metadata,
        progressPercentage: percent,
      },
    });

    try {
      const updated = await updateTopicProgressApi({
        roadmapId,
        nodeId,
        status: newStatus,
        progressPercentage: percent,
      });
      setTopicProgress(updated);

      if (percent === 100) {
        toast.success(`🎉 Topic "${nodeData.title}" marked Completed!`);
      } else {
        toast.success(`Progress set to ${percent}%`);
      }
    } catch {
      toast.error("Failed to sync progress with database");
    }
  };

  // Handle Status Button Change
  const handleUpdateStatus = async (status: NodeStatus) => {
    if (!roadmap?._id) return;
    const roadmapId = roadmap._id;
    const nodeId = selectedNode.id;

    const percent: ProgressPercentage =
      status === "Completed" ? 100 : status === "In Progress" ? 50 : 0;

    onUpdateNodeData(nodeId, {
      status,
      metadata: {
        ...nodeData.metadata,
        progressPercentage: percent,
      },
    });

    try {
      const updated = await updateTopicProgressApi({
        roadmapId,
        nodeId,
        status,
        progressPercentage: percent,
      });
      setTopicProgress(updated);
      toast.success(`Status updated to ${status}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  // Handle Quick Note Create
  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !roadmap?._id) return;

    setIsSavingNote(true);
    try {
      const created = await createNoteApi({
        title: newNoteTitle.trim(),
        content: newNoteContent.trim() || "# " + newNoteTitle.trim(),
        roadmapId: roadmap._id,
        nodeId: selectedNode.id,
        tags: [nodeData.category || "General"],
      });
      setNotes((prev) => [created, ...prev]);
      setNewNoteTitle("");
      setNewNoteContent("");
      setShowAddNoteForm(false);
      toast.success("Note saved and linked to topic!");
    } catch {
      toast.error("Failed to save note");
    } finally {
      setIsSavingNote(false);
    }
  };

  const currentPercent =
    typeof nodeData.metadata?.progressPercentage === "number"
      ? (nodeData.metadata.progressPercentage as ProgressPercentage)
      : nodeData.status === "Completed"
        ? 100
        : nodeData.status === "In Progress"
          ? 50
          : 0;

  return (
    <aside className="flex h-full w-80 shrink-0 select-none flex-col overflow-hidden border-l border-[#62695D] bg-[#252D26] md:w-96">
      {/* Top Header: Node title & Close button */}
      <div className="flex items-center justify-between border-b border-[#62695D] bg-[#202720] p-3.5">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-[#62695D] bg-[#2C352D] text-[#D7FF00]">
            <Sliders className="h-3.5 w-3.5" />
          </div>
          <span className="truncate text-xs font-bold text-[#F3F0E6]">
            {nodeData.title || "Topic Details"}
          </span>
        </div>
        <button
          onClick={onDeselect}
          className="rounded-lg p-1 text-[#B8B9AA] transition-colors hover:bg-[#2C352D] hover:text-[#F3F0E6]"
          title="Deselect node"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="no-scrollbar flex items-center overflow-x-auto border-b border-[#62695D] bg-[#202720] text-xs">
        {[
          { id: "overview", label: "Overview", icon: Sliders },
          { id: "progress", label: "Progress", icon: CheckCircle2 },
          { id: "ai", label: "AI Copilot", icon: Sparkles },
          { id: "notes", label: "Notes", icon: FileText, count: notes.length },
          { id: "resources", label: "Resources", icon: Link2, count: resources.length },
          { id: "deadlines", label: "Deadlines", icon: Calendar, count: milestones.length },
          { id: "history", label: "History", icon: History, count: sessions.length },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as InspectorTab)}
              className={cn(
                "flex items-center gap-1 whitespace-nowrap border-b-2 px-3 py-2 font-mono text-[11px] transition-colors",
                activeTab === tab.id
                  ? "border-[#D7FF00] bg-[#2C352D] font-bold text-[#D7FF00]"
                  : "border-transparent text-[#B8B9AA] hover:bg-[#252D26] hover:text-[#F3F0E6]"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="text-[10px] opacity-75">({tab.count})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Contents (Scrollable) */}
      <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto p-4">
        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW */}
        {/* ========================================================================= */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            {/* AI Assistant Quick Actions Banner */}
            <div className="space-y-2 rounded-2xl border border-[#62695D] bg-[#202720] p-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase text-[#D7FF00]">
                  <Sparkles className="h-3.5 w-3.5 text-[#D7FF00]" />
                  <span>AI Learning Copilot</span>
                </div>
                <span className="font-mono text-[10px] text-[#B8B9AA]">GPT-4o</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setAiModalTab("explain");
                    setIsAIModalOpen(true);
                  }}
                  className="truncate rounded-xl border border-[#62695D] bg-[#252D26] p-2 text-left font-mono text-[11px] text-[#F3F0E6] transition-colors hover:bg-[#2C352D] hover:text-[#D7FF00]"
                >
                  💡 Explain Topic
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAiModalTab("breakdown");
                    setIsAIModalOpen(true);
                  }}
                  className="truncate rounded-xl border border-[#62695D] bg-[#252D26] p-2 text-left font-mono text-[11px] text-[#F3F0E6] transition-colors hover:bg-[#2C352D] hover:text-[#D7FF00]"
                >
                  🔨 Break Down
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAiModalTab("resources");
                    setIsAIModalOpen(true);
                  }}
                  className="truncate rounded-xl border border-[#62695D] bg-[#252D26] p-2 text-left font-mono text-[11px] text-[#F3F0E6] transition-colors hover:bg-[#2C352D] hover:text-[#D7FF00]"
                >
                  📚 Resources
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAiModalTab("quiz");
                    setIsAIModalOpen(true);
                  }}
                  className="truncate rounded-xl border border-[#62695D] bg-[#252D26] p-2 text-left font-mono text-[11px] text-[#F3F0E6] transition-colors hover:bg-[#2C352D] hover:text-[#D7FF00]"
                >
                  🎯 Practice Quiz
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="mb-1 block font-mono text-xs font-semibold text-[#F3F0E6]">
                Node Title <span className="text-[#D7FF00]">*</span>
              </label>
              <input
                type="text"
                value={nodeData.title || ""}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="e.g. Asynchronous JavaScript"
                className="w-full rounded-xl border border-[#62695D] bg-[#202720] px-3 py-1.5 text-xs text-[#F3F0E6] placeholder:text-[#B8B9AA]/50 focus:border-[#D7FF00] focus:outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-1 block font-mono text-xs font-semibold text-[#F3F0E6]">
                Description
              </label>
              <textarea
                rows={3}
                value={nodeData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Brief description of what this node teaches..."
                className="w-full resize-y rounded-xl border border-[#62695D] bg-[#202720] px-3 py-1.5 text-xs text-[#F3F0E6] placeholder:text-[#B8B9AA]/50 focus:border-[#D7FF00] focus:outline-none"
              />
            </div>

            {/* Type & Status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block font-mono text-xs font-semibold text-[#F3F0E6]">
                  Node Type
                </label>
                <select
                  value={nodeData.type || "topic"}
                  onChange={(e) => handleChange("type", e.target.value as RoadmapNodeType)}
                  className="w-full cursor-pointer rounded-xl border border-[#62695D] bg-[#202720] px-2.5 py-1.5 font-mono text-xs capitalize text-[#F3F0E6] focus:border-[#D7FF00] focus:outline-none"
                >
                  {NODE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block font-mono text-xs font-semibold text-[#F3F0E6]">
                  Status
                </label>
                <select
                  value={nodeData.status || "Not Started"}
                  onChange={(e) => handleUpdateStatus(e.target.value as NodeStatus)}
                  className="w-full cursor-pointer rounded-xl border border-[#62695D] bg-[#202720] px-2.5 py-1.5 font-mono text-xs text-[#F3F0E6] focus:border-[#D7FF00] focus:outline-none"
                >
                  {NODE_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Difficulty & Priority */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block font-mono text-xs font-semibold text-[#F3F0E6]">
                  Difficulty
                </label>
                <select
                  value={nodeData.difficulty || "Beginner"}
                  onChange={(e) => handleChange("difficulty", e.target.value)}
                  className="w-full cursor-pointer rounded-xl border border-[#62695D] bg-[#202720] px-2.5 py-1.5 font-mono text-xs text-[#F3F0E6] focus:border-[#D7FF00] focus:outline-none"
                >
                  {ROADMAP_DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block font-mono text-xs font-semibold text-[#F3F0E6]">
                  Priority
                </label>
                <select
                  value={nodeData.priority || "Medium"}
                  onChange={(e) => handleChange("priority", e.target.value as NodePriority)}
                  className="w-full cursor-pointer rounded-xl border border-[#62695D] bg-[#202720] px-2.5 py-1.5 font-mono text-xs text-[#F3F0E6] focus:border-[#D7FF00] focus:outline-none"
                >
                  {NODE_PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Estimated Hours & Category */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block font-mono text-xs font-semibold text-[#F3F0E6]">
                  Est. Hours
                </label>
                <input
                  type="number"
                  min={0}
                  max={500}
                  value={nodeData.estimatedHours ?? 1}
                  onChange={(e) => handleChange("estimatedHours", Number(e.target.value))}
                  className="w-full rounded-xl border border-[#62695D] bg-[#202720] px-3 py-1.5 font-mono text-xs text-[#F3F0E6] focus:border-[#D7FF00] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-mono text-xs font-semibold text-[#F3F0E6]">
                  Category
                </label>
                <input
                  type="text"
                  value={nodeData.category || ""}
                  onChange={(e) => handleChange("category", e.target.value)}
                  placeholder="e.g. Frontend"
                  className="w-full rounded-xl border border-[#62695D] bg-[#202720] px-3 py-1.5 font-mono text-xs text-[#F3F0E6] focus:border-[#D7FF00] focus:outline-none"
                />
              </div>
            </div>

            {/* Prerequisites */}
            <div className="border-t border-[#62695D]/40 pt-2">
              <label className="mb-1 block font-mono text-xs font-semibold text-[#B8B9AA]">
                Connected Prerequisites:
              </label>
              {prerequisiteTitles.length === 0 ? (
                <p className="text-[11px] italic text-[#B8B9AA]">
                  None. Connect an incoming edge from another node to set prerequisites.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {prerequisiteTitles.map((p, idx) => (
                    <span
                      key={idx}
                      className="rounded border border-[#62695D] bg-[#202720] px-2 py-0.5 font-mono text-[10px] text-[#EDE8D8]"
                    >
                      ← {p}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Duplicate & Delete */}
            <div className="flex items-center justify-between gap-2 border-t border-[#62695D]/40 pt-3">
              <button
                type="button"
                onClick={() => onDuplicateNode(selectedNode)}
                className="flex items-center gap-1.5 rounded-xl border border-[#62695D] bg-[#202720] px-3 py-1.5 font-mono text-xs text-[#F3F0E6] transition-colors hover:border-[#D7FF00] hover:text-[#D7FF00]"
              >
                <Copy className="h-3.5 w-3.5" />
                Duplicate
              </button>

              <button
                type="button"
                onClick={() => onDeleteNode(selectedNode.id)}
                className="flex items-center gap-1.5 rounded-xl border border-red-900/40 bg-red-950/20 px-3 py-1.5 font-mono text-xs text-red-400 transition-colors hover:bg-red-900/40 hover:text-red-200"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Node
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PROGRESS */}
        {/* ========================================================================= */}
        {activeTab === "progress" && (
          <div className="space-y-4">
            <div className="space-y-3 rounded-2xl border border-[#62695D] bg-[#202720] p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#F3F0E6]">Current Progress</span>
                <span className="font-mono text-base font-black text-[#D7FF00]">
                  {currentPercent}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full overflow-hidden rounded-full border border-[#62695D] bg-[#252D26]">
                <div
                  className="h-full rounded-full bg-[#D7FF00] transition-all duration-300"
                  style={{ width: `${currentPercent}%` }}
                />
              </div>

              {/* Percentage Buttons (0, 25, 50, 75, 100) */}
              <div className="grid grid-cols-5 gap-1.5 pt-1">
                {([0, 25, 50, 75, 100] as ProgressPercentage[]).map((pct) => (
                  <button
                    key={pct}
                    onClick={() => handleUpdateProgressPercentage(pct)}
                    className={cn(
                      "rounded-lg border py-1 font-mono text-[11px] transition-all",
                      currentPercent === pct
                        ? "border-[#D7FF00] bg-[#D7FF00] font-bold text-[#1B211C]"
                        : "border-[#62695D] bg-[#252D26] text-[#B8B9AA] hover:border-[#D7FF00]/50 hover:text-[#F3F0E6]"
                    )}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Status Selector Pills */}
            <div>
              <label className="mb-1.5 block font-mono text-xs font-semibold text-[#F3F0E6]">
                Status Setting
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { status: "Not Started", icon: CircleDashed, color: "text-[#B8B9AA]" },
                    { status: "In Progress", icon: Flame, color: "text-[#EDE8D8]" },
                    { status: "Completed", icon: CheckCircle2, color: "text-[#D7FF00]" },
                    { status: "On Hold", icon: PauseCircle, color: "text-[#B8B9AA]" },
                  ] as const
                ).map((item) => {
                  const Icon = item.icon;
                  const isSelected = nodeData.status === item.status;
                  return (
                    <button
                      key={item.status}
                      onClick={() => handleUpdateStatus(item.status as NodeStatus)}
                      className={cn(
                        "flex items-center gap-2 rounded-xl border p-2 text-left font-mono text-xs transition-all",
                        isSelected
                          ? "border-[#D7FF00] bg-[#2C352D] text-[#F3F0E6]"
                          : "border-[#62695D] bg-[#202720] text-[#B8B9AA] hover:text-[#F3F0E6]"
                      )}
                    >
                      <Icon className={cn("h-4 w-4", item.color)} />
                      <span>{item.status}</span>
                      {isSelected && (
                        <Check className="ml-auto h-3.5 w-3.5 stroke-[3] text-[#D7FF00]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Study Session Launcher */}
            <div className="space-y-2 border-t border-[#62695D]/40 pt-2">
              <span className="block font-mono text-xs font-bold text-[#F3F0E6]">
                Study &amp; Focus Timer
              </span>
              <p className="text-[11px] text-[#B8B9AA]">
                Log deep work minutes against this topic to automatically update your hours.
              </p>
              <Link href={`/study-session?roadmapId=${roadmap?._id}&nodeId=${selectedNode.id}`}>
                <Button
                  variant="primary"
                  size="sm"
                  className="flex w-full items-center justify-center gap-1.5"
                >
                  <Play className="h-3.5 w-3.5 fill-[#1B211C]" />
                  Start Focus Timer for this Topic
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: AI COPILOT */}
        {/* ========================================================================= */}
        {activeTab === "ai" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#62695D] bg-[#202720] p-4">
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#D7FF00]" />
                <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#F3F0E6]">
                  AI Context Assistant
                </h4>
              </div>
              <p className="mb-3 text-xs leading-relaxed text-[#B8B9AA]">
                Accelerate your learning for{" "}
                <span className="font-bold text-[#F3F0E6]">&quot;{nodeData.title}&quot;</span> with
                AI explanations, code examples, interactive quizzes, and micro-task breakdowns.
              </p>

              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAiModalTab("explain");
                    setIsAIModalOpen(true);
                  }}
                  className="flex w-full items-center justify-between rounded-xl border border-[#62695D] bg-[#252D26] p-2.5 font-mono text-xs text-[#F3F0E6] transition-colors hover:bg-[#2C352D] hover:text-[#D7FF00]"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">💡</span>
                    <span>Explain Concepts & Code Patterns</span>
                  </div>
                  <span className="text-[10px] text-[#B8B9AA]">Open →</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAiModalTab("breakdown");
                    setIsAIModalOpen(true);
                  }}
                  className="flex w-full items-center justify-between rounded-xl border border-[#62695D] bg-[#252D26] p-2.5 font-mono text-xs text-[#F3F0E6] transition-colors hover:bg-[#2C352D] hover:text-[#D7FF00]"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">🔨</span>
                    <span>Break into Bite-Sized Subtasks</span>
                  </div>
                  <span className="text-[10px] text-[#B8B9AA]">Open →</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAiModalTab("resources");
                    setIsAIModalOpen(true);
                  }}
                  className="flex w-full items-center justify-between rounded-xl border border-[#62695D] bg-[#252D26] p-2.5 font-mono text-xs text-[#F3F0E6] transition-colors hover:bg-[#2C352D] hover:text-[#D7FF00]"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">📚</span>
                    <span>Discover Verified Learning Resources</span>
                  </div>
                  <span className="text-[10px] text-[#B8B9AA]">Open →</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAiModalTab("quiz");
                    setIsAIModalOpen(true);
                  }}
                  className="flex w-full items-center justify-between rounded-xl border border-[#62695D] bg-[#252D26] p-2.5 font-mono text-xs text-[#F3F0E6] transition-colors hover:bg-[#2C352D] hover:text-[#D7FF00]"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">🎯</span>
                    <span>Interactive Practice Quiz</span>
                  </div>
                  <span className="text-[10px] text-[#B8B9AA]">Open →</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: NOTES */}
        {/* ========================================================================= */}
        {activeTab === "notes" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#F3F0E6]">
                Topic Notes ({notes.length})
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddNoteForm(!showAddNoteForm)}
                className="flex h-7 items-center gap-1 border-[#62695D] px-2 text-[11px]"
              >
                <Plus className="mr-0.5 h-3 w-3" />
                Add Note
              </Button>
            </div>

            {/* Inline Note Creator */}
            {showAddNoteForm && (
              <form
                onSubmit={handleCreateNote}
                className="space-y-2.5 rounded-2xl border border-[#D7FF00]/50 bg-[#202720] p-3.5"
              >
                <input
                  type="text"
                  required
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  placeholder="Note title..."
                  className="w-full rounded-xl border border-[#62695D] bg-[#252D26] px-3 py-1.5 text-xs text-[#F3F0E6] placeholder:text-[#B8B9AA]/50 focus:border-[#D7FF00] focus:outline-none"
                />
                <textarea
                  rows={3}
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Write initial thoughts, markdown syntax supported..."
                  className="w-full resize-none rounded-xl border border-[#62695D] bg-[#252D26] px-3 py-1.5 text-xs text-[#F3F0E6] placeholder:text-[#B8B9AA]/50 focus:border-[#D7FF00] focus:outline-none"
                />
                <div className="flex justify-end gap-1.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddNoteForm(false)}
                    className="h-6 px-2 text-[10px]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={isSavingNote}
                    className="h-6 px-2 text-[10px]"
                  >
                    Save Note
                  </Button>
                </div>
              </form>
            )}

            {/* Notes List */}
            {notes.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#62695D] p-4 text-center text-xs text-[#B8B9AA]">
                No personal notes attached to this topic yet.
              </div>
            ) : (
              <div className="space-y-2">
                {notes.map((note) => (
                  <Link
                    key={note._id}
                    href={`/notes/${note._id}`}
                    target="_blank"
                    className="group block rounded-xl border border-[#62695D] bg-[#202720] p-3 transition-colors hover:border-[#D7FF00]/60"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="truncate text-xs font-bold text-[#F3F0E6] transition-colors group-hover:text-[#D7FF00]">
                        {note.title}
                      </h4>
                      <ExternalLink className="h-3 w-3 text-[#B8B9AA] group-hover:text-[#D7FF00]" />
                    </div>
                    <p className="mt-1 line-clamp-2 text-[11px] text-[#B8B9AA]">
                      {note.content.replace(/#+\s/g, "")}
                    </p>
                    <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-[#B8B9AA]">
                      <span>{note.updatedAt?.substring(0, 10)}</span>
                      <span className="text-[#D7FF00]">Open Editor →</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: RESOURCES */}
        {/* ========================================================================= */}
        {activeTab === "resources" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#F3F0E6]">
                Resources ({resources.length})
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsResourceModalOpen(true)}
                className="flex h-7 items-center gap-1 border-[#62695D] px-2 text-[11px]"
              >
                <Plus className="mr-0.5 h-3 w-3" />
                Add Resource
              </Button>
            </div>

            {resources.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#62695D] p-4 text-center text-xs text-[#B8B9AA]">
                No external links or tutorials attached yet.
              </div>
            ) : (
              <div className="space-y-2">
                {resources.map((res) => (
                  <a
                    key={res._id}
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block rounded-xl border border-[#62695D] bg-[#202720] p-3 transition-colors hover:border-[#D7FF00]/60"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="rounded border border-[#62695D] bg-[#252D26] px-1.5 py-0.5 font-mono text-[10px] text-[#EDE8D8]">
                          {res.type}
                        </span>
                        <span className="truncate text-xs font-bold text-[#F3F0E6] transition-colors group-hover:text-[#D7FF00]">
                          {res.title}
                        </span>
                      </div>
                      <ExternalLink className="ml-1 h-3 w-3 shrink-0 text-[#B8B9AA] group-hover:text-[#D7FF00]" />
                    </div>
                    {res.description && (
                      <p className="mt-1 line-clamp-2 text-[11px] text-[#B8B9AA]">
                        {res.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-[#B8B9AA]">
                      <span>{res.author || "Curated"}</span>
                      <span className="text-[#D7FF00]">★ {res.rating}/5</span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: DEADLINES & MILESTONES */}
        {/* ========================================================================= */}
        {activeTab === "deadlines" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#F3F0E6]">
                Milestones ({milestones.length})
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMilestoneModalOpen(true)}
                className="flex h-7 items-center gap-1 border-[#62695D] px-2 text-[11px]"
              >
                <Plus className="mr-0.5 h-3 w-3" />
                Add Milestone
              </Button>
            </div>

            {milestones.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#62695D] p-4 text-center text-xs text-[#B8B9AA]">
                No target deadlines scheduled for this topic.
              </div>
            ) : (
              <div className="space-y-2">
                {milestones.map((m) => (
                  <div
                    key={m._id}
                    className="space-y-1.5 rounded-xl border border-[#62695D] bg-[#202720] p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate text-xs font-bold text-[#F3F0E6]">{m.title}</span>
                      <span
                        className={`rounded border px-1.5 py-0.5 font-mono text-[10px] ${
                          m.status === "Completed"
                            ? "border-[#D7FF00]/40 bg-[#D7FF00]/15 text-[#D7FF00]"
                            : "border-[#62695D] bg-[#252D26] text-[#B8B9AA]"
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between font-mono text-[10px] text-[#B8B9AA]">
                      <span>Target: {m.targetDate?.substring(0, 10)}</span>
                      <span>Priority: {m.priority}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: STUDY HISTORY */}
        {/* ========================================================================= */}
        {activeTab === "history" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#F3F0E6]">
                Study Sessions ({sessions.length})
              </span>
              <Link href={`/study-session?roadmapId=${roadmap?._id}&nodeId=${selectedNode.id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex h-7 items-center gap-1 border-[#62695D] px-2 text-[11px]"
                >
                  <Play className="mr-0.5 h-3 w-3 fill-[#EDE8D8]" />
                  Focus
                </Button>
              </Link>
            </div>

            {sessions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#62695D] p-4 text-center text-xs text-[#B8B9AA]">
                No focus sessions logged for this node yet.
              </div>
            ) : (
              <div className="space-y-2">
                {sessions.map((sess) => (
                  <div
                    key={sess._id}
                    className="space-y-1 rounded-xl border border-[#62695D] bg-[#202720] p-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-bold text-[#D7FF00]">{sess.durationMinutes} mins</span>
                      <span className="text-[10px] text-[#B8B9AA]">
                        {sess.sessionDate?.substring(0, 10) || sess.startedAt?.substring(0, 10)}
                      </span>
                    </div>
                    {sess.reflection && (
                      <p className="text-[11px] italic text-[#EDE8D8]">
                        &ldquo;{sess.reflection}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Resource Modal */}
      <AddResourceModal
        isOpen={isResourceModalOpen}
        onClose={() => setIsResourceModalOpen(false)}
        roadmapId={roadmap?._id}
        nodeId={selectedNode.id}
        onResourceCreated={(created) => {
          setResources((prev) => [created, ...prev]);
        }}
      />

      {/* Add Milestone Modal */}
      <AddMilestoneModal
        isOpen={isMilestoneModalOpen}
        onClose={() => setIsMilestoneModalOpen(false)}
        roadmapId={roadmap?._id}
        nodeId={selectedNode.id}
        onMilestoneCreated={(created) => {
          setMilestones((prev) => [created, ...prev]);
        }}
      />

      {/* AI Context Copilot Modal */}
      <NodeAIModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        topicTitle={nodeData.title || "Topic"}
        roadmapId={roadmap?._id}
        nodeId={selectedNode.id}
        initialTab={aiModalTab}
      />
    </aside>
  );
}
