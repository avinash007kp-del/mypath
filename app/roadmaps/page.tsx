"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, RefreshCw, LayoutGrid, Network } from "lucide-react";
import { IRoadmap } from "@/types";
import { fetchRoadmaps, deleteRoadmapApi } from "@/services/api";
import { RoadmapCard } from "@/components/roadmaps/RoadmapCard";
import { RoadmapListItem } from "@/components/roadmaps/RoadmapListItem";
import { RoadmapFilter } from "@/components/roadmaps/RoadmapFilter";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { TectonicRoadmapView } from "@/components/roadmaps/TectonicRoadmapView";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function RoadmapsPage() {
  const [activeTab, setActiveTab] = useState<"track" | "catalog">("track");
  const [roadmaps, setRoadmaps] = useState<IRoadmap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [sortBy, setSortBy] = useState("updatedAt");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [deletingRoadmap, setDeletingRoadmap] = useState<IRoadmap | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadRoadmaps = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchRoadmaps({
        search,
        category,
        difficulty,
        sortBy,
        order: sortBy === "title" ? "asc" : "desc",
      });
      setRoadmaps(data);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to load roadmaps";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [search, category, difficulty, sortBy]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadRoadmaps();
    }, 250);
    return () => clearTimeout(timer);
  }, [loadRoadmaps]);

  const confirmDelete = async () => {
    if (!deletingRoadmap) return;
    setIsDeleting(true);
    try {
      await deleteRoadmapApi(deletingRoadmap._id);
      toast.success(`Roadmap "${deletingRoadmap.title}" was deleted.`);
      setDeletingRoadmap(null);
      loadRoadmaps();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to delete roadmap";
      toast.error(errorMsg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex w-full flex-col">
      {/* Top View Mode Switcher Toolbar */}
      <div className="mx-auto mb-2 flex w-full max-w-7xl flex-wrap items-center justify-between gap-space-sm border-b border-outline-variant/20 px-gutter pb-space-xs pt-space-sm">
        <div className="inline-flex items-center gap-1 rounded-DEFAULT border border-outline-variant/40 bg-surface-container-lowest p-1">
          <button
            onClick={() => setActiveTab("track")}
            className={cn(
              "flex cursor-pointer items-center gap-1.5 rounded-DEFAULT px-space-md py-1 font-label-sm text-label-sm uppercase tracking-wider transition-all",
              activeTab === "track"
                ? "bg-tertiary-fixed font-bold text-on-tertiary-fixed shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            <span className="material-symbols-outlined text-xs">alt_route</span>
            <span>TRACK TIMELINE SPEC</span>
          </button>

          <button
            onClick={() => setActiveTab("catalog")}
            className={cn(
              "flex cursor-pointer items-center gap-1.5 rounded-DEFAULT px-space-md py-1 font-label-sm text-label-sm uppercase tracking-wider transition-all",
              activeTab === "catalog"
                ? "bg-tertiary-fixed font-bold text-on-tertiary-fixed shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            <span className="material-symbols-outlined text-xs">folder_open</span>
            <span>CURRICULUM ARCHIVE ({roadmaps.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-space-sm">
          <Link
            href="/roadmaps/create"
            className="flex items-center gap-1 rounded-DEFAULT border border-secondary/40 bg-primary-container px-space-md py-1 font-label-sm text-label-sm uppercase tracking-wider text-tertiary-fixed transition-colors hover:bg-secondary hover:text-on-secondary"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>NEW ARCHITECTURE</span>
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === "track" ? (
        <TectonicRoadmapView />
      ) : (
        <div className="mx-auto w-full max-w-7xl space-y-6 px-gutter py-space-md">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-DEFAULT border border-outline-variant bg-surface-container px-3 py-1 font-mono text-xs font-semibold text-tertiary-fixed">
                <Network className="h-3.5 w-3.5 text-secondary" />
                <span>CURRICULUM SPECIFICATIONS CATALOG</span>
              </div>
              <h2 className="font-headline-md text-2xl font-bold uppercase tracking-tight text-on-surface sm:text-3xl">
                All Learning Roadmaps
              </h2>
              <p className="mt-1 font-body-sm text-xs text-on-surface-variant md:text-sm">
                Browse, manage, and configure visual graphs across your engineering roadmaps.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="md"
                onClick={loadRoadmaps}
                className="text-on-surface-variant hover:text-on-surface"
                title="Refresh list"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <RoadmapFilter
            search={search}
            onSearchChange={setSearch}
            category={category}
            onCategoryChange={setCategory}
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="space-y-4 rounded-DEFAULT border border-outline-variant bg-surface-container p-6"
                >
                  <Skeleton className="h-6 w-3/4 bg-surface-container-high" />
                  <Skeleton className="h-4 w-full bg-surface-container-high" />
                  <Skeleton className="h-4 w-2/3 bg-surface-container-high" />
                  <Skeleton className="h-8 w-full rounded-DEFAULT bg-surface-container-high" />
                </div>
              ))}
            </div>
          ) : roadmaps.length === 0 ? (
            <EmptyState
              icon={<Network className="h-10 w-10 text-outline" />}
              title="No roadmaps found"
              description="Adjust your search criteria or create a new curriculum to get started."
              actionLabel="Create Roadmap"
              onAction={() => {
                window.location.href = "/roadmaps/create";
              }}
            />
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {roadmaps.map((r) => (
                <RoadmapCard
                  key={r._id}
                  roadmap={r}
                  onDeleteRequest={() => setDeletingRoadmap(r)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {roadmaps.map((r) => (
                <RoadmapListItem
                  key={r._id}
                  roadmap={r}
                  onDeleteRequest={() => setDeletingRoadmap(r)}
                />
              ))}
            </div>
          )}

          {/* Delete Roadmap Confirmation Modal */}
          <Dialog
            isOpen={!!deletingRoadmap}
            onClose={() => setDeletingRoadmap(null)}
            title="Delete Roadmap"
            description={`Are you sure you want to delete "${deletingRoadmap?.title}"? All associated progress and topics will be permanently removed.`}
            confirmLabel={isDeleting ? "Deleting..." : "Delete Roadmap"}
            variant="danger"
            onConfirm={confirmDelete}
          />
        </div>
      )}
    </div>
  );
}
