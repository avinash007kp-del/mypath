"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Trophy,
  Plus,
  Search,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MilestoneCard } from "@/components/lms/MilestoneCard";
import { AddMilestoneModal } from "@/components/lms/AddMilestoneModal";
import {
  fetchMilestones,
  fetchRoadmaps,
  updateMilestoneApi,
  deleteMilestoneApi,
} from "@/services/api";
import { IMilestone, MilestoneStatus } from "@/types/lms";
import { IRoadmap } from "@/types";
import { toast } from "sonner";
import Link from "next/link";

export default function MilestonesPage() {
  const [milestones, setMilestones] = useState<IMilestone[]>([]);
  const [roadmaps, setRoadmaps] = useState<IRoadmap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filters
  const [statusTab, setStatusTab] = useState<string>("All");
  const [selectedRoadmap, setSelectedRoadmap] = useState<string>("All");
  const [selectedPriority, setSelectedPriority] = useState<string>("All");
  const [search, setSearch] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [milestonesData, roadmapsData] = await Promise.all([
        fetchMilestones(),
        fetchRoadmaps(),
      ]);
      setMilestones(milestonesData);
      setRoadmaps(roadmapsData);
    } catch {
      toast.error("Failed to load milestones");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (milestone: IMilestone) => {
    const nextStatus: MilestoneStatus =
      milestone.status === "Completed"
        ? "Upcoming"
        : milestone.status === "Upcoming"
          ? "In Progress"
          : "Completed";

    try {
      const updated = await updateMilestoneApi(milestone._id, {
        status: nextStatus,
        completedAt: nextStatus === "Completed" ? new Date().toISOString() : undefined,
      });
      setMilestones((prev) =>
        prev.map((m) => (m._id === milestone._id ? { ...m, ...updated } : m))
      );
      toast.success(`Milestone set to ${nextStatus}`);
    } catch {
      toast.error("Failed to update milestone status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this milestone?")) return;
    try {
      await deleteMilestoneApi(id);
      setMilestones((prev) => prev.filter((m) => m._id !== id));
      toast.success("Milestone removed");
    } catch {
      toast.error("Failed to delete milestone");
    }
  };

  // Filtered milestones
  const filteredMilestones = useMemo(() => {
    return milestones.filter((item) => {
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchDesc = item.description?.toLowerCase().includes(q) || false;
        if (!matchTitle && !matchDesc) return false;
      }

      // Status
      if (statusTab !== "All" && item.status !== statusTab) {
        return false;
      }

      // Roadmap
      if (selectedRoadmap !== "All") {
        const rId =
          typeof item.roadmapId === "object" && item.roadmapId !== null
            ? (item.roadmapId as { _id?: string })._id
            : item.roadmapId;
        if (rId !== selectedRoadmap) return false;
      }

      // Priority
      if (selectedPriority !== "All" && item.priority !== selectedPriority) {
        return false;
      }

      return true;
    });
  }, [milestones, search, statusTab, selectedRoadmap, selectedPriority]);

  // Counts
  const totalCount = milestones.length;
  const inProgressCount = milestones.filter((m) => m.status === "In Progress").length;
  const completedCount = milestones.filter((m) => m.status === "Completed").length;
  const overdueCount = milestones.filter((m) => m.status === "Overdue").length;

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#62695D] bg-[#252D26] px-3 py-1 font-mono text-xs font-semibold text-[#D7FF00]">
            <Trophy className="h-3.5 w-3.5 text-[#D7FF00]" />
            <span>DEADLINE &amp; TARGET TRACKER</span>
          </div>
          <h1 className="font-mono text-2xl font-bold uppercase tracking-tight text-[#F3F0E6] sm:text-3xl">
            Milestones &amp; Deadlines
          </h1>
          <p className="mt-1 text-xs text-[#B8B9AA] md:text-sm">
            Track key project checkpoints, learning goals, and target deadlines across all active
            paths.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/calendar">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5 font-mono text-xs"
            >
              <Calendar className="h-4 w-4" />
              Calendar View
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            isLoading={isLoading}
            className="flex items-center gap-1.5 font-mono text-xs"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 font-mono font-bold uppercase shadow-lg shadow-[#D7FF00]/15"
          >
            <Plus className="h-4 w-4" />
            Add Milestone
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-[#62695D] bg-[#252D26] p-3.5">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#B8B9AA]">
            Total Milestones
          </span>
          <div className="mt-1 font-mono text-xl font-bold text-[#F3F0E6]">{totalCount}</div>
        </div>

        <div className="rounded-xl border border-[#62695D] bg-[#252D26] p-3.5">
          <span className="flex items-center gap-1 font-mono text-[11px] font-bold uppercase tracking-wider text-[#EDE8D8]">
            <Clock className="h-3 w-3 text-[#D7FF00]" /> In Progress
          </span>
          <div className="mt-1 font-mono text-xl font-bold text-[#EDE8D8]">{inProgressCount}</div>
        </div>

        <div className="rounded-xl border border-[#62695D] bg-[#252D26] p-3.5">
          <span className="flex items-center gap-1 font-mono text-[11px] font-bold uppercase tracking-wider text-[#D7FF00]">
            <CheckCircle2 className="h-3 w-3" /> Completed
          </span>
          <div className="mt-1 font-mono text-xl font-bold text-[#D7FF00]">{completedCount}</div>
        </div>

        <div className="rounded-xl border border-[#62695D] bg-[#252D26] p-3.5">
          <span className="flex items-center gap-1 font-mono text-[11px] font-bold uppercase tracking-wider text-red-400">
            <AlertTriangle className="h-3 w-3" /> Overdue
          </span>
          <div className="mt-1 font-mono text-xl font-bold text-red-400">{overdueCount}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3 rounded-xl border border-[#62695D] bg-[#252D26] p-4">
        <div className="flex flex-col items-stretch justify-between gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B8B9AA]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search milestones by title or description..."
              className="w-full rounded-lg border border-[#62695D] bg-[#202720] py-2 pl-9 pr-4 font-mono text-xs text-[#F3F0E6] placeholder:text-[#B8B9AA]/50 focus:border-[#D7FF00] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono">
            <select
              value={selectedRoadmap}
              onChange={(e) => setSelectedRoadmap(e.target.value)}
              className="cursor-pointer rounded-lg border border-[#62695D] bg-[#202720] px-2.5 py-2 text-xs text-[#F3F0E6] focus:border-[#D7FF00] focus:outline-none"
            >
              <option value="All">All Roadmaps</option>
              {roadmaps.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.title}
                </option>
              ))}
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="cursor-pointer rounded-lg border border-[#62695D] bg-[#202720] px-2.5 py-2 text-xs text-[#F3F0E6] focus:border-[#D7FF00] focus:outline-none"
            >
              <option value="All">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs">
          {[
            { id: "All", label: "All Milestones", count: totalCount },
            {
              id: "Upcoming",
              label: "Upcoming",
              count: milestones.filter((m) => m.status === "Upcoming").length,
            },
            { id: "In Progress", label: "In Progress", count: inProgressCount },
            { id: "Completed", label: "Completed", count: completedCount },
            { id: "Overdue", label: "Overdue", count: overdueCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusTab(tab.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 font-mono text-xs transition-colors ${
                statusTab === tab.id
                  ? tab.id === "Overdue"
                    ? "bg-red-500 font-bold text-white"
                    : "bg-[#D7FF00] font-bold text-[#1B211C]"
                  : "border border-[#62695D] bg-[#202720] text-[#B8B9AA] hover:text-[#EDE8D8]"
              }`}
            >
              {tab.label}
              <span className="text-[10px] opacity-75">({tab.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Milestones List */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-xl border border-[#62695D] bg-[#252D26]"
            />
          ))}
        </div>
      ) : filteredMilestones.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#62695D] bg-[#252D26]/40 p-8 py-16 text-center">
          <Trophy className="mx-auto mb-3 h-12 w-12 text-[#B8B9AA]" />
          <h3 className="mb-1 font-mono text-base font-bold text-[#F3F0E6]">No milestones found</h3>
          <p className="mx-auto mb-4 max-w-sm text-xs text-[#B8B9AA]">
            {search ||
            statusTab !== "All" ||
            selectedRoadmap !== "All" ||
            selectedPriority !== "All"
              ? "No milestones match your current filters. Try adjusting your selections."
              : "Break down your roadmap goals with target completion dates and track deadlines."}
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 font-mono font-bold uppercase"
          >
            <Plus className="h-4 w-4" />
            Create Milestone
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMilestones.map((milestone) => (
            <MilestoneCard
              key={milestone._id}
              milestone={milestone}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add Milestone Modal */}
      <AddMilestoneModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onMilestoneCreated={(created) => {
          setMilestones((prev) => [created, ...prev]);
        }}
      />
    </div>
  );
}
