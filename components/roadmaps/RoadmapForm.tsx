"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  roadmapSchema,
  RoadmapInput,
  ROADMAP_CATEGORIES,
  ROADMAP_DIFFICULTIES,
} from "@/lib/validations/roadmap";
import { createRoadmapApi, updateRoadmapApi } from "@/services/api";
import { IRoadmap } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { toast } from "sonner";
import { Tag, Sparkles, ArrowLeft, X } from "lucide-react";
import Link from "next/link";

interface RoadmapFormProps {
  initialData?: IRoadmap;
  isEdit?: boolean;
}

const COMMON_EMOJIS = ["🚀", "⚡", "🧠", "💻", "📊", "⚙️", "📱", "🌐", "🔒", "🎨", "🛠️", "🤖"];

export function RoadmapForm({ initialData, isEdit = false }: RoadmapFormProps) {
  const router = useRouter();
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [selectedIcon, setSelectedIcon] = useState<string>(initialData?.icon || "🚀");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RoadmapInput>({
    resolver: zodResolver(roadmapSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      category: initialData?.category || "Web Development",
      difficulty: initialData?.difficulty || "Beginner",
      estimatedDuration: initialData?.estimatedDuration || "6 weeks",
      icon: initialData?.icon || "🚀",
      tags: initialData?.tags || [],
      totalTopics: initialData?.totalTopics || 10,
      completedTopics: initialData?.completedTopics || 0,
    },
  });

  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter") return;
    e.preventDefault();

    const cleanTag = tagInput.trim().replace(/^#/, "");
    if (cleanTag && !tags.includes(cleanTag)) {
      const updated = [...tags, cleanTag];
      setTags(updated);
      setValue("tags", updated);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updated = tags.filter((t) => t !== tagToRemove);
    setTags(updated);
    setValue("tags", updated);
  };

  const handleSelectIcon = (icon: string) => {
    setSelectedIcon(icon);
    setValue("icon", icon);
  };

  const onSubmit = async (values: RoadmapInput) => {
    setIsSubmitting(true);
    try {
      const payload: RoadmapInput = {
        ...values,
        icon: selectedIcon,
        tags,
      };

      if (isEdit && initialData) {
        await updateRoadmapApi(initialData._id, payload);
        toast.success("Roadmap updated successfully!");
        router.push(`/roadmaps/${initialData._id}`);
      } else {
        const created = await createRoadmapApi(payload);
        toast.success("Roadmap created successfully!");
        router.push(`/roadmaps/${created._id}`);
      }
      router.refresh();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to save roadmap";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Info Card */}
      <div className="space-y-5 rounded-xl border border-[#62695D] bg-[#252D26] p-6 shadow-sm">
        <div className="border-b border-[#62695D]/40 pb-3">
          <h3 className="flex items-center gap-2 font-mono text-base font-bold uppercase tracking-wide text-[#F3F0E6]">
            <Sparkles className="h-4 w-4 text-[#D7FF00]" />
            Roadmap Overview
          </h3>
          <p className="mt-0.5 text-xs text-[#B8B9AA]">
            Primary title, icon, and curriculum description
          </p>
        </div>

        {/* Cover Icon Picker */}
        <div>
          <label className="mb-1.5 block font-mono text-xs font-bold uppercase tracking-wider text-[#EDE8D8]">
            Cover Icon / Emoji
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {COMMON_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleSelectIcon(emoji)}
                className={`flex h-10 w-10 items-center justify-center rounded-lg border text-xl transition-all ${
                  selectedIcon === emoji
                    ? "scale-105 border-[#D7FF00] bg-[#2C352D] shadow-md shadow-[#D7FF00]/15"
                    : "border-[#62695D] bg-[#202720] text-[#F3F0E6] hover:bg-[#2C352D]"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="mb-1.5 block font-mono text-xs font-bold uppercase tracking-wider text-[#EDE8D8]">
            Roadmap Title <span className="text-[#D7FF00]">*</span>
          </label>
          <Input
            {...register("title")}
            placeholder="e.g., Full-Stack Next.js 14 Architect"
            error={errors.title?.message}
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-1.5 block font-mono text-xs font-bold uppercase tracking-wider text-[#EDE8D8]">
            Description
          </label>
          <Textarea
            {...register("description")}
            placeholder="Outline what skills, milestones, and concepts this roadmap covers..."
            rows={4}
            error={errors.description?.message}
          />
        </div>
      </div>

      {/* Categorization & Complexity Card */}
      <div className="space-y-5 rounded-xl border border-[#62695D] bg-[#252D26] p-6 shadow-sm">
        <div className="border-b border-[#62695D]/40 pb-3">
          <h3 className="font-mono text-base font-bold uppercase tracking-wide text-[#F3F0E6]">
            Curriculum Parameters
          </h3>
          <p className="mt-0.5 text-xs text-[#B8B9AA]">
            Category, estimated duration, and difficulty level
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Category */}
          <div>
            <label className="mb-1.5 block font-mono text-xs font-bold uppercase tracking-wider text-[#EDE8D8]">
              Category <span className="text-[#D7FF00]">*</span>
            </label>
            <Select {...register("category")} error={errors.category?.message}>
              {ROADMAP_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="mb-1.5 block font-mono text-xs font-bold uppercase tracking-wider text-[#EDE8D8]">
              Difficulty Level <span className="text-[#D7FF00]">*</span>
            </label>
            <Select {...register("difficulty")} error={errors.difficulty?.message}>
              {ROADMAP_DIFFICULTIES.map((diff) => (
                <option key={diff} value={diff}>
                  {diff}
                </option>
              ))}
            </Select>
          </div>

          {/* Estimated Duration */}
          <div>
            <label className="mb-1.5 block font-mono text-xs font-bold uppercase tracking-wider text-[#EDE8D8]">
              Estimated Duration <span className="text-[#D7FF00]">*</span>
            </label>
            <Input
              {...register("estimatedDuration")}
              placeholder="e.g., 8 weeks, 3 months"
              error={errors.estimatedDuration?.message}
            />
          </div>
        </div>

        {/* Topics Count (Total & Completed) */}
        <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block font-mono text-xs font-bold uppercase tracking-wider text-[#EDE8D8]">
              Total Planned Topics / Modules
            </label>
            <Input
              type="number"
              min={0}
              {...register("totalTopics")}
              placeholder="e.g., 20"
              error={errors.totalTopics?.message}
            />
          </div>

          <div>
            <label className="mb-1.5 block font-mono text-xs font-bold uppercase tracking-wider text-[#EDE8D8]">
              Completed Topics (Initial Progress)
            </label>
            <Input
              type="number"
              min={0}
              {...register("completedTopics")}
              placeholder="e.g., 5"
              error={errors.completedTopics?.message}
            />
          </div>
        </div>
      </div>

      {/* Tags Card */}
      <div className="space-y-4 rounded-xl border border-[#62695D] bg-[#252D26] p-6 shadow-sm">
        <div>
          <h3 className="flex items-center gap-2 font-mono text-base font-bold uppercase tracking-wide text-[#F3F0E6]">
            <Tag className="h-4 w-4 text-[#D7FF00]" />
            Tags &amp; Keywords
          </h3>
          <p className="mt-0.5 text-xs text-[#B8B9AA]">
            Add relevant technology or domain tags for quick filtering
          </p>
        </div>

        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="Type a tag (e.g., Docker, GraphQL, PyTorch) and press Enter"
            className="flex-1"
          />
          <Button type="button" variant="secondary" size="md" onClick={handleAddTag}>
            Add Tag
          </Button>
        </div>

        {/* Active Tags list */}
        {tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#62695D] bg-[#202720] px-3 py-1 font-mono text-xs text-[#D7FF00]"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-0.5 text-[#B8B9AA] transition-colors hover:text-red-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-4">
        <Link href={isEdit && initialData ? `/roadmaps/${initialData._id}` : "/roadmaps"}>
          <Button type="button" variant="outline" size="md">
            <ArrowLeft className="h-4 w-4" />
            Cancel
          </Button>
        </Link>

        <Button type="submit" variant="primary" size="lg" isLoading={isSubmitting}>
          {isEdit ? "Save Changes" : "Create Roadmap"}
        </Button>
      </div>
    </form>
  );
}
