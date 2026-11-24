"use client";

import React, { Suspense } from "react";
import { TectonicProfileView } from "@/components/profile/TectonicProfileView";

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center gap-2 bg-surface font-mono text-xs text-outline">
          <span className="material-symbols-outlined animate-spin text-[20px] text-secondary">
            progress_activity
          </span>
          <span>LOADING SCHOLAR PROFILE...</span>
        </div>
      }
    >
      <TectonicProfileView />
    </Suspense>
  );
}
