"use client";

import React from "react";
import { X, Keyboard } from "lucide-react";

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  { key: "Ctrl / ⌘ + S", description: "Save roadmap to MongoDB immediately" },
  { key: "Ctrl / ⌘ + Z", description: "Undo last change" },
  { key: "Ctrl / ⌘ + Shift + Z", description: "Redo change" },
  { key: "Delete / Backspace", description: "Delete currently selected nodes or edges" },
  { key: "Ctrl / ⌘ + D", description: "Duplicate selected node" },
  { key: "Ctrl / ⌘ + A", description: "Select all nodes on canvas" },
  { key: "Escape", description: "Clear current node / edge selection" },
  { key: "Space + Drag", description: "Pan anywhere on the canvas" },
];

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-[#62695D] bg-[#252D26] p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between border-b border-[#62695D]/40 pb-3">
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-[#D7FF00]" />
            <h3 className="text-base font-bold text-[#F3F0E6]">Keyboard Shortcuts</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[#B8B9AA] transition-colors hover:bg-[#2C352D] hover:text-[#F3F0E6]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {shortcuts.map((sc) => (
            <div
              key={sc.key}
              className="flex items-center justify-between rounded-xl border border-[#62695D] bg-[#202720] p-2.5 text-xs"
            >
              <span className="text-[#F3F0E6]">{sc.description}</span>
              <kbd className="rounded border border-[#62695D] bg-[#252D26] px-2 py-1 font-mono text-[11px] font-semibold text-[#D7FF00] shadow-sm">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
