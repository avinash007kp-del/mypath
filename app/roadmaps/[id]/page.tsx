"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Workflow, Edit2, Trash2, Share2 } from "lucide-react";
import { IRoadmap } from "@/types";
import { fetchRoadmapById, deleteRoadmapApi } from "@/services/api";
import { Dialog } from "@/components/ui/Dialog";
import { TectonicRoadmapView } from "@/components/roadmaps/TectonicRoadmapView";
import { toast } from "sonner";

export default function RoadmapDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [roadmap, setRoadmap] = useState<IRoadmap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const loadRoadmap = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await fetchRoadmapById(id);
      setRoadmap(data);
    } catch (err: unknown) {
      console.warn("Could not fetch roadmap details from API, using FSD template:", err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadRoadmap();
  }, [loadRoadmap]);

  const handleDelete = async () => {
    if (!roadmap) return;
    setIsDeleting(true);
    try {
      await deleteRoadmapApi(roadmap._id);
      toast.success("Roadmap deleted successfully");
      router.push("/roadmaps");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to delete roadmap";
      toast.error(errorMsg);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Roadmap link copied to clipboard!");
    }
  };

  return (
    <div className="flex w-full flex-col">
      {/* Top Action Toolbar */}
      <div className="mx-auto mb-2 flex w-full max-w-7xl flex-wrap items-center justify-between gap-space-sm border-b border-outline-variant/20 px-gutter pb-space-xs pt-space-sm">
        <Link
          href="/roadmaps"
          className="inline-flex items-center gap-1.5 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant transition-colors hover:text-tertiary-fixed"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>ALL ROADMAPS</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {roadmap && (
            <Link href={`/roadmaps/${roadmap._id}/editor`}>
              <button className="flex cursor-pointer items-center gap-1 rounded-DEFAULT border border-secondary/40 bg-primary-container px-3 py-1 font-label-sm text-label-sm uppercase tracking-wider text-tertiary-fixed transition-colors hover:bg-secondary hover:text-on-secondary">
                <Workflow className="h-3.5 w-3.5" />
                <span>INTERACTIVE CANVAS</span>
              </button>
            </Link>
          )}

          <button
            onClick={handleShare}
            className="flex cursor-pointer items-center gap-1 rounded-DEFAULT border border-outline-variant/40 bg-surface-container px-3 py-1 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
            title="Share roadmap"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>SHARE</span>
          </button>

          {roadmap && (
            <>
              <Link href={`/roadmaps/${roadmap._id}/edit`}>
                <button className="flex cursor-pointer items-center gap-1 rounded-DEFAULT border border-outline-variant/40 bg-surface-container px-3 py-1 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface">
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>EDIT</span>
                </button>
              </Link>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex cursor-pointer items-center gap-1 rounded-DEFAULT border border-error/40 bg-error-container/30 px-3 py-1 font-label-sm text-label-sm uppercase tracking-wider text-error transition-colors hover:bg-error-container hover:text-on-error-container"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>DELETE</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tectonic Architectural Roadmap View */}
      <TectonicRoadmapView initialRoadmapId={id} />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && roadmap && (
        <Dialog
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Roadmap"
          description={`Are you sure you want to delete "${roadmap.title}"? All associated progress and topics will be permanently removed.`}
          confirmLabel={isDeleting ? "Deleting..." : "Delete Roadmap"}
          variant="danger"
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
