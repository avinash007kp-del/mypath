"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Trash2, Bookmark, Tag, Check, Loader2, Calendar } from "lucide-react";
import { ILearningNote, IRoadmap } from "@/types";
import { fetchNoteById, updateNoteApi, deleteNoteApi, fetchRoadmaps } from "@/services/api";
import { MarkdownEditor } from "@/components/lms/MarkdownEditor";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";

export default function NoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [note, setNote] = useState<ILearningNote | null>(null);
  const [roadmaps, setRoadmaps] = useState<IRoadmap[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [roadmapId, setRoadmapId] = useState<string>("");
  const [tagsInput, setTagsInput] = useState("");
  const [saveStatus, setSaveStatus] = useState<"Saved" | "Saving..." | "Unsaved changes">("Saved");

  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const loadData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [noteData, roadmapsData] = await Promise.all([fetchNoteById(id), fetchRoadmaps()]);
      setNote(noteData);
      setRoadmaps(roadmapsData);
      setTitle(noteData.title);
      setContent(noteData.content);
      setRoadmapId(noteData.roadmapId || "");
      setTagsInput(noteData.tags?.join(", ") || "");
    } catch {
      toast.error("Failed to load note");
      router.push("/notes");
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const saveNote = async (
    currentTitle = title,
    currentContent = content,
    currentRoadmapId = roadmapId,
    currentTags = tagsInput
  ) => {
    if (!currentTitle.trim()) return;
    setSaveStatus("Saving...");

    try {
      const tags = currentTags
        .split(",")
        .map((t) => t.trim().replace(/^#/, ""))
        .filter(Boolean);

      const updated = await updateNoteApi(id, {
        title: currentTitle.trim(),
        content: currentContent,
        roadmapId: currentRoadmapId || undefined,
        tags,
      });

      setNote(updated);
      setSaveStatus("Saved");
    } catch {
      setSaveStatus("Unsaved changes");
      toast.error("Failed to autosave note");
    }
  };

  const handleContentChange = (newVal: string) => {
    setContent(newVal);
    setSaveStatus("Unsaved changes");

    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(() => {
      saveNote(title, newVal, roadmapId, tagsInput);
    }, 1000);
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this note?")) {
      try {
        await deleteNoteApi(id);
        toast.success("Note deleted");
        router.push("/notes");
      } catch {
        toast.error("Failed to delete note");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 pb-16">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (!note) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-16">
      {/* Back button & Action Toolbar */}
      <div className="flex flex-col justify-between gap-3 border-b border-[#62695D]/40 pb-3 sm:flex-row sm:items-center">
        <Link
          href="/notes"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-[#B8B9AA] transition-colors hover:text-[#D7FF00]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Notes
        </Link>

        <div className="flex items-center gap-3">
          {/* Save Status Badge */}
          <span className="flex items-center gap-1.5 font-mono text-[11px] text-[#B8B9AA]">
            {saveStatus === "Saving..." && (
              <Loader2 className="h-3 w-3 animate-spin text-amber-400" />
            )}
            {saveStatus === "Saved" && <Check className="h-3 w-3 stroke-[3] text-[#D7FF00]" />}
            {saveStatus}
          </span>

          <Button variant="primary" size="sm" onClick={() => saveNote()} className="shadow-sm">
            <Save className="mr-1 h-3.5 w-3.5" />
            Save
          </Button>

          <Button variant="danger" size="sm" onClick={handleDelete} title="Delete note">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Title Input */}
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setSaveStatus("Unsaved changes");
          }}
          onBlur={() => saveNote()}
          placeholder="Note Title..."
          className="w-full border-b border-[#62695D] bg-transparent pb-2 text-2xl font-black text-[#F3F0E6] placeholder:text-[#B8B9AA]/40 focus:border-[#D7FF00] focus:outline-none md:text-3xl"
        />
      </div>

      {/* Metadata Configuration Bar */}
      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-[#62695D] bg-[#252D26] p-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block flex items-center gap-1.5 font-mono text-xs font-semibold text-[#F3F0E6]">
            <Bookmark className="h-3.5 w-3.5 text-[#D7FF00]" />
            Associated Roadmap
          </label>
          <select
            value={roadmapId}
            onChange={(e) => {
              setRoadmapId(e.target.value);
              saveNote(title, content, e.target.value, tagsInput);
            }}
            className="w-full cursor-pointer rounded-xl border border-[#62695D] bg-[#202720] px-3 py-1.5 font-mono text-xs text-[#F3F0E6] focus:border-[#D7FF00] focus:outline-none"
          >
            <option value="">-- General / Standalone Note --</option>
            {roadmaps.map((r) => (
              <option key={r._id} value={r._id}>
                {r.icon || "🚀"} {r.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block flex items-center gap-1.5 font-mono text-xs font-semibold text-[#F3F0E6]">
            <Tag className="h-3.5 w-3.5 text-[#EDE8D8]" />
            Tags (comma separated)
          </label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => {
              setTagsInput(e.target.value);
              setSaveStatus("Unsaved changes");
            }}
            onBlur={() => saveNote()}
            placeholder="TypeScript, Architecture, ServerActions"
            className="w-full rounded-xl border border-[#62695D] bg-[#202720] px-3 py-1.5 text-xs text-[#F3F0E6] placeholder:text-[#B8B9AA]/50 focus:border-[#D7FF00] focus:outline-none"
          />
        </div>
      </div>

      {/* Markdown Editor */}
      <MarkdownEditor
        value={content}
        onChange={handleContentChange}
        placeholder="Type markdown notes, paste code snippets, or document architectural decisions..."
        minHeight="420px"
      />

      {/* Footer Info */}
      <div className="flex items-center justify-between border-t border-[#62695D]/40 pt-2 font-mono text-xs text-[#B8B9AA]">
        <span>Created: {new Date(note.createdAt).toLocaleDateString()}</span>
        <span>Last updated: {formatRelativeTime(note.updatedAt)}</span>
      </div>
    </div>
  );
}
