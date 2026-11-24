"use client";

import React, { useState, useEffect } from "react";
import { X, Link2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { RESOURCE_TYPES } from "@/models/LearningResource";
import { ResourceType, ILearningResource } from "@/types/lms";
import { IRoadmap } from "@/types";
import { createResourceApi, fetchRoadmaps } from "@/services/api";
import { toast } from "sonner";

interface AddResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  roadmapId?: string;
  nodeId?: string;
  onResourceCreated?: (resource: ILearningResource) => void;
}

export function AddResourceModal({
  isOpen,
  onClose,
  roadmapId,
  nodeId,
  onResourceCreated,
}: AddResourceModalProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ResourceType>("Documentation");
  const [author, setAuthor] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [rating, setRating] = useState(5);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState(roadmapId || "");
  const [roadmaps, setRoadmaps] = useState<IRoadmap[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && !roadmapId) {
      fetchRoadmaps().then((data) => {
        setRoadmaps(data);
      });
    }
  }, [isOpen, roadmapId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      toast.error("Title and URL are required.");
      return;
    }

    try {
      new URL(url); // validate URL syntax
    } catch {
      toast.error("Please enter a valid URL (including https://).");
      return;
    }

    setIsSubmitting(true);
    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim().replace(/^#/, ""))
        .filter(Boolean);

      const created = await createResourceApi({
        title: title.trim(),
        url: url.trim(),
        description: description.trim(),
        type,
        author: author.trim(),
        tags,
        rating,
        roadmapId: roadmapId || selectedRoadmapId || undefined,
        nodeId: nodeId || undefined,
        isFavorite: false,
        status: "Pending",
      });

      toast.success("Resource saved successfully!");
      if (onResourceCreated) onResourceCreated(created);
      onClose();
      // Reset form
      setTitle("");
      setUrl("");
      setDescription("");
      setAuthor("");
      setTagsInput("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add resource";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg space-y-4 rounded-2xl border border-[#62695D] bg-[#252D26] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#62695D]/40 pb-3">
          <div className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-[#D7FF00]" />
            <h3 className="text-base font-bold text-[#F3F0E6]">Add Learning Resource</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[#B8B9AA] transition-colors hover:bg-[#2C352D] hover:text-[#F3F0E6]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="mb-1 block font-mono text-xs font-semibold text-[#F3F0E6]">
              Resource Title <span className="text-[#D7FF00]">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Official React 19 Docs & Hooks Guide"
              className="w-full rounded-xl border border-[#62695D] bg-[#202720] px-3 py-1.5 text-xs text-[#F3F0E6] placeholder:text-[#B8B9AA]/50 focus:border-[#D7FF00] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block font-mono text-xs font-semibold text-[#F3F0E6]">
              Resource URL <span className="text-[#D7FF00]">*</span>
            </label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl border border-[#62695D] bg-[#202720] px-3 py-1.5 font-mono text-xs text-[#F3F0E6] placeholder:text-[#B8B9AA]/50 focus:border-[#D7FF00] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-mono text-xs font-semibold text-[#F3F0E6]">
                Resource Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ResourceType)}
                className="w-full cursor-pointer rounded-xl border border-[#62695D] bg-[#202720] px-2.5 py-1.5 font-mono text-xs text-[#F3F0E6] focus:border-[#D7FF00] focus:outline-none"
              >
                {RESOURCE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block font-mono text-xs font-semibold text-[#F3F0E6]">
                Author / Creator
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Dan Abramov, FreeCodeCamp"
                className="w-full rounded-xl border border-[#62695D] bg-[#202720] px-3 py-1.5 text-xs text-[#F3F0E6] placeholder:text-[#B8B9AA]/50 focus:border-[#D7FF00] focus:outline-none"
              />
            </div>
          </div>

          {!roadmapId && roadmaps.length > 0 && (
            <div>
              <label className="mb-1 block font-mono text-xs font-semibold text-[#F3F0E6]">
                Link to Roadmap (Optional)
              </label>
              <select
                value={selectedRoadmapId}
                onChange={(e) => setSelectedRoadmapId(e.target.value)}
                className="w-full cursor-pointer rounded-xl border border-[#62695D] bg-[#202720] px-2.5 py-1.5 font-mono text-xs text-[#F3F0E6] focus:border-[#D7FF00] focus:outline-none"
              >
                <option value="">General Resource (No specific roadmap)</option>
                {roadmaps.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.title} ({r.category})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="mb-1 block font-mono text-xs font-semibold text-[#F3F0E6]">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Why is this resource useful? What milestones does it cover?"
              className="w-full resize-y rounded-xl border border-[#62695D] bg-[#202720] px-3 py-1.5 text-xs text-[#F3F0E6] placeholder:text-[#B8B9AA]/50 focus:border-[#D7FF00] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-mono text-xs font-semibold text-[#F3F0E6]">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="React, Hooks, SSR"
                className="w-full rounded-xl border border-[#62695D] bg-[#202720] px-3 py-1.5 text-xs text-[#F3F0E6] placeholder:text-[#B8B9AA]/50 focus:border-[#D7FF00] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block font-mono text-xs font-semibold text-[#F3F0E6]">
                Rating (1 to 5 Stars)
              </label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full rounded-xl border border-[#62695D] bg-[#202720] px-2.5 py-1.5 font-mono text-xs text-[#F3F0E6] focus:border-[#D7FF00] focus:outline-none"
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5 - Essential)</option>
                <option value={4}>⭐⭐⭐⭐ (4 - Great)</option>
                <option value={3}>⭐⭐⭐ (3 - Good)</option>
                <option value={2}>⭐⭐ (2 - Average)</option>
                <option value={1}>⭐ (1 - Low)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-[#62695D]/40 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-[#62695D]"
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Save Resource
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
