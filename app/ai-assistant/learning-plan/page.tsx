"use client";

import React from "react";
import { AIAssistantLayout } from "@/components/ai/AIAssistantLayout";
import { LearningPlanView } from "@/components/ai/LearningPlanView";

export default function LearningPlanPage() {
  return (
    <AIAssistantLayout>
      <div className="flex-1 overflow-y-auto">
        <LearningPlanView />
      </div>
    </AIAssistantLayout>
  );
}
