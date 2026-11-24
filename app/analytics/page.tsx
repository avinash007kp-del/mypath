"use client";

import React from "react";
import { TectonicAnalyticsView } from "@/components/analytics/TectonicAnalyticsView";

export default function AnalyticsDashboardPage() {
  return (
    <div className="flex w-full flex-col">
      <TectonicAnalyticsView />
    </div>
  );
}
