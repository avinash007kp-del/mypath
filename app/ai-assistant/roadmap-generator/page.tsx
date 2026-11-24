"use client";

import React from "react";
import { AIAssistantLayout } from "@/components/ai/AIAssistantLayout";
import { RoadmapGenerator } from "@/components/ai/RoadmapGenerator";

export default function RoadmapGeneratorPage() {
  return (
    <AIAssistantLayout>
      <div className="flex-1 overflow-y-auto">
        <RoadmapGenerator />
      </div>
    </AIAssistantLayout>
  );
}
