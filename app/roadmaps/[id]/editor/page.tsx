import React from "react";
import { Metadata } from "next";
import { RoadmapEditor } from "@/components/roadmap-editor/RoadmapEditor";

interface EditorPageProps {
  params: {
    id: string;
  };
}

export const metadata: Metadata = {
  title: "Interactive Roadmap Editor – MyPath",
  description:
    "Visual node-based learning roadmap editor inspired by roadmap.sh. Drag, drop, connect milestones, and auto-save.",
};

export default function EditorPage({ params }: EditorPageProps) {
  return <RoadmapEditor roadmapId={params.id} />;
}
