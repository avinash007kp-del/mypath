"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Node, Edge, Viewport } from "@xyflow/react";
import { IRoadmapNode, SaveStatus, GraphBatchSavePayload } from "@/types/roadmap";
import { saveRoadmapGraphBatch } from "@/services/api";

interface UseAutoSaveOptions {
  roadmapId: string;
  debounceMs?: number;
  onSaveSuccess?: () => void;
  onSaveError?: (error: Error) => void;
}

export function useAutoSave({
  roadmapId,
  debounceMs = 850,
  onSaveSuccess,
  onSaveError,
}: UseAutoSaveOptions) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("Saved");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef<boolean>(false);
  const pendingPayloadRef = useRef<GraphBatchSavePayload | null>(null);
  const requestVersionRef = useRef<number>(0);

  const performSave = useCallback(
    async (payload: GraphBatchSavePayload) => {
      const currentVersion = ++requestVersionRef.current;
      setSaveStatus("Saving...");
      isSavingRef.current = true;

      try {
        await saveRoadmapGraphBatch(roadmapId, payload);

        // Only mark "Saved" if no newer save request has been queued
        if (currentVersion === requestVersionRef.current) {
          setSaveStatus("Saved");
          isSavingRef.current = false;
          pendingPayloadRef.current = null;
          if (onSaveSuccess) onSaveSuccess();
        }
      } catch (err: unknown) {
        if (currentVersion === requestVersionRef.current) {
          setSaveStatus("Save failed");
          isSavingRef.current = false;
          const error = err instanceof Error ? err : new Error("Failed to save roadmap");
          if (onSaveError) onSaveError(error);
        }
      }
    },
    [roadmapId, onSaveSuccess, onSaveError]
  );

  const scheduleSave = useCallback(
    (nodes: Node<IRoadmapNode>[], edges: Edge[], viewport?: Viewport) => {
      setSaveStatus((prev) => (prev !== "Unsaved changes" ? "Unsaved changes" : prev));

      const payload: GraphBatchSavePayload = {
        nodes: nodes.map((n) => ({
          _id: n.id,
          type: n.data.type,
          title: n.data.title,
          description: n.data.description,
          category: n.data.category,
          difficulty: n.data.difficulty,
          estimatedHours: n.data.estimatedHours,
          status: n.data.status,
          priority: n.data.priority,
          positionX: Math.round(n.position.x),
          positionY: Math.round(n.position.y),
          metadata: n.data.metadata,
        })),
        edges: edges.map((e) => ({
          _id: e.id,
          sourceNodeId: e.source,
          targetNodeId: e.target,
          label: (e.label as string) || "",
          type: e.type || "smoothstep",
          animated: e.animated || false,
        })),
        viewport: viewport
          ? {
              x: Math.round(viewport.x),
              y: Math.round(viewport.y),
              zoom: Number(viewport.zoom.toFixed(2)),
            }
          : undefined,
      };

      pendingPayloadRef.current = payload;

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        performSave(payload);
      }, debounceMs);
    },
    [debounceMs, performSave]
  );

  const forceManualSave = useCallback(
    async (nodes: Node<IRoadmapNode>[], edges: Edge[], viewport?: Viewport) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      const payload: GraphBatchSavePayload = {
        nodes: nodes.map((n) => ({
          _id: n.id,
          type: n.data.type,
          title: n.data.title,
          description: n.data.description,
          category: n.data.category,
          difficulty: n.data.difficulty,
          estimatedHours: n.data.estimatedHours,
          status: n.data.status,
          priority: n.data.priority,
          positionX: Math.round(n.position.x),
          positionY: Math.round(n.position.y),
          metadata: n.data.metadata,
        })),
        edges: edges.map((e) => ({
          _id: e.id,
          sourceNodeId: e.source,
          targetNodeId: e.target,
          label: (e.label as string) || "",
          type: e.type || "smoothstep",
          animated: e.animated || false,
        })),
        viewport: viewport
          ? {
              x: Math.round(viewport.x),
              y: Math.round(viewport.y),
              zoom: Number(viewport.zoom.toFixed(2)),
            }
          : undefined,
      };

      await performSave(payload);
    },
    [performSave]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    saveStatus,
    scheduleSave,
    forceManualSave,
  };
}
