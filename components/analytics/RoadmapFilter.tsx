"use client";

import React from "react";
import { Map } from "lucide-react";
import { IRoadmap } from "@/types";

interface RoadmapFilterProps {
  value: string;
  roadmaps: IRoadmap[];
  onChange: (roadmapId: string) => void;
}

export function RoadmapFilter({ value, roadmaps, onChange }: RoadmapFilterProps) {
  return (
    <div className="relative inline-flex items-center">
      <div className="flex items-center gap-1.5 rounded-xl border border-[#62695D] bg-[#202720] px-3 py-1.5 font-mono text-xs text-[#F3F0E6]">
        <Map className="h-3.5 w-3.5 shrink-0 text-[#D7FF00]" />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="cursor-pointer bg-transparent pr-1 font-mono text-xs text-[#F3F0E6] focus:outline-none"
        >
          <option value="All" className="bg-[#252D26] text-[#F3F0E6]">
            All Roadmaps ({roadmaps.length})
          </option>
          {roadmaps.map((r) => (
            <option key={r._id} value={r._id} className="bg-[#252D26] text-[#F3F0E6]">
              {r.title} ({r.category})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
