"use client";

import React, { useState, useEffect } from "react";
import { X, Trophy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MilestonePriority, IMilestone } from "@/types/lms";
import { IRoadmap } from "@/types";
import { createMilestoneApi, fetchRoadmaps } from "@/services/api";
import { toast } from "sonner";

interface AddMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  roadmapId?: string;
  nodeId?: string;
  onMilestoneCreated?: (milestone: IMilestone) => void;
}

export function AddMilestoneModal({
  isOpen,
  onClose,
  roadmapId,
  nodeId,
  onMilestoneCreated,
}: AddMilestoneModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [priority, setPriority] = useState<MilestonePriority>("Medium");
  const [selectedRoadmapId, setSelectedRoadmapId] = useState(roadmapId || "");
  const [roadmaps, setRoadmaps] = useState<IRoadmap[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchRoadmaps().then((data) => {
        setRoadmaps(data);
        if (!selectedRoadmapId && data.length > 0) {
          setSelectedRoadmapId(data[0]._id);
        }
      });
    }
  }, [isOpen, selectedRoadmapId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetDate) {
      toast.error("Title and Target Date are required.");
      return;
    }
    if (!selectedRoadmapId) {
      toast.error("Please associate this milestone with a roadmap.");
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createMilestoneApi({
        title: title.trim(),
        description: description.trim(),
        targetDate: new Date(targetDate).toISOString(),
        priority,
        roadmapId: selectedRoadmapId,
        nodeId: nodeId || undefined,
        status: "Upcoming",
      });

      toast.success("Milestone created successfully!");
      if (onMilestoneCreated) onMilestoneCreated(created);
      onClose();
      setTitle("");
      setDescription("");
      setTargetDate("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create milestone";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md space-y-4 rounded-2xl border border-[#62695D] bg-[#252D26] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#62695D]/40 pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-[#D7FF00]" />
            <h3 className="text-base font-bold text-[#F3F0E6]">Create Learning Milestone</h3>
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
              Associated Roadmap <span className="text-[#D7FF00]">*</span>
            </label>
            <select
              value={selectedRoadmapId}
              onChange={(e) => setSelectedRoadmapId(e.target.value)}
              className="w-full cursor-pointer rounded-xl border border-[#62695D] bg-[#202720] px-3 py-1.5 font-mono text-xs text-[#F3F0E6] focus:border-[#D7FF00] focus:outline-none"
            >
              <option value="" disabled>
                Select Roadmap
              </option>
              {roadmaps.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block font-mono text-xs font-semibold text-[#F3F0E6]">
              Milestone Title <span className="text-[#D7FF00]">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Complete Backend API Certification"
              className="w-full rounded-xl border border-[#62695D] bg-[#202720] px-3 py-1.5 text-xs text-[#F3F0E6] placeholder:text-[#B8B9AA]/50 focus:border-[#D7FF00] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-mono text-xs font-semibold text-[#F3F0E6]">
                Target Deadline <span className="text-[#D7FF00]">*</span>
              </label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full rounded-xl border border-[#62695D] bg-[#202720] px-3 py-1.5 font-mono text-xs text-[#F3F0E6] focus:border-[#D7FF00] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block font-mono text-xs font-semibold text-[#F3F0E6]">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as MilestonePriority)}
                className="w-full rounded-xl border border-[#62695D] bg-[#202720] px-2.5 py-1.5 font-mono text-xs text-[#F3F0E6] focus:border-[#D7FF00] focus:outline-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block font-mono text-xs font-semibold text-[#F3F0E6]">
              Description / Success Criteria
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Define requirements or criteria for completion..."
              className="w-full resize-y rounded-xl border border-[#62695D] bg-[#202720] px-3 py-1.5 text-xs text-[#F3F0E6] placeholder:text-[#B8B9AA]/50 focus:border-[#D7FF00] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-[#62695D]/40 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="border-[#62695D] text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              className="text-xs"
            >
              Save Milestone
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
