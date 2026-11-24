"use client";

import React from "react";
import Link from "next/link";
import { IRoadmap } from "@/types";

interface FeaturedRoadmapSectionProps {
  roadmap?: IRoadmap | null;
}

export function FeaturedRoadmapSection({ roadmap }: FeaturedRoadmapSectionProps) {
  if (!roadmap) {
    return (
      <section className="flex w-full flex-col gap-space-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <span className="h-2 w-2 bg-outline" />
            <h2 className="font-headline-sm text-headline-sm uppercase tracking-tight text-on-surface">
              CONTINUE EXECUTION // CURRENT SESSION
            </h2>
          </div>
          <span className="hidden font-label-sm text-label-sm uppercase text-outline sm:inline-block">
            STATUS: STANDBY
          </span>
        </div>

        <div className="relative rounded-DEFAULT border border-outline-variant/30 bg-surface-container p-space-lg shadow-[4px_4px_0px_0px_#1e5128] lg:p-space-xl">
          <div className="flex max-w-2xl flex-col items-start gap-space-md">
            <span className="bg-surface-container-high px-space-xs py-0.5 font-label-sm text-label-sm uppercase text-tertiary">
              // NO ACTIVE CURRICULUM ALLOCATED
            </span>
            <h3 className="font-headline-md text-headline-md uppercase tracking-tight text-on-surface">
              INITIALIZE YOUR FIRST ROADMAP
            </h3>
            <p className="font-body-md text-body-md leading-relaxed text-on-surface-variant">
              Design a custom engineering syllabus or generate a tailored learning pathway with AI
              to begin recording verified focus intervals and topic mastery.
            </p>
            <div className="flex flex-wrap items-center gap-space-sm pt-space-xs">
              <Link
                href="/roadmaps/create"
                className="flex items-center gap-space-xs rounded-DEFAULT bg-tertiary-fixed px-space-lg py-space-sm font-label-md text-label-md uppercase tracking-wider text-on-tertiary-fixed shadow-[2px_2px_0px_0px_#1e5128] transition-all hover:bg-secondary hover:text-on-secondary"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                <span>CREATE ROADMAP</span>
              </Link>
              <Link
                href="/ai-assistant/roadmap-generator"
                className="flex items-center gap-space-xs rounded-DEFAULT bg-surface-container-high px-space-md py-space-sm font-label-md text-label-md uppercase tracking-wider text-secondary transition-colors hover:text-on-surface"
              >
                <span>GENERATE WITH AI</span>
                <span className="material-symbols-outlined text-sm">auto_awesome</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const title = roadmap.title;
  const progress = roadmap.progress ?? 0;
  const roadmapId = roadmap._id;
  const resumeHref = `/roadmaps/${roadmapId}/editor`;
  const timelineHref = `/roadmaps/${roadmapId}`;
  const totalTopics = roadmap.totalTopics || 0;
  const completedTopics = roadmap.completedTopics || 0;

  return (
    <section className="flex w-full flex-col gap-space-md">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-space-sm">
          <span className="h-2 w-2 bg-secondary" />
          <h2 className="font-headline-sm text-headline-sm uppercase tracking-tight text-on-surface">
            CONTINUE EXECUTION // CURRENT SESSION
          </h2>
        </div>
        <span className="hidden font-label-sm text-label-sm uppercase text-outline sm:inline-block">
          STATUS: ACTIVE TRACK
        </span>
      </div>

      {/* Featured Roadmap Container with hard-edge brutalist shadow */}
      <div className="relative rounded-DEFAULT border border-outline-variant/30 bg-surface-container-high p-space-lg shadow-[4px_4px_0px_0px_#1e5128] lg:p-space-xl">
        <div className="grid grid-cols-1 items-center gap-space-lg lg:grid-cols-12">
          {/* Roadmap Overview & Identity (7 Cols) */}
          <div className="flex flex-col gap-space-md lg:col-span-7">
            <div className="flex flex-wrap items-center gap-space-sm">
              <span className="bg-secondary px-space-xs py-0.5 font-label-sm text-label-sm font-bold uppercase text-on-secondary">
                PRIMARY TRACK
              </span>
              <span className="bg-surface-container px-space-xs py-0.5 font-label-sm text-label-sm uppercase text-tertiary">
                {roadmap.category || "GENERAL"}
              </span>
              <span className="font-label-sm text-label-sm uppercase text-outline">
                {completedTopics}/{totalTopics} TOPICS COMPLETED
              </span>
            </div>

            <div>
              <h3 className="font-headline-lg text-headline-lg uppercase tracking-tight text-on-surface">
                {title}
              </h3>
              <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
                {roadmap.description || "Active engineering curriculum and focus pathway."}
              </p>
            </div>

            <div className="flex flex-col gap-space-xs rounded-DEFAULT border border-outline-variant/20 bg-surface-container-lowest p-space-md">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
                CURRICULUM SPEC
              </span>
              <p className="font-body-sm text-body-sm text-on-surface">
                {roadmap.estimatedDuration
                  ? `Duration: ${roadmap.estimatedDuration}`
                  : "Self-paced deliberate practice"}
                {roadmap.difficulty ? ` // Level: ${roadmap.difficulty}` : ""}
              </p>
            </div>
          </div>

          {/* Metrics & Progression HUD (5 Cols) */}
          <div className="flex flex-col gap-space-lg border-t border-outline-variant/30 pt-space-lg lg:col-span-5 lg:border-l lg:border-t-0 lg:pl-space-xl lg:pt-0">
            {/* Numeric Big Display */}
            <div className="flex items-baseline justify-between">
              <div className="flex flex-col">
                <span className="font-headline-xl text-headline-xl font-bold tracking-tight text-on-surface">
                  {progress}%
                </span>
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
                  TOTAL PATHWAY COMPLETED
                </span>
              </div>
              <div className="text-right">
                <span className="font-label-lg text-label-lg uppercase text-secondary">
                  [{completedTopics} OF {totalTopics}]
                </span>
                <p className="font-label-sm text-label-sm text-outline">TOPICS</p>
              </div>
            </div>

            {/* Stepped Progress Meter */}
            <div className="flex h-3 w-full gap-1 overflow-hidden bg-surface-container-lowest p-0.5">
              {Array.from({ length: 10 }).map((_, i) => {
                const stepThreshold = (i + 1) * 10;
                const isComplete = progress >= stepThreshold;
                const isCurrent = progress >= stepThreshold - 10 && progress < stepThreshold;
                return (
                  <div
                    key={i}
                    className={`h-full flex-1 transition-all ${
                      isComplete
                        ? "bg-secondary"
                        : isCurrent
                          ? "animate-pulse bg-tertiary-fixed"
                          : "bg-surface-container"
                    }`}
                  />
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-space-sm pt-space-xs">
              <Link
                href={resumeHref}
                className="flex flex-1 items-center justify-center gap-space-xs rounded-DEFAULT bg-tertiary-fixed py-space-sm font-label-md text-label-md uppercase tracking-wider text-on-tertiary-fixed shadow-[2px_2px_0px_0px_#1e5128] transition-all hover:bg-secondary hover:text-on-secondary active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                <span>RESUME GRAPH</span>
                <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
              </Link>

              <Link
                href={timelineHref}
                className="flex items-center justify-center rounded-DEFAULT border border-outline px-space-md py-space-sm font-label-md text-label-md uppercase tracking-wider text-on-surface transition-colors hover:bg-surface-container"
              >
                <span>VIEW SYLLABUS</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
