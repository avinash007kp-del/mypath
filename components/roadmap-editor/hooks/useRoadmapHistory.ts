"use client";

import { useState, useCallback, useRef } from "react";
import { Node, Edge } from "@xyflow/react";
import { IRoadmapNode } from "@/types/roadmap";

interface HistorySnapshot {
  nodes: Node<IRoadmapNode>[];
  edges: Edge[];
}

const MAX_HISTORY = 30;

export function useRoadmapHistory(initialNodes: Node<IRoadmapNode>[], initialEdges: Edge[]) {
  const [past, setPast] = useState<HistorySnapshot[]>([]);
  const [future, setFuture] = useState<HistorySnapshot[]>([]);

  // Snapshot ref to capture current state before an action
  const currentRef = useRef<HistorySnapshot>({
    nodes: initialNodes,
    edges: initialEdges,
  });

  const recordSnapshot = useCallback((nodes: Node<IRoadmapNode>[], edges: Edge[]) => {
    setPast((prev) => {
      const next = [...prev, currentRef.current];
      if (next.length > MAX_HISTORY) next.shift();
      return next;
    });
    setFuture([]);
    currentRef.current = { nodes, edges };
  }, []);

  const undo = useCallback(
    (setNodes: (nodes: Node<IRoadmapNode>[]) => void, setEdges: (edges: Edge[]) => void) => {
      setPast((prevPast) => {
        if (prevPast.length === 0) return prevPast;

        const previous = prevPast[prevPast.length - 1];
        const newPast = prevPast.slice(0, prevPast.length - 1);

        setFuture((prevFuture) => [currentRef.current, ...prevFuture]);
        currentRef.current = previous;

        setNodes(previous.nodes);
        setEdges(previous.edges);

        return newPast;
      });
    },
    []
  );

  const redo = useCallback(
    (setNodes: (nodes: Node<IRoadmapNode>[]) => void, setEdges: (edges: Edge[]) => void) => {
      setFuture((prevFuture) => {
        if (prevFuture.length === 0) return prevFuture;

        const next = prevFuture[0];
        const newFuture = prevFuture.slice(1);

        setPast((prevPast) => [...prevPast, currentRef.current]);
        currentRef.current = next;

        setNodes(next.nodes);
        setEdges(next.edges);

        return newFuture;
      });
    },
    []
  );

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  return {
    recordSnapshot,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
