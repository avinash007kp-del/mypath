"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  Plus,
  Search,
  Star,
  Filter,
  CheckCircle2,
  FolderOpen,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ResourceCard } from "@/components/lms/ResourceCard";
import { AddResourceModal } from "@/components/lms/AddResourceModal";
import {
  fetchResources,
  fetchRoadmaps,
  updateResourceApi,
  deleteResourceApi,
} from "@/services/api";
import { ILearningResource, ResourceType } from "@/types/lms";
import { IRoadmap } from "@/types";
import { toast } from "sonner";
import { RESOURCE_TYPES } from "@/models/LearningResource";

export default function ResourcesPage() {
  const [resources, setResources] = useState<ILearningResource[]>([]);
  const [roadmaps, setRoadmaps] = useState<IRoadmap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedRoadmap, setSelectedRoadmap] = useState<string>("All");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [resData, rData] = await Promise.all([fetchResources(), fetchRoadmaps()]);
      setResources(resData);
      setRoadmaps(rData);
    } catch {
      toast.error("Failed to load learning resources");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleFavorite = async (resource: ILearningResource) => {
    try {
      const updated = await updateResourceApi(resource._id, {
        isFavorite: !resource.isFavorite,
      });
      setResources((prev) =>
        prev.map((r) => (r._id === resource._id ? { ...r, isFavorite: updated.isFavorite } : r))
      );
      toast.success(updated.isFavorite ? "Added to favorites ⭐" : "Removed from favorites");
    } catch {
      toast.error("Failed to update favorite status");
    }
  };

  const handleToggleStatus = async (resource: ILearningResource) => {
    const nextStatus =
      resource.status === "Completed"
        ? "Pending"
        : resource.status === "Pending"
          ? "In Progress"
          : "Completed";

    try {
      const updated = await updateResourceApi(resource._id, {
        status: nextStatus,
      });
      setResources((prev) =>
        prev.map((r) => (r._id === resource._id ? { ...r, status: updated.status } : r))
      );
      toast.success(`Resource status updated to ${nextStatus}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;
    try {
      await deleteResourceApi(id);
      setResources((prev) => prev.filter((r) => r._id !== id));
      toast.success("Resource deleted");
    } catch {
      toast.error("Failed to delete resource");
    }
  };

  // Filtered resources
  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = res.title.toLowerCase().includes(q);
        const matchesDesc = res.description?.toLowerCase().includes(q) || false;
        const matchesAuthor = res.author?.toLowerCase().includes(q) || false;
        const matchesTag = res.tags?.some((t) => t.toLowerCase().includes(q)) || false;
        if (!matchesTitle && !matchesDesc && !matchesAuthor && !matchesTag) {
          return false;
        }
      }

      // Type
      if (selectedType !== "All" && res.type !== selectedType) {
        return false;
      }

      // Roadmap
      if (selectedRoadmap !== "All") {
        const resRoadmapId =
          typeof res.roadmapId === "object" && res.roadmapId !== null
            ? (res.roadmapId as { _id?: string })._id
            : res.roadmapId;
        if (resRoadmapId !== selectedRoadmap) return false;
      }

      // Favorites
      if (onlyFavorites && !res.isFavorite) {
        return false;
      }

      // Status
      if (selectedStatus !== "All" && res.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [resources, search, selectedType, selectedRoadmap, onlyFavorites, selectedStatus]);

  // Stats calculation
  const totalCount = resources.length;
  const favoriteCount = resources.filter((r) => r.isFavorite).length;
  const completedCount = resources.filter((r) => r.status === "Completed").length;
  const docCourseCount = resources.filter(
    (r) => r.type === "Documentation" || r.type === "Online course"
  ).length;

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#62695D] bg-[#252D26] px-3 py-1 font-mono text-xs font-semibold text-[#D7FF00]">
            <BookOpen className="h-3.5 w-3.5 text-[#D7FF00]" />
            <span>CURATED LEARNING MATERIALS</span>
          </div>
          <h1 className="font-mono text-2xl font-bold uppercase tracking-tight text-[#F3F0E6] sm:text-3xl">
            Learning Resources
          </h1>
          <p className="mt-1 text-xs text-[#B8B9AA] md:text-sm">
            Curate, organize, and access learning materials, docs, and courses mapped to your
            curriculum.
          </p>
        </div>
        <div className="flex items-center gap-2">
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
            Add Resource
          </Button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-[#62695D] bg-[#252D26] p-3.5">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#B8B9AA]">
            Total Catalog
          </span>
          <div className="mt-1 flex items-center gap-2 font-mono text-xl font-bold text-[#F3F0E6]">
            {totalCount}
            <span className="text-xs font-normal text-[#B8B9AA]">items</span>
          </div>
        </div>

        <div className="rounded-xl border border-[#62695D] bg-[#252D26] p-3.5">
          <span className="flex items-center gap-1 font-mono text-[11px] font-bold uppercase tracking-wider text-[#D7FF00]">
            <Star className="h-3 w-3 fill-[#D7FF00]" /> Favorites
          </span>
          <div className="mt-1 font-mono text-xl font-bold text-[#EDE8D8]">{favoriteCount}</div>
        </div>

        <div className="rounded-xl border border-[#62695D] bg-[#252D26] p-3.5">
          <span className="flex items-center gap-1 font-mono text-[11px] font-bold uppercase tracking-wider text-[#D7FF00]">
            <CheckCircle2 className="h-3 w-3" /> Completed
          </span>
          <div className="mt-1 font-mono text-xl font-bold text-[#F3F0E6]">{completedCount}</div>
        </div>

        <div className="rounded-xl border border-[#62695D] bg-[#252D26] p-3.5">
          <span className="flex items-center gap-1 font-mono text-[11px] font-bold uppercase tracking-wider text-[#EDE8D8]">
            <Sparkles className="h-3 w-3 text-[#D7FF00]" /> Docs & Courses
          </span>
          <div className="mt-1 font-mono text-xl font-bold text-[#D7FF00]">{docCourseCount}</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-3 rounded-xl border border-[#62695D] bg-[#252D26] p-4">
        <div className="flex flex-col items-stretch justify-between gap-3 md:flex-row md:items-center">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B8B9AA]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search resources by title, description, author or tag..."
              className="w-full rounded-lg border border-[#62695D] bg-[#202720] py-2 pl-9 pr-4 font-mono text-xs text-[#F3F0E6] placeholder:text-[#B8B9AA]/50 focus:border-[#D7FF00] focus:outline-none"
            />
          </div>

          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2 font-mono">
            {/* Roadmap Select */}
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

            {/* Status Select */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="cursor-pointer rounded-lg border border-[#62695D] bg-[#202720] px-2.5 py-2 text-xs text-[#F3F0E6] focus:border-[#D7FF00] focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>

            {/* Favorites Toggle */}
            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                onlyFavorites
                  ? "border-[#D7FF00] bg-[#D7FF00] font-bold text-[#1B211C]"
                  : "border-[#62695D] bg-[#202720] text-[#B8B9AA] hover:text-[#EDE8D8]"
              }`}
            >
              <Star
                className={`h-3.5 w-3.5 ${onlyFavorites ? "fill-[#1B211C] text-[#1B211C]" : ""}`}
              />
              Favorites Only
            </button>
          </div>
        </div>

        {/* Resource Type Chips */}
        <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs">
          <button
            onClick={() => setSelectedType("All")}
            className={`whitespace-nowrap rounded-md px-2.5 py-1 font-mono text-[11px] transition-colors ${
              selectedType === "All"
                ? "bg-[#D7FF00] font-bold text-[#1B211C]"
                : "border border-[#62695D] bg-[#202720] text-[#B8B9AA] hover:text-[#EDE8D8]"
            }`}
          >
            All Types ({totalCount})
          </button>
          {RESOURCE_TYPES.map((type) => {
            const count = resources.filter((r) => r.type === type).length;
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`whitespace-nowrap rounded-md px-2.5 py-1 font-mono text-[11px] transition-colors ${
                  selectedType === type
                    ? "bg-[#D7FF00] font-bold text-[#1B211C]"
                    : "border border-[#62695D] bg-[#202720] text-[#B8B9AA] hover:text-[#EDE8D8]"
                }`}
              >
                {type} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Resources */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-xl border border-[#62695D] bg-[#252D26]"
            />
          ))}
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#62695D] bg-[#252D26]/40 p-8 py-16 text-center">
          <FolderOpen className="mx-auto mb-3 h-12 w-12 text-[#B8B9AA]" />
          <h3 className="mb-1 font-mono text-base font-bold text-[#F3F0E6]">No resources found</h3>
          <p className="mx-auto mb-4 max-w-sm text-xs text-[#B8B9AA]">
            {search || selectedType !== "All" || selectedRoadmap !== "All" || onlyFavorites
              ? "No resources match your active filter criteria. Try clearing some filters."
              : "You haven't saved any learning resources yet. Start bookmarking docs, courses, or guides!"}
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 font-mono font-bold uppercase"
          >
            <Plus className="h-4 w-4" />
            Add Resource
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map((res) => (
            <ResourceCard
              key={res._id}
              resource={res}
              onToggleFavorite={handleToggleFavorite}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add Resource Modal */}
      <AddResourceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onResourceCreated={(created) => {
          setResources((prev) => [created, ...prev]);
        }}
      />
    </div>
  );
}
