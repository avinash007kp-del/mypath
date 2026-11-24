"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Search,
  Tag,
  Bookmark,
  Calendar,
  Trash2,
  Edit2,
  Sparkles,
} from "lucide-react";
import { ILearningNote, IRoadmap } from "@/types";
import { fetchNotes, deleteNoteApi, fetchRoadmaps, createNoteApi } from "@/services/api";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";

export default function NotesPage() {
  const [notes, setNotes] = useState<ILearningNote[]>([]);
  const [roadmaps, setRoadmaps] = useState<IRoadmap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRoadmap, setSelectedRoadmap] = useState("All");
  const [selectedTag, setSelectedTag] = useState("All");

  // Quick note modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newRoadmapId, setNewRoadmapId] = useState("");
  const [newTags, setNewTags] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [notesData, roadmapsData] = await Promise.all([
        fetchNotes({
          search,
          roadmapId: selectedRoadmap !== "All" ? selectedRoadmap : undefined,
          tag: selectedTag !== "All" ? selectedTag : undefined,
        }),
        fetchRoadmaps(),
      ]);
      setNotes(notesData);
      setRoadmaps(roadmapsData);
    } catch (err: unknown) {
      toast.error("Failed to load notes");
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedRoadmap, selectedTag]);

  useEffect(() => {
    const timer = setTimeout(loadData, 200);
    return () => clearTimeout(timer);
  }, [loadData]);

  // Extract all unique tags
  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags || [])));

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await deleteNoteApi(id);
      setNotes((prev) => prev.filter((n) => n._id !== id));
      toast.success("Note deleted");
    } catch {
      toast.error("Failed to delete note");
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setIsCreating(true);
    try {
      const tags = newTags
        .split(",")
        .map((t) => t.trim().replace(/^#/, ""))
        .filter(Boolean);

      const created = await createNoteApi({
        title: newTitle.trim(),
        content: newContent.trim(),
        roadmapId: newRoadmapId || undefined,
        tags,
      });

      setNotes((prev) => [created, ...prev]);
      toast.success("Note created!");
      setIsModalOpen(false);
      setNewTitle("");
      setNewContent("");
      setNewTags("");
    } catch {
      toast.error("Failed to create note");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#62695D] bg-[#252D26] px-3 py-1 font-mono text-xs font-semibold text-[#D7FF00]">
            <FileText className="h-3.5 w-3.5 text-[#D7FF00]" />
            <span>KNOWLEDGE BASE & TECHNICAL INSIGHTS</span>
          </div>
          <h2 className="font-mono text-2xl font-bold uppercase tracking-tight text-[#F3F0E6] sm:text-3xl">
            Personal Learning Notes
          </h2>
          <p className="mt-1 text-xs text-[#B8B9AA] md:text-sm">
            Capture knowledge, code snippets, and takeaways connected to your roadmap topics.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Create Note
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col items-center gap-3 rounded-xl border border-[#62695D] bg-[#252D26] p-3.5 sm:flex-row">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B8B9AA]" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes by title, content, or tag..."
            className="w-full rounded-lg border border-[#62695D] bg-[#202720] py-1.5 pl-9 pr-3 font-mono text-xs text-[#F3F0E6] placeholder:text-[#B8B9AA]/50 focus:border-[#D7FF00] focus:outline-none"
          />
        </div>

        <select
          value={selectedRoadmap}
          onChange={(e) => setSelectedRoadmap(e.target.value)}
          className="w-full rounded-lg border border-[#62695D] bg-[#202720] px-2.5 py-1.5 font-mono text-xs text-[#F3F0E6] focus:border-[#D7FF00] focus:outline-none sm:w-52"
        >
          <option value="All">All Roadmaps</option>
          {roadmaps.map((r) => (
            <option key={r._id} value={r._id}>
              {r.title}
            </option>
          ))}
        </select>
      </div>

      {/* Tags Pills */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 flex items-center gap-1 font-mono text-xs font-bold text-[#B8B9AA]">
            <Tag className="h-3 w-3 text-[#D7FF00]" />
            TAGS:
          </span>
          <button
            onClick={() => setSelectedTag("All")}
            className={`rounded-full px-2.5 py-0.5 font-mono text-xs transition-colors ${
              selectedTag === "All"
                ? "bg-[#D7FF00] font-bold text-[#1B211C]"
                : "border border-[#62695D] bg-[#202720] text-[#B8B9AA] hover:text-[#EDE8D8]"
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? "All" : tag)}
              className={`rounded-full px-2.5 py-0.5 font-mono text-xs transition-colors ${
                selectedTag === tag
                  ? "bg-[#D7FF00] font-bold text-[#1B211C]"
                  : "border border-[#62695D] bg-[#202720] text-[#B8B9AA] hover:text-[#EDE8D8]"
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Notes Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-44 w-full rounded-xl bg-[#252D26]" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <EmptyState
          title="No notes found"
          description="Create your first learning note to write down insights, summaries, and code snippets."
          actionLabel="Create First Note"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <Link
              key={note._id}
              href={`/notes/${note._id}`}
              className="group flex flex-col justify-between rounded-xl border border-[#62695D] bg-[#252D26] p-4 shadow-sm transition-all hover:border-[#D7FF00] hover:bg-[#2C352D]"
            >
              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1 font-mono text-[11px] font-bold text-[#D7FF00]">
                    <Bookmark className="h-3 w-3 text-[#D7FF00]" />
                    {note.roadmapTitle || "General Note"}
                  </span>

                  <button
                    onClick={(e) => handleDelete(note._id, e)}
                    className="rounded p-1 text-[#B8B9AA] transition-colors hover:bg-red-500/10 hover:text-red-400"
                    title="Delete note"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <h3 className="line-clamp-1 font-mono text-sm font-bold text-[#F3F0E6] transition-colors group-hover:text-[#D7FF00]">
                  {note.title}
                </h3>

                <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-[#B8B9AA]">
                  {note.content || "Empty note. Click to start writing markdown..."}
                </p>

                {note.tags && note.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {note.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded border border-[#62695D] bg-[#202720] px-2 py-0.5 font-mono text-[10px] text-[#B8B9AA]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#62695D]/40 pt-2.5 font-mono text-[11px] text-[#B8B9AA]">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-[#D7FF00]" />
                  {formatRelativeTime(note.updatedAt)}
                </span>
                <span className="text-[#D7FF00] group-hover:underline">Edit Note →</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Quick Create Note Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative z-10 w-full max-w-lg space-y-4 rounded-2xl border border-[#62695D] bg-[#252D26] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#62695D] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#D7FF00]" />
                <h3 className="font-mono text-base font-bold uppercase text-[#F3F0E6]">
                  Create Quick Note
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-[#B8B9AA] hover:text-[#EDE8D8]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNote} className="space-y-3.5">
              <div>
                <label className="mb-1 block font-mono text-xs font-bold uppercase tracking-wider text-[#EDE8D8]">
                  Note Title <span className="text-[#D7FF00]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Understanding Next.js Caching & Revalidation"
                  className="w-full rounded-lg border border-[#62695D] bg-[#202720] px-3 py-1.5 font-mono text-xs text-[#F3F0E6] placeholder:text-[#B8B9AA]/50 focus:border-[#D7FF00] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-mono text-xs font-bold uppercase tracking-wider text-[#EDE8D8]">
                  Associate Roadmap (Optional)
                </label>
                <select
                  value={newRoadmapId}
                  onChange={(e) => setNewRoadmapId(e.target.value)}
                  className="w-full rounded-lg border border-[#62695D] bg-[#202720] px-2 py-1.5 font-mono text-xs text-[#F3F0E6] focus:border-[#D7FF00] focus:outline-none"
                >
                  <option value="">-- Standalone Note --</option>
                  {roadmaps.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block font-mono text-xs font-bold uppercase tracking-wider text-[#EDE8D8]">
                  Initial Content (Markdown supported)
                </label>
                <textarea
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Key concepts, takeaways, or code blocks..."
                  className="w-full resize-y rounded-lg border border-[#62695D] bg-[#202720] px-3 py-2 font-mono text-xs text-[#F3F0E6] placeholder:text-[#B8B9AA]/50 focus:border-[#D7FF00] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-mono text-xs font-bold uppercase tracking-wider text-[#EDE8D8]">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="Nextjs, Caching, Backend"
                  className="w-full rounded-lg border border-[#62695D] bg-[#202720] px-3 py-1.5 font-mono text-xs text-[#F3F0E6] placeholder:text-[#B8B9AA]/50 focus:border-[#D7FF00] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-[#62695D] pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isCreating}>
                  Save Note
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
