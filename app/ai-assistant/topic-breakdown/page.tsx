"use client";

import React, { Suspense } from "react";
import { AIAssistantLayout } from "@/components/ai/AIAssistantLayout";
import { TopicBreakdownView } from "@/components/ai/TopicBreakdownView";
import { RefreshCw } from "lucide-react";

export default function TopicBreakdownPage() {
  return (
    <AIAssistantLayout>
      <div className="flex-1 overflow-y-auto">
        <Suspense
          fallback={
            <div className="flex items-center justify-center gap-2 py-20 text-center font-mono text-xs text-[#B8B9AA]">
              <RefreshCw className="h-4 w-4 animate-spin text-[#D7FF00]" />
              <span>Loading breakdown assistant...</span>
            </div>
          }
        >
          <TopicBreakdownView />
        </Suspense>
      </div>
    </AIAssistantLayout>
  );
}
