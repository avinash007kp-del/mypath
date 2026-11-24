"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  useReactFlow,
  Viewport,
} from "@xyflow/react";
import { toPng } from "html-to-image";
import { RoadmapToolbar } from "./RoadmapToolbar";
import { NodeLibrary } from "./NodeLibrary";
import { NodeInspector } from "./NodeInspector";
import { RoadmapCanvas } from "./RoadmapCanvas";
import { DeleteNodeDialog } from "./dialogs/DeleteNodeDialog";
import { TemplateModal } from "./dialogs/TemplateModal";
import { ShortcutsModal } from "./dialogs/ShortcutsModal";
import { RoadmapTemplate } from "./templates";
import { useAutoSave } from "./hooks/useAutoSave";
import { useRoadmapHistory } from "./hooks/useRoadmapHistory";
import { fetchRoadmapGraph, updateRoadmapApi } from "@/services/api";
import { IRoadmapNode, RoadmapNodeType, RoadmapGraphData } from "@/types/roadmap";
import { IRoadmap } from "@/types";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface RoadmapEditorProps {
  roadmapId: string;
}

function EditorInner({ roadmapId }: RoadmapEditorProps) {
  const reactFlowInstance = useReactFlow();
  const reactFlowWrapperRef = useRef<HTMLDivElement>(null);

  const [roadmap, setRoadmap] = useState<IRoadmap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Dialog states
  const [deleteTargetNodeId, setDeleteTargetNodeId] = useState<string | null>(null);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<IRoadmapNode>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // History hook
  const { recordSnapshot, undo, redo, canUndo, canRedo } = useRoadmapHistory(nodes, edges);

  // AutoSave hook
  const { saveStatus, scheduleSave, forceManualSave } = useAutoSave({
    roadmapId,
    onSaveSuccess: () => {
      // Clean save indicator
    },
    onSaveError: (err) => {
      toast.error(err.message || "Failed to save roadmap graph");
    },
  });

  // Load initial graph data from API
  const loadGraph = useCallback(async () => {
    setIsLoading(true);
    try {
      const data: RoadmapGraphData = await fetchRoadmapGraph(roadmapId);
      setRoadmap(data.roadmap);

      // Convert backend nodes to React Flow nodes
      const initialNodes: Node<IRoadmapNode>[] = data.nodes.map((n) => ({
        id: n._id,
        type: n.type,
        position: { x: n.positionX, y: n.positionY },
        data: n,
      }));

      // Convert backend edges to React Flow edges
      const initialEdges: Edge[] = data.edges.map((e) => ({
        id: e._id || `e-${e.sourceNodeId}-${e.targetNodeId}`,
        source: e.sourceNodeId,
        target: e.targetNodeId,
        label: e.label || undefined,
        type: e.type || "smoothstep",
        animated: e.animated || false,
      }));

      setNodes(initialNodes);
      setEdges(initialEdges);

      // Restore viewport after slight delay to allow canvas render
      if (data.viewport && reactFlowInstance) {
        setTimeout(() => {
          reactFlowInstance.setViewport({
            x: data.viewport!.x,
            y: data.viewport!.y,
            zoom: data.viewport!.zoom,
          });
        }, 80);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to load roadmap graph";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [roadmapId, reactFlowInstance, setNodes, setEdges]);

  useEffect(() => {
    loadGraph();
  }, [loadGraph]);

  // Selected node object
  const selectedNode = selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) || null : null;

  // Prerequisite titles for selected node
  const prerequisiteTitles = selectedNode
    ? edges
        .filter((e) => e.target === selectedNode.id)
        .map((e) => {
          const sourceNode = nodes.find((n) => n.id === e.source);
          return sourceNode?.data?.title || "Prerequisite Topic";
        })
    : [];

  // Update roadmap title in header
  const handleTitleChange = async (newTitle: string) => {
    if (!roadmap) return;
    try {
      const updated = await updateRoadmapApi(roadmapId, { title: newTitle });
      setRoadmap((prev) => (prev ? { ...prev, title: updated.title } : null));
      toast.success("Roadmap title updated");
    } catch (err: unknown) {
      toast.error("Failed to rename roadmap");
    }
  };

  // Connect handler with cycle detection
  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;

      if (connection.source === connection.target) {
        toast.error("A topic node cannot connect to itself.");
        return;
      }

      // Check if duplicate connection exists
      const isDuplicate = edges.some(
        (e) => e.source === connection.source && e.target === connection.target
      );
      if (isDuplicate) {
        toast.info("These nodes are already connected.");
        return;
      }

      // Cycle detection: Can connection.target already reach connection.source?
      const targetCanReachSource = (
        start: string,
        goal: string,
        visited = new Set<string>()
      ): boolean => {
        if (start === goal) return true;
        visited.add(start);

        const neighbors = edges.filter((e) => e.source === start).map((e) => e.target);

        for (const next of neighbors) {
          if (!visited.has(next)) {
            if (targetCanReachSource(next, goal, visited)) return true;
          }
        }
        return false;
      };

      if (targetCanReachSource(connection.target, connection.source)) {
        toast.error("Circular dependency prevented: prerequisite connections cannot loop.");
        return;
      }

      recordSnapshot(nodes, edges);

      const newEdge: Edge = {
        id: `e-${connection.source}-${connection.target}-${Date.now()}`,
        source: connection.source,
        target: connection.target,
        type: "smoothstep",
        animated: false,
      };

      const updatedEdges = addEdge(newEdge, edges);
      setEdges(updatedEdges);
      scheduleSave(nodes, updatedEdges, reactFlowInstance.getViewport());
    },
    [edges, nodes, recordSnapshot, setEdges, scheduleSave, reactFlowInstance]
  );

  // Add node at exact canvas coordinates
  const handleAddNodeAtPosition = useCallback(
    (type: RoadmapNodeType, position: { x: number; y: number }) => {
      recordSnapshot(nodes, edges);

      const newId = `node_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const defaultTitles: Record<RoadmapNodeType, string> = {
        topic: "New Topic Concept",
        subtopic: "New Subtopic Task",
        milestone: "Major Milestone Goal",
        project: "New Hands-on Project",
        resource: "Official Documentation",
        assessment: "Knowledge Verification Quiz",
      };

      const newNodeData: IRoadmapNode = {
        _id: newId,
        roadmapId,
        type,
        title: defaultTitles[type] || "New Learning Node",
        description: "",
        category: roadmap?.category || "General",
        difficulty: "Beginner",
        estimatedHours: type === "project" ? 10 : type === "milestone" ? 8 : 2,
        status: "Not Started",
        priority: "Medium",
        positionX: Math.round(position.x),
        positionY: Math.round(position.y),
        metadata: {},
      };

      const newNode: Node<IRoadmapNode> = {
        id: newId,
        type,
        position,
        data: newNodeData,
      };

      const updatedNodes = [...nodes, newNode];
      setNodes(updatedNodes);
      setSelectedNodeId(newId);
      scheduleSave(updatedNodes, edges, reactFlowInstance.getViewport());
    },
    [nodes, edges, recordSnapshot, roadmap, roadmapId, setNodes, scheduleSave, reactFlowInstance]
  );

  // Quick add button in library (adds in canvas center)
  const handleQuickAdd = useCallback(
    (type: RoadmapNodeType) => {
      const center = reactFlowInstance.screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
      // Offset slightly if nodes already exist
      const offsetPos = {
        x: center.x - 120 + (nodes.length % 5) * 20,
        y: center.y - 60 + (nodes.length % 5) * 20,
      };
      handleAddNodeAtPosition(type, offsetPos);
    },
    [reactFlowInstance, nodes.length, handleAddNodeAtPosition]
  );

  // Update node properties from Inspector
  const handleUpdateNodeData = useCallback(
    (nodeId: string, partialData: Partial<IRoadmapNode>) => {
      recordSnapshot(nodes, edges);

      const updatedNodes = nodes.map((n) => {
        if (n.id === nodeId) {
          const mergedData = { ...n.data, ...partialData };
          return {
            ...n,
            type: partialData.type || n.type,
            data: mergedData,
          };
        }
        return n;
      });

      setNodes(updatedNodes);
      scheduleSave(updatedNodes, edges, reactFlowInstance.getViewport());
    },
    [nodes, edges, recordSnapshot, setNodes, scheduleSave, reactFlowInstance]
  );

  // Duplicate node
  const handleDuplicateNode = useCallback(
    (nodeToDup: Node<IRoadmapNode>) => {
      recordSnapshot(nodes, edges);

      const newId = `node_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const duplicatedNode: Node<IRoadmapNode> = {
        id: newId,
        type: nodeToDup.type,
        position: {
          x: nodeToDup.position.x + 40,
          y: nodeToDup.position.y + 40,
        },
        data: {
          ...nodeToDup.data,
          _id: newId,
          title: `${nodeToDup.data.title} (Copy)`,
        },
      };

      const updatedNodes = [...nodes, duplicatedNode];
      setNodes(updatedNodes);
      setSelectedNodeId(newId);
      scheduleSave(updatedNodes, edges, reactFlowInstance.getViewport());
      toast.success("Node duplicated");
    },
    [nodes, edges, recordSnapshot, setNodes, scheduleSave, reactFlowInstance]
  );

  // Delete node trigger
  const handleDeleteNode = useCallback((nodeId: string) => {
    setDeleteTargetNodeId(nodeId);
  }, []);

  // Confirm delete node
  const confirmDeleteNode = useCallback(() => {
    if (!deleteTargetNodeId) return;

    recordSnapshot(nodes, edges);

    const updatedNodes = nodes.filter((n) => n.id !== deleteTargetNodeId);
    const updatedEdges = edges.filter(
      (e) => e.source !== deleteTargetNodeId && e.target !== deleteTargetNodeId
    );

    setNodes(updatedNodes);
    setEdges(updatedEdges);
    if (selectedNodeId === deleteTargetNodeId) {
      setSelectedNodeId(null);
    }
    setDeleteTargetNodeId(null);

    scheduleSave(updatedNodes, updatedEdges, reactFlowInstance.getViewport());
    toast.success("Node and connected relationships deleted");
  }, [
    deleteTargetNodeId,
    nodes,
    edges,
    selectedNodeId,
    recordSnapshot,
    setNodes,
    setEdges,
    scheduleSave,
    reactFlowInstance,
  ]);

  // Delete individual edge
  const handleDeleteEdge = useCallback(
    (edgeId: string) => {
      recordSnapshot(nodes, edges);
      const updatedEdges = edges.filter((e) => e.id !== edgeId);
      setEdges(updatedEdges);
      scheduleSave(nodes, updatedEdges, reactFlowInstance.getViewport());
      toast.success("Connection removed");
    },
    [nodes, edges, recordSnapshot, setEdges, scheduleSave, reactFlowInstance]
  );

  // Auto layout algorithm
  const handleAutoLayout = useCallback(() => {
    if (nodes.length === 0) return;

    recordSnapshot(nodes, edges);

    // Build adjacency and in-degree maps
    const adj = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    nodes.forEach((n) => {
      adj.set(n.id, []);
      inDegree.set(n.id, 0);
    });

    edges.forEach((e) => {
      if (adj.has(e.source) && inDegree.has(e.target)) {
        adj.get(e.source)!.push(e.target);
        inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
      }
    });

    // Compute topological depth levels
    const levels = new Map<string, number>();
    const queue: string[] = [];

    // Roots
    nodes.forEach((n) => {
      if ((inDegree.get(n.id) || 0) === 0) {
        levels.set(n.id, 0);
        queue.push(n.id);
      }
    });

    // In case of disconnected graph, set missing nodes to level 0
    nodes.forEach((n) => {
      if (!levels.has(n.id)) {
        levels.set(n.id, 0);
      }
    });

    // BFS compute levels
    while (queue.length > 0) {
      const u = queue.shift()!;
      const uLevel = levels.get(u) || 0;
      const neighbors = adj.get(u) || [];

      for (const v of neighbors) {
        const vLevel = levels.get(v) || 0;
        if (uLevel + 1 > vLevel) {
          levels.set(v, uLevel + 1);
          queue.push(v);
        }
      }
    }

    // Group nodes by level
    const levelGroups = new Map<number, Node<IRoadmapNode>[]>();
    nodes.forEach((n) => {
      const lvl = levels.get(n.id) || 0;
      if (!levelGroups.has(lvl)) levelGroups.set(lvl, []);
      levelGroups.get(lvl)!.push(n);
    });

    // Layout coordinates
    const layoutNodes = nodes.map((n) => {
      const lvl = levels.get(n.id) || 0;
      const group = levelGroups.get(lvl) || [n];
      const indexInGroup = group.findIndex((gn) => gn.id === n.id);
      const totalInGroup = group.length;

      const x = 200 + (indexInGroup - (totalInGroup - 1) / 2) * 300;
      const y = 80 + lvl * 180;

      return {
        ...n,
        position: { x, y },
      };
    });

    setNodes(layoutNodes);
    scheduleSave(layoutNodes, edges, reactFlowInstance.getViewport());

    setTimeout(() => {
      reactFlowInstance.fitView({ padding: 0.2, duration: 400 });
    }, 50);

    toast.success("Auto layout applied");
  }, [nodes, edges, recordSnapshot, setNodes, scheduleSave, reactFlowInstance]);

  // Export to PNG Image
  const handleExportPng = useCallback(async () => {
    if (!reactFlowWrapperRef.current) return;
    try {
      const toastId = toast.loading("Generating roadmap PNG...");

      // Select inner viewport element to capture full nodes
      const element = reactFlowWrapperRef.current.querySelector(
        ".react-flow__viewport"
      ) as HTMLElement;

      if (!element) {
        toast.dismiss(toastId);
        toast.error("Could not find canvas viewport to export");
        return;
      }

      const dataUrl = await toPng(reactFlowWrapperRef.current, {
        backgroundColor: "#1B211C",
        quality: 0.95,
      });

      const a = document.createElement("a");
      a.setAttribute(
        "download",
        `${roadmap?.title ? roadmap.title.replace(/\s+/g, "_") : "MyPath_Roadmap"}.png`
      );
      a.setAttribute("href", dataUrl);
      a.click();

      toast.dismiss(toastId);
      toast.success("Roadmap PNG exported successfully");
    } catch (err) {
      toast.error("Failed to export PNG");
    }
  }, [roadmap]);

  // Export to JSON
  const handleExportJson = useCallback(() => {
    if (!roadmap) return;
    const exportData = {
      roadmapTitle: roadmap.title,
      category: roadmap.category,
      difficulty: roadmap.difficulty,
      exportedAt: new Date().toISOString(),
      version: "2.0",
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.data.type,
        title: n.data.title,
        description: n.data.description,
        status: n.data.status,
        difficulty: n.data.difficulty,
        estimatedHours: n.data.estimatedHours,
        priority: n.data.priority,
        position: n.position,
        metadata: n.data.metadata,
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: e.type,
        label: e.label,
        animated: e.animated,
      })),
      viewport: reactFlowInstance.getViewport(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${roadmap.title.replace(/\s+/g, "_")}_roadmap.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Roadmap JSON exported");
  }, [roadmap, nodes, edges, reactFlowInstance]);

  // Apply template
  const handleApplyTemplate = useCallback(
    (template: RoadmapTemplate | null) => {
      recordSnapshot(nodes, edges);

      if (!template) {
        // Blank Canvas
        setNodes([]);
        setEdges([]);
        setSelectedNodeId(null);
        scheduleSave([], [], { x: 0, y: 0, zoom: 1 });
        setTemplateModalOpen(false);
        toast.success("Canvas reset to blank");
        return;
      }

      // Populate template nodes and edges
      const newNodes: Node<IRoadmapNode>[] = template.nodes.map((n) => ({
        id: n.id,
        type: n.type,
        position: { x: n.positionX, y: n.positionY },
        data: {
          _id: n.id,
          roadmapId,
          type: n.type,
          title: n.title,
          description: n.description,
          category: n.category,
          difficulty: n.difficulty,
          estimatedHours: n.estimatedHours,
          status: n.status,
          priority: n.priority,
          positionX: n.positionX,
          positionY: n.positionY,
          metadata: n.metadata || {},
        },
      }));

      const newEdges: Edge[] = template.edges.map((e) => ({
        id: e.id,
        source: e.sourceNodeId,
        target: e.targetNodeId,
        label: e.label,
        type: e.type || "smoothstep",
        animated: e.animated || false,
      }));

      setNodes(newNodes);
      setEdges(newEdges);
      setSelectedNodeId(null);
      setTemplateModalOpen(false);

      scheduleSave(newNodes, newEdges, reactFlowInstance.getViewport());

      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.2, duration: 400 });
      }, 60);

      toast.success(`Template "${template.name}" applied!`);
    },
    [nodes, edges, recordSnapshot, roadmapId, setNodes, setEdges, scheduleSave, reactFlowInstance]
  );

  // Global Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input, textarea or select
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement instanceof HTMLSelectElement;

      if (isInputFocused) return;

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      // Save (Ctrl/Cmd + S)
      if (modifier && e.key.toLowerCase() === "s") {
        e.preventDefault();
        forceManualSave(nodes, edges, reactFlowInstance.getViewport());
        toast.success("Roadmap saved!");
        return;
      }

      // Undo (Ctrl/Cmd + Z without shift)
      if (modifier && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        undo(setNodes, setEdges);
        return;
      }

      // Redo (Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y)
      if (
        (modifier && e.shiftKey && e.key.toLowerCase() === "z") ||
        (modifier && e.key.toLowerCase() === "y")
      ) {
        e.preventDefault();
        redo(setNodes, setEdges);
        return;
      }

      // Duplicate (Ctrl/Cmd + D)
      if (modifier && e.key.toLowerCase() === "d") {
        e.preventDefault();
        if (selectedNode) {
          handleDuplicateNode(selectedNode);
        }
        return;
      }

      // Escape (Deselect)
      if (e.key === "Escape") {
        setSelectedNodeId(null);
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    nodes,
    edges,
    selectedNode,
    undo,
    redo,
    forceManualSave,
    handleDuplicateNode,
    reactFlowInstance,
    setNodes,
    setEdges,
  ]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#1B211C] text-[#F3F0E6]">
        <Loader2 className="mb-3 h-8 w-8 animate-spin text-[#D7FF00]" />
        <p className="font-mono text-sm font-semibold text-[#EDE8D8]">
          Loading Interactive Roadmap Engine...
        </p>
        <p className="mt-1 font-mono text-xs text-[#B8B9AA]">
          Restoring nodes, connections, and saved canvas viewport
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen select-none flex-col overflow-hidden bg-[#1B211C]">
      {/* Top Toolbar */}
      <RoadmapToolbar
        roadmapId={roadmapId}
        title={roadmap?.title || "My Roadmap"}
        onTitleChange={handleTitleChange}
        saveStatus={saveStatus}
        onManualSave={() => forceManualSave(nodes, edges, reactFlowInstance.getViewport())}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={() => undo(setNodes, setEdges)}
        onRedo={() => redo(setNodes, setEdges)}
        onZoomIn={() => reactFlowInstance.zoomIn({ duration: 250 })}
        onZoomOut={() => reactFlowInstance.zoomOut({ duration: 250 })}
        onFitView={() => reactFlowInstance.fitView({ padding: 0.2, duration: 400 })}
        onAutoLayout={handleAutoLayout}
        onExportPng={handleExportPng}
        onExportJson={handleExportJson}
        onOpenTemplates={() => setTemplateModalOpen(true)}
        onOpenShortcuts={() => setShortcutsModalOpen(true)}
      />

      {/* Main Workspace: Left Library + Center Canvas + Right Inspector */}
      <div className="flex h-[calc(100vh-3.5rem)] w-full flex-1 overflow-hidden">
        {/* Left: Node Library */}
        <NodeLibrary onQuickAddNode={handleQuickAdd} />

        {/* Center: React Flow Canvas */}
        <RoadmapCanvas
          nodes={nodes}
          edges={edges}
          onNodesChange={(changes) => {
            onNodesChange(changes);
            const hasStructuralChange = changes.some(
              (c) => (c.type === "position" && !c.dragging && c.position) || c.type === "remove"
            );
            if (hasStructuralChange) {
              scheduleSave(nodes, edges, reactFlowInstance.getViewport());
            }
          }}
          onEdgesChange={(changes) => {
            onEdgesChange(changes);
            const hasStructuralChange = changes.some((c) => c.type === "remove");
            if (hasStructuralChange) {
              scheduleSave(nodes, edges, reactFlowInstance.getViewport());
            }
          }}
          onConnect={onConnect}
          onNodeSelect={(node) => setSelectedNodeId(node?.id || null)}
          onAddNodeAtPosition={handleAddNodeAtPosition}
          onDeleteEdge={handleDeleteEdge}
          onViewportChange={() => {
            scheduleSave(nodes, edges, reactFlowInstance.getViewport());
          }}
          reactFlowWrapperRef={reactFlowWrapperRef}
        />

        {/* Right: Node Inspector */}
        <NodeInspector
          selectedNode={selectedNode}
          roadmap={roadmap}
          prerequisiteTitles={prerequisiteTitles}
          onUpdateNodeData={handleUpdateNodeData}
          onDuplicateNode={handleDuplicateNode}
          onDeleteNode={handleDeleteNode}
          onDeselect={() => setSelectedNodeId(null)}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteNodeDialog
        isOpen={deleteTargetNodeId !== null}
        onClose={() => setDeleteTargetNodeId(null)}
        onConfirm={confirmDeleteNode}
        nodeTitle={nodes.find((n) => n.id === deleteTargetNodeId)?.data?.title}
      />

      {/* Templates Modal */}
      <TemplateModal
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        onSelectTemplate={handleApplyTemplate}
        hasExistingNodes={nodes.length > 0}
      />

      {/* Keyboard Shortcuts Modal */}
      <ShortcutsModal isOpen={shortcutsModalOpen} onClose={() => setShortcutsModalOpen(false)} />
    </div>
  );
}

export function RoadmapEditor({ roadmapId }: RoadmapEditorProps) {
  return (
    <ReactFlowProvider>
      <EditorInner roadmapId={roadmapId} />
    </ReactFlowProvider>
  );
}
