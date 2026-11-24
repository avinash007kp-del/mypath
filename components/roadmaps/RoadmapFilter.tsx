"use client";

import React from "react";
import { Search, LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import { ROADMAP_CATEGORIES, ROADMAP_DIFFICULTIES } from "@/lib/validations/roadmap";

interface RoadmapFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  difficulty: string;
  onDifficultyChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

export function RoadmapFilter({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  difficulty,
  onDifficultyChange,
  sortBy,
  onSortByChange,
  viewMode,
  onViewModeChange,
}: RoadmapFilterProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[#62695D] bg-[#252D26] p-4 shadow-sm">
      {/* Top row: search + view switch */}
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        {/* Search Input */}
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B8B9AA]" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search roadmaps by title, description or tag..."
            className="w-full rounded-lg border border-[#62695D] bg-[#202720] py-2 pl-9 pr-3 font-mono text-sm text-[#F3F0E6] transition-colors placeholder:text-[#B8B9AA]/50 focus:border-[#D7FF00] focus:outline-none"
          />
        </div>

        {/* View Switch */}
        <div className="flex items-center gap-1 self-end rounded-lg border border-[#62695D] bg-[#202720] p-1 sm:self-auto">
          <button
            onClick={() => onViewModeChange("grid")}
            className={`rounded-md p-1.5 font-mono text-xs font-medium transition-colors ${
              viewMode === "grid"
                ? "bg-[#D7FF00] text-[#1B211C]"
                : "text-[#B8B9AA] hover:text-[#EDE8D8]"
            }`}
            title="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={`rounded-md p-1.5 font-mono text-xs font-medium transition-colors ${
              viewMode === "list"
                ? "bg-[#D7FF00] text-[#1B211C]"
                : "text-[#B8B9AA] hover:text-[#EDE8D8]"
            }`}
            title="List view"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Bottom row: Category, Difficulty, Sort filters */}
      <div className="flex flex-wrap items-center gap-2.5 border-t border-[#62695D]/40 pt-2 font-mono text-xs">
        <div className="mr-1 flex items-center gap-1.5 font-bold text-[#B8B9AA]">
          <SlidersHorizontal className="h-3.5 w-3.5 text-[#D7FF00]" />
          <span>FILTERS:</span>
        </div>

        {/* Category Select */}
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="cursor-pointer rounded-lg border border-[#62695D] bg-[#202720] px-2.5 py-1.5 text-xs text-[#F3F0E6] focus:border-[#D7FF00] focus:outline-none"
        >
          <option value="All">All Categories</option>
          {ROADMAP_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Difficulty Select */}
        <select
          value={difficulty}
          onChange={(e) => onDifficultyChange(e.target.value)}
          className="cursor-pointer rounded-lg border border-[#62695D] bg-[#202720] px-2.5 py-1.5 text-xs text-[#F3F0E6] focus:border-[#D7FF00] focus:outline-none"
        >
          <option value="All">All Difficulties</option>
          {ROADMAP_DIFFICULTIES.map((diff) => (
            <option key={diff} value={diff}>
              {diff}
            </option>
          ))}
        </select>

        {/* Sort Select */}
        <div className="ml-auto flex items-center gap-1.5">
          <span className="hidden text-[#B8B9AA] sm:inline">SORT:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="cursor-pointer rounded-lg border border-[#62695D] bg-[#202720] px-2.5 py-1.5 text-xs text-[#F3F0E6] focus:border-[#D7FF00] focus:outline-none"
          >
            <option value="updatedAt">Recently Updated</option>
            <option value="createdAt">Date Created</option>
            <option value="progress">Progress %</option>
            <option value="title">Title (A-Z)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
