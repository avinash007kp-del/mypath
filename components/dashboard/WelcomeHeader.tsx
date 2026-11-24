"use client";

import React from "react";
import Link from "next/link";

interface WelcomeHeaderProps {
  onDataRefresh?: () => void;
  efficiencyRating?: string;
}

export function WelcomeHeader({ efficiencyRating = "94.2% ARCHIVED" }: WelcomeHeaderProps) {
  return (
    <section className="relative grid w-full grid-cols-1 items-end gap-space-lg lg:grid-cols-12">
      {/* Ambient structural grid coordinate watermark */}
      <div className="pointer-events-none absolute -top-8 right-0 hidden select-none opacity-20 md:block">
        <span className="font-label-lg text-label-lg tracking-widest text-outline">
          GRID // 12-COL // LAT.47.3769 // LON.08.5417
        </span>
      </div>

      {/* Left Column: Bold Typographic Statement (8 Cols) */}
      <div className="flex flex-col items-start gap-space-md lg:col-span-8">
        {/* Status Indicator Pill */}
        <div className="inline-flex items-center gap-space-xs rounded-DEFAULT bg-primary-container px-space-md py-space-xs">
          <span className="h-2 w-2 animate-pulse rounded-DEFAULT bg-tertiary-fixed" />
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-tertiary-fixed">
            LEARNING SYSTEM / 2026 // ACTIVE_INDEX
          </span>
        </div>

        {/* Oversized Architectural Heading */}
        <h1 className="max-w-3xl font-headline-xl text-headline-xl uppercase tracking-tighter text-on-surface">
          BUILD YOUR
          <br />
          <span className="text-primary-fixed underline decoration-secondary decoration-4 underline-offset-8">
            OWN DIRECTION.
          </span>
        </h1>

        {/* Supporting Metadata Subtitle */}
        <div className="flex flex-col gap-space-md pt-space-xs text-on-surface-variant sm:flex-row sm:items-center">
          <p className="font-body-lg text-body-lg text-on-surface">
            Your knowledge. Your pace. Your path.
          </p>
          <span className="hidden h-1.5 w-1.5 rounded-DEFAULT bg-outline-variant sm:inline-block" />
          <span className="font-label-md text-label-md uppercase tracking-widest text-outline">
            COORD: 47.3769° N // 08.5417° E
          </span>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center gap-space-md pt-space-md">
          <Link
            href="/roadmaps/create"
            className="flex items-center gap-space-xs rounded-DEFAULT bg-tertiary-fixed px-space-lg py-space-md font-label-md text-label-md uppercase tracking-wider text-on-tertiary-fixed shadow-[4px_4px_0px_0px_#1e5128] transition-all hover:bg-secondary hover:text-on-secondary active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            <span className="material-symbols-outlined text-sm font-bold">add</span>
            <span>+ CREATE NEW ROADMAP</span>
          </Link>

          <Link
            href="/roadmaps"
            className="flex items-center gap-space-xs rounded-DEFAULT bg-surface-container-high px-space-lg py-space-md font-label-md text-label-md uppercase tracking-wider text-secondary transition-colors hover:bg-primary-container/40"
          >
            <span>EXPLORE CURATED ARCHIVES</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
      </div>

      {/* Right Column: Abstract Architectural Spec Graphic & Telemetry (4 Cols) */}
      <div className="flex h-full flex-col justify-between rounded-DEFAULT border border-outline-variant/30 bg-surface-container-lowest p-space-lg lg:col-span-4">
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-space-sm">
          <span className="font-label-sm text-label-sm uppercase text-outline">
            TELEMETRY // DISCIPLINE_LOG
          </span>
          <span className="font-label-sm text-label-sm font-bold uppercase text-secondary">
            SYS:NOMINAL
          </span>
        </div>

        {/* Inline Micro Blueprint SVG */}
        <div className="py-space-md">
          <svg
            className="h-24 w-full text-secondary/30"
            fill="none"
            viewBox="0 0 280 80"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line stroke="currentColor" strokeDasharray="2 4" x1="0" x2="280" y1="20" y2="20" />
            <line stroke="currentColor" strokeDasharray="2 4" x1="0" x2="280" y1="60" y2="60" />
            <circle cx="30" cy="20" fill="#86db70" r="4" />
            <line stroke="#86db70" strokeWidth="2" x1="30" x2="110" y1="20" y2="60" />
            <circle cx="110" cy="60" fill="#d9eaa9" r="5" />
            <line stroke="#86db70" strokeWidth="2" x1="110" x2="190" y1="60" y2="20" />
            <circle cx="190" cy="20" fill="#86db70" r="4" />
            <line
              stroke="#414940"
              strokeDasharray="3 3"
              strokeWidth="1.5"
              x1="190"
              x2="260"
              y1="20"
              y2="40"
            />
            <rect fill="#414940" height="8" width="8" x="256" y="36" />
            <text fill="#8b9388" fontFamily="Space Mono" fontSize="8" x="30" y="38">
              NODE_01
            </text>
            <text fill="#d9eaa9" fontFamily="Space Mono" fontSize="8" x="110" y="76">
              CURRENT_RUN
            </text>
            <text fill="#8b9388" fontFamily="Space Mono" fontSize="8" x="190" y="14">
              NODE_03
            </text>
          </svg>
        </div>

        <div className="flex items-center justify-between border-t border-outline-variant/20 pt-space-sm font-label-sm text-label-sm text-on-surface-variant">
          <span>EFFICIENCY RATING</span>
          <span className="font-bold tracking-widest text-tertiary-fixed">{efficiencyRating}</span>
        </div>
      </div>
    </section>
  );
}
