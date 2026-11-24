"use client";

import React from "react";
import { X, Sparkles, AlertTriangle, ArrowRight } from "lucide-react";
import { ROADMAP_TEMPLATES, RoadmapTemplate } from "../templates";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: RoadmapTemplate | null) => void;
  hasExistingNodes: boolean;
}

export function TemplateModal({
  isOpen,
  onClose,
  onSelectTemplate,
  hasExistingNodes,
}: TemplateModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#62695D] bg-[#252D26] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#62695D]/40 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#62695D] bg-[#2C352D] text-[#D7FF00]">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F3F0E6]">Choose a Roadmap Template</h3>
              <p className="text-xs text-[#B8B9AA]">
                Kickstart your roadmap with curated developer curriculum structures
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[#B8B9AA] transition-colors hover:bg-[#2C352D] hover:text-[#F3F0E6]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {hasExistingNodes && (
          <div className="my-3 flex items-start gap-2.5 rounded-xl border border-amber-800/40 bg-amber-950/20 p-3 text-xs text-amber-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <p>
              Applying a template will replace the current canvas layout with the template
              structure. Any unsaved changes will be overwritten.
            </p>
          </div>
        )}

        {/* Templates list */}
        <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto py-3 pr-1">
          {/* Blank option */}
          <div
            onClick={() => onSelectTemplate(null)}
            className="group flex cursor-pointer items-center justify-between rounded-xl border border-[#62695D] bg-[#202720] p-4 transition-all hover:border-[#D7FF00] hover:bg-[#2C352D]"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">📄</span>
                <h4 className="text-sm font-bold text-[#F3F0E6] transition-colors group-hover:text-[#D7FF00]">
                  Blank Canvas
                </h4>
                <span className="rounded border border-[#62695D] bg-[#252D26] px-1.5 py-0.5 font-mono text-[10px] uppercase text-[#B8B9AA]">
                  Empty
                </span>
              </div>
              <p className="mt-1 text-xs text-[#B8B9AA]">
                Start completely from scratch and design your custom path.
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-[#B8B9AA] transition-colors group-hover:text-[#D7FF00]" />
          </div>

          {/* Preset templates */}
          {ROADMAP_TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              onClick={() => onSelectTemplate(tmpl)}
              className="group flex cursor-pointer items-center justify-between rounded-xl border border-[#62695D] bg-[#202720] p-4 transition-all hover:border-[#D7FF00] hover:bg-[#2C352D]"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="select-none text-xl">{tmpl.icon}</span>
                  <h4 className="text-sm font-bold text-[#F3F0E6] transition-colors group-hover:text-[#D7FF00]">
                    {tmpl.name}
                  </h4>
                  <span className="rounded border border-[#62695D] bg-[#2C352D] px-1.5 py-0.5 font-mono text-[10px] uppercase text-[#EDE8D8]">
                    {tmpl.category}
                  </span>
                  <span className="rounded border border-[#62695D] bg-[#252D26] px-2 py-0.5 font-mono text-[11px] text-[#D7FF00]">
                    {tmpl.nodes.length} nodes
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-[#B8B9AA]">{tmpl.description}</p>
              </div>

              <div className="pl-4">
                <Button variant="secondary" size="sm" className="border-[#62695D]">
                  Apply Template
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
