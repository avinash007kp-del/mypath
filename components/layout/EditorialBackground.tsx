"use client";

import React from "react";

export function EditorialBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 select-none overflow-hidden"
    >
      {/* Base deep surface */}
      <div className="absolute inset-0 bg-surface" />

      {/* Subtle structural 1px vertical framing lines */}
      <div className="relative mx-auto h-full max-w-7xl px-gutter">
        <div className="absolute inset-y-0 left-0 hidden w-[1px] bg-primary-container/20 md:block" />
        <div className="absolute inset-y-0 right-0 hidden w-[1px] bg-primary-container/20 md:block" />
      </div>
    </div>
  );
}
