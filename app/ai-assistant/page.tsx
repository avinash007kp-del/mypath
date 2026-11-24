"use client";

import React, { Suspense } from "react";
import { TectonicAIAssistantView } from "@/components/ai/TectonicAIAssistantView";

export default function AIAssistantPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center gap-2 bg-surface font-mono text-xs text-outline">
          <span className="material-symbols-outlined animate-spin text-[20px] text-secondary">
            progress_activity
          </span>
          <span>INITIALIZING PATHFINDER AI ENGINE...</span>
        </div>
      }
    >
      <TectonicAIAssistantView />
    </Suspense>
  );
}
