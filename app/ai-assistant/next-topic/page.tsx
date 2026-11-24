"use client";

import React from "react";
import { AIAssistantLayout } from "@/components/ai/AIAssistantLayout";
import { NextTopicRecommendation } from "@/components/ai/NextTopicRecommendation";

export default function NextTopicPage() {
  return (
    <AIAssistantLayout>
      <div className="flex-1 overflow-y-auto">
        <NextTopicRecommendation />
      </div>
    </AIAssistantLayout>
  );
}
