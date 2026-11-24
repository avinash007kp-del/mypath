"use client";

import React, { useState } from "react";
import { Calendar } from "lucide-react";
import { DateRangePreset } from "@/types/analytics";
import { cn } from "@/lib/utils";

interface DateRangeFilterProps {
  value: DateRangePreset;
  startDate?: string;
  endDate?: string;
  onChange: (preset: DateRangePreset, startDate?: string, endDate?: string) => void;
}

const PRESETS: { id: DateRangePreset; label: string }[] = [
  { id: "7d", label: "7 Days" },
  { id: "30d", label: "30 Days" },
  { id: "90d", label: "90 Days" },
  { id: "year", label: "This Year" },
  { id: "all", label: "All Time" },
  { id: "custom", label: "Custom" },
];

export function DateRangeFilter({ value, startDate, endDate, onChange }: DateRangeFilterProps) {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customStart, setCustomStart] = useState(
    startDate || new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0]
  );
  const [customEnd, setCustomEnd] = useState(endDate || new Date().toISOString().split("T")[0]);

  const handleSelect = (preset: DateRangePreset) => {
    if (preset === "custom") {
      setShowCustomModal(true);
    } else {
      setShowCustomModal(false);
      onChange(preset);
    }
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    setShowCustomModal(false);
    onChange("custom", customStart, customEnd);
  };

  return (
    <div className="relative flex items-center">
      {/* Pills Container */}
      <div className="no-scrollbar flex items-center gap-1 overflow-x-auto rounded-xl border border-[#62695D] bg-[#202720] p-1">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => handleSelect(p.id)}
            className={cn(
              "whitespace-nowrap rounded-lg px-3 py-1.5 font-mono text-xs transition-all",
              value === p.id
                ? "bg-[#D7FF00] font-bold text-[#1B211C] shadow-sm"
                : "text-[#B8B9AA] hover:bg-[#2C352D] hover:text-[#F3F0E6]"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom Range Dialog */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowCustomModal(false)}
          />
          <div className="relative z-10 w-full max-w-sm space-y-4 rounded-2xl border border-[#62695D] bg-[#252D26] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#62695D]/40 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#D7FF00]" />
                <h3 className="text-sm font-bold text-[#F3F0E6]">Custom Date Range</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="text-xs text-[#B8B9AA] hover:text-[#F3F0E6]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplyCustom} className="space-y-3.5">
              <div>
                <label className="mb-1 block font-mono text-xs font-semibold text-[#F3F0E6]">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full rounded-xl border border-[#62695D] bg-[#202720] px-3 py-1.5 font-mono text-xs text-[#F3F0E6] focus:border-[#D7FF00] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-mono text-xs font-semibold text-[#F3F0E6]">
                  End Date
                </label>
                <input
                  type="date"
                  required
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full rounded-xl border border-[#62695D] bg-[#202720] px-3 py-1.5 font-mono text-xs text-[#F3F0E6] focus:border-[#D7FF00] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-[#62695D]/40 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="rounded-xl px-3 py-1.5 font-mono text-xs text-[#B8B9AA] hover:text-[#F3F0E6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#D7FF00] px-3 py-1.5 font-mono text-xs font-bold text-[#1B211C] transition-colors hover:bg-[#c2e600]"
                >
                  Apply Range
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
