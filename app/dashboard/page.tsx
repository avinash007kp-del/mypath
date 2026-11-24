"use client";

import React, { useState, useEffect, useCallback } from "react";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { FeaturedRoadmapSection } from "@/components/dashboard/FeaturedRoadmapSection";
import { RecentRoadmaps } from "@/components/dashboard/RecentRoadmaps";
import { fetchDashboardStats, fetchRoadmaps } from "@/services/api";
import { DashboardStats, IRoadmap } from "@/types";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [roadmaps, setRoadmaps] = useState<IRoadmap[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingRoadmaps, setLoadingRoadmaps] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setError(null);

    // Fetch stats
    setLoadingStats(true);
    fetchDashboardStats()
      .then((data) => setStats(data))
      .catch((err) => {
        console.error("Failed to load stats:", err);
      })
      .finally(() => setLoadingStats(false));

    // Fetch recent roadmaps
    setLoadingRoadmaps(true);
    fetchRoadmaps({ sortBy: "updatedAt", order: "desc" })
      .then((data) => setRoadmaps(data))
      .catch((err: unknown) => {
        console.error("Failed to load roadmaps:", err);
        const msg = err instanceof Error ? err.message : "Error connecting to database";
        setError(msg);
      })
      .finally(() => setLoadingRoadmaps(false));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Featured roadmap: first active roadmap or null
  const featuredRoadmap = roadmaps && roadmaps.length > 0 ? roadmaps[0] : null;

  // Real data-driven efficiency rating based on topics
  const totalTopics = stats ? stats.topicsCompleted + stats.topicsInProgress : 0;
  const efficiencyRating =
    totalTopics > 0
      ? `${Math.round((stats!.topicsCompleted / totalTopics) * 100)}% ARCHIVED`
      : "0.0% ARCHIVED";

  return (
    <div className="flex w-full flex-col">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-space-xl px-gutter py-space-xl">
        {/* Database Connection Notice if connection fails */}
        {error && (
          <div className="flex items-start justify-between gap-3 rounded-DEFAULT border border-error/40 bg-error-container/20 p-space-md text-on-error-container">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-error" />
              <div>
                <h4 className="font-label-md text-label-md font-bold uppercase text-error">
                  Database Connectivity Notice
                </h4>
                <p className="mt-0.5 font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
                  {error}. Please verify that your MongoDB connection string is configured in{" "}
                  <code className="rounded bg-surface-container-lowest px-1 py-0.5 font-mono text-xs">
                    .env.local
                  </code>
                  .
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              className="shrink-0 border-error/40 text-error hover:bg-error/10"
            >
              <RefreshCw className="mr-1 h-3.5 w-3.5" />
              Retry
            </Button>
          </div>
        )}

        {/* SECTION 1: ASYMMETRIC HERO ARCHITECTURE */}
        <WelcomeHeader onDataRefresh={loadData} efficiencyRating={efficiencyRating} />

        {/* SECTION 2: LEARNING OVERVIEW (3 BOLD ARCHITECTURAL STAT CARDS) */}
        <StatsCards stats={stats} isLoading={loadingStats} />

        {/* SECTION 3: CONTINUE LEARNING (FEATURED ROADMAP CONTAINER) */}
        <FeaturedRoadmapSection roadmap={featuredRoadmap} />

        {/* SECTION 4: MY LEARNING PATHS (4-COLUMN ARCHITECTURAL GRID) */}
        <RecentRoadmaps roadmaps={roadmaps} isLoading={loadingRoadmaps} />

        {/* SECTION 5: ARCHITECTURAL FOOTER NOTE / AUDIT LOG */}
        <div className="flex w-full select-none flex-col items-center justify-between gap-space-sm rounded-DEFAULT border border-outline-variant/30 bg-surface-container-lowest p-space-md text-outline sm:flex-row">
          <div className="flex items-center gap-space-sm">
            <span className="h-2 w-2 rounded-DEFAULT bg-secondary" />
            <span className="font-label-sm text-label-sm uppercase">
              DATABASE SYNCED // ATLAS CLUSTER // STATUS: ONLINE
            </span>
          </div>
          <div className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
            MYPATH_SYSTEM_KERNEL // CORE_V2.6
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="mt-auto w-full select-none border-t border-outline-variant/30 bg-surface-container-lowest py-space-lg">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-space-md px-gutter text-center md:flex-row md:text-left">
          <div className="flex items-center gap-space-sm">
            <span className="h-1.5 w-1.5 rounded-DEFAULT bg-secondary" />
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
              MYPATH ARCHITECTURE // V2.6 // SYS.ONLINE
            </span>
          </div>
          <div className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
            © 2024 MYPATH ARCHITECTURAL SYSTEMS. ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>
    </div>
  );
}
