"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit2 } from "lucide-react";
import { IRoadmap } from "@/types";
import { fetchRoadmapById } from "@/services/api";
import { RoadmapForm } from "@/components/roadmaps/RoadmapForm";
import { Skeleton } from "@/components/ui/Skeleton";
import { toast } from "sonner";

export default function EditRoadmapPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [roadmap, setRoadmap] = useState<IRoadmap | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadRoadmap = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await fetchRoadmapById(id);
      setRoadmap(data);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to load roadmap";
      toast.error(errorMsg);
      router.push("/roadmaps");
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    loadRoadmap();
  }, [loadRoadmap]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 pb-16">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-10 w-64" />
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!roadmap) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-16">
      <div className="border-b border-[#62695D]/40 pb-4">
        <Link
          href={`/roadmaps/${roadmap._id}`}
          className="mb-3 inline-flex items-center gap-1.5 font-mono text-xs text-[#B8B9AA] transition-colors hover:text-[#D7FF00]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Roadmap Details
        </Link>
        <h2 className="flex items-center gap-2.5 text-3xl font-black tracking-tight text-[#F3F0E6]">
          <Edit2 className="h-7 w-7 text-[#D7FF00]" />
          Edit Roadmap: {roadmap.title}
        </h2>
        <p className="mt-1 text-xs text-[#B8B9AA] md:text-sm">
          Update the roadmap parameters, title, description, and milestones. Changes persist
          immediately to MongoDB.
        </p>
      </div>

      <RoadmapForm initialData={roadmap} isEdit={true} />
    </div>
  );
}
