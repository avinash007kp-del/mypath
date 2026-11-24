"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Compass,
  ArrowLeft,
  Save,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Workflow,
  Download,
  MoreVertical,
  Check,
  AlertCircle,
  Loader2,
  Sparkles,
  Keyboard,
  FileCode,
  Image as ImageIcon,
  Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SaveStatus } from "@/types/roadmap";
import { cn } from "@/lib/utils";

interface RoadmapToolbarProps {
  roadmapId: string;
  title: string;
  onTitleChange: (newTitle: string) => void;
  saveStatus: SaveStatus;
  onManualSave: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onAutoLayout: () => void;
  onExportPng: () => void;
  onExportJson: () => void;
  onOpenTemplates: () => void;
  onOpenShortcuts: () => void;
}

export function RoadmapToolbar({
  roadmapId,
  title,
  onTitleChange,
  saveStatus,
  onManualSave,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onFitView,
  onAutoLayout,
  onExportPng,
  onExportJson,
  onOpenTemplates,
  onOpenShortcuts,
}: RoadmapToolbarProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(title);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const handleTitleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (titleValue.trim()) {
      onTitleChange(titleValue.trim());
    } else {
      setTitleValue(title);
    }
    setIsEditingTitle(false);
  };

  const getStatusBadge = () => {
    switch (saveStatus) {
      case "Saved":
        return (
          <span className="inline-flex items-center gap-1.5 rounded border border-[#62695D] bg-[#2C352D] px-2.5 py-1 font-mono text-[11px] text-[#D7FF00]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D7FF00]" />
            Saved
          </span>
        );
      case "Saving...":
        return (
          <span className="inline-flex items-center gap-1.5 rounded border border-amber-800/40 bg-amber-950/50 px-2.5 py-1 font-mono text-[11px] text-amber-300">
            <Loader2 className="h-3 w-3 animate-spin text-amber-400" />
            Saving...
          </span>
        );
      case "Unsaved changes":
        return (
          <span className="inline-flex items-center gap-1.5 rounded border border-[#62695D] bg-[#202720] px-2.5 py-1 font-mono text-[11px] text-[#EDE8D8]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#D7FF00]" />
            Unsaved changes
          </span>
        );
      case "Save failed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded border border-red-800/50 bg-red-950/60 px-2.5 py-1 font-mono text-[11px] text-red-300">
            <AlertCircle className="h-3 w-3 text-red-400" />
            Save failed
          </span>
        );
    }
  };

  return (
    <header className="z-30 flex h-14 w-full shrink-0 select-none items-center justify-between gap-3 border-b border-[#62695D] bg-[#252D26] px-3 md:px-5">
      {/* Left: Brand + Back + Editable Title */}
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href={`/roadmaps/${roadmapId}`}
          className="flex items-center gap-1.5 rounded-lg p-1.5 text-xs text-[#B8B9AA] transition-colors hover:bg-[#2C352D] hover:text-[#D7FF00]"
          title="Back to Roadmap Details"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div className="h-4 w-[1px] bg-[#62695D]" />

        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#62695D] bg-[#2C352D] text-[#D7FF00]">
            <Compass className="h-4 w-4 stroke-[2.2]" />
          </div>

          {isEditingTitle ? (
            <form onSubmit={handleTitleSubmit} className="flex items-center gap-1">
              <input
                type="text"
                autoFocus
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={() => handleTitleSubmit()}
                className="w-48 rounded border border-[#D7FF00] bg-[#202720] px-2 py-0.5 font-sans text-sm font-bold text-[#F3F0E6] focus:outline-none sm:w-64"
              />
              <button
                type="submit"
                className="rounded bg-[#D7FF00] p-1 text-[#1B211C] hover:bg-[#c2e600]"
              >
                <Check className="h-3.5 w-3.5 stroke-[3]" />
              </button>
            </form>
          ) : (
            <div
              onClick={() => setIsEditingTitle(true)}
              className="group flex min-w-0 cursor-pointer items-center gap-1.5 rounded px-1.5 py-1 transition-colors hover:bg-[#2C352D]"
              title="Click to rename roadmap"
            >
              <h2 className="max-w-[140px] truncate text-sm font-bold text-[#F3F0E6] sm:max-w-xs md:max-w-md">
                {title}
              </h2>
              <Edit3 className="h-3 w-3 text-[#B8B9AA] opacity-0 transition-opacity group-hover:text-[#D7FF00] group-hover:opacity-100" />
            </div>
          )}
        </div>

        <div className="hidden sm:block">{getStatusBadge()}</div>
      </div>

      {/* Middle & Right: Actions toolbar */}
      <div className="flex items-center gap-1.5">
        {/* Undo / Redo */}
        <div className="flex items-center rounded-xl border border-[#62695D] bg-[#202720] p-0.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="rounded-lg p-1.5 text-[#B8B9AA] transition-colors hover:bg-[#2C352D] hover:text-[#F3F0E6] disabled:opacity-30 disabled:hover:bg-transparent"
            title="Undo (Ctrl/Cmd + Z)"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="rounded-lg p-1.5 text-[#B8B9AA] transition-colors hover:bg-[#2C352D] hover:text-[#F3F0E6] disabled:opacity-30 disabled:hover:bg-transparent"
            title="Redo (Ctrl/Cmd + Shift + Z)"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Zoom controls */}
        <div className="hidden items-center rounded-xl border border-[#62695D] bg-[#202720] p-0.5 md:flex">
          <button
            onClick={onZoomIn}
            className="rounded-lg p-1.5 text-[#B8B9AA] transition-colors hover:bg-[#2C352D] hover:text-[#F3F0E6]"
            title="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onZoomOut}
            className="rounded-lg p-1.5 text-[#B8B9AA] transition-colors hover:bg-[#2C352D] hover:text-[#F3F0E6]"
            title="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onFitView}
            className="rounded-lg p-1.5 text-[#B8B9AA] transition-colors hover:bg-[#2C352D] hover:text-[#F3F0E6]"
            title="Fit View"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Auto Layout */}
        <button
          onClick={onAutoLayout}
          className="hidden items-center gap-1 rounded-xl border border-[#62695D] bg-[#202720] px-2.5 py-1.5 font-mono text-xs text-[#EDE8D8] transition-all hover:border-[#D7FF00]/50 hover:text-[#D7FF00] lg:flex"
          title="Automatically arrange nodes neatly"
        >
          <Workflow className="h-3.5 w-3.5 text-[#D7FF00]" />
          <span>Auto Layout</span>
        </button>

        {/* Templates */}
        <button
          onClick={onOpenTemplates}
          className="hidden items-center gap-1 rounded-xl border border-[#62695D] bg-[#202720] px-2.5 py-1.5 font-mono text-xs text-[#EDE8D8] transition-all hover:border-[#D7FF00]/50 hover:text-[#D7FF00] lg:flex"
          title="Browse starter curriculum templates"
        >
          <Sparkles className="h-3.5 w-3.5 text-[#D7FF00]" />
          <span>Templates</span>
        </button>

        {/* AI Copilot Button */}
        <Link
          href={`/ai-assistant?roadmapId=${roadmapId}`}
          className="flex items-center gap-1.5 rounded-xl border border-[#62695D] bg-[#2C352D] px-2.5 py-1.5 font-mono text-xs font-semibold text-[#D7FF00] shadow-sm transition-all hover:border-[#D7FF00]"
          title="Open AI Learning Assistant"
        >
          <Sparkles className="h-3.5 w-3.5 text-[#D7FF00]" />
          <span className="hidden md:inline">AI Copilot</span>
        </Link>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setExportMenuOpen(!exportMenuOpen)}
            className="flex items-center gap-1 rounded-xl border border-[#62695D] bg-[#202720] px-2.5 py-1.5 font-mono text-xs text-[#EDE8D8] transition-all hover:border-[#D7FF00]/50 hover:text-[#D7FF00]"
            title="Export roadmap"
          >
            <Download className="h-3.5 w-3.5 text-[#D7FF00]" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {exportMenuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setExportMenuOpen(false)} />
              <div className="absolute right-0 z-40 mt-1 w-48 rounded-2xl border border-[#62695D] bg-[#252D26] p-1.5 shadow-2xl">
                <button
                  onClick={() => {
                    setExportMenuOpen(false);
                    onExportPng();
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 font-mono text-xs text-[#F3F0E6] transition-colors hover:bg-[#2C352D] hover:text-[#D7FF00]"
                >
                  <ImageIcon className="h-3.5 w-3.5 text-[#D7FF00]" />
                  <span>Export as PNG Image</span>
                </button>
                <button
                  onClick={() => {
                    setExportMenuOpen(false);
                    onExportJson();
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 font-mono text-xs text-[#F3F0E6] transition-colors hover:bg-[#2C352D] hover:text-[#D7FF00]"
                >
                  <FileCode className="h-3.5 w-3.5 text-[#EDE8D8]" />
                  <span>Export as JSON</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Manual Save Button */}
        <Button variant="primary" size="sm" onClick={onManualSave} className="shadow-sm">
          <Save className="mr-1 h-3.5 w-3.5" />
          <span className="hidden sm:inline">Save</span>
        </Button>

        {/* More Actions Menu */}
        <div className="relative">
          <button
            onClick={() => setMoreMenuOpen(!moreMenuOpen)}
            className="rounded-xl border border-[#62695D] bg-[#202720] p-1.5 text-[#B8B9AA] transition-colors hover:bg-[#2C352D] hover:text-[#F3F0E6]"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {moreMenuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setMoreMenuOpen(false)} />
              <div className="absolute right-0 z-40 mt-1 w-48 rounded-2xl border border-[#62695D] bg-[#252D26] p-1.5 shadow-2xl">
                <button
                  onClick={() => {
                    setMoreMenuOpen(false);
                    onOpenTemplates();
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 font-mono text-xs text-[#F3F0E6] hover:bg-[#2C352D] hover:text-[#D7FF00]"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#D7FF00]" />
                  <span>Load Template</span>
                </button>
                <button
                  onClick={() => {
                    setMoreMenuOpen(false);
                    onAutoLayout();
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 font-mono text-xs text-[#F3F0E6] hover:bg-[#2C352D] hover:text-[#D7FF00]"
                >
                  <Workflow className="h-3.5 w-3.5 text-[#D7FF00]" />
                  <span>Run Auto Layout</span>
                </button>
                <button
                  onClick={() => {
                    setMoreMenuOpen(false);
                    onOpenShortcuts();
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 font-mono text-xs text-[#F3F0E6] hover:bg-[#2C352D] hover:text-[#D7FF00]"
                >
                  <Keyboard className="h-3.5 w-3.5 text-[#EDE8D8]" />
                  <span>Keyboard Shortcuts</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
