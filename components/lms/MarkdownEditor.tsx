"use client";

import React, { useState } from "react";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Code,
  Quote,
  Link as LinkIcon,
  Eye,
  Edit3,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write your detailed technical notes in markdown...",
  minHeight = "280px",
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

  const insertText = (prefix: string, suffix: string = "") => {
    const textarea = document.getElementById("mypath-markdown-area") as HTMLTextAreaElement | null;
    if (!textarea) {
      onChange(value + prefix + suffix);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);

    const replacement = prefix + (selected || "text") + suffix;
    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selected ? selected.length : 4)
      );
    }, 10);
  };

  // Basic markdown parser for safe, clean preview without heavy external HTML parsers
  const renderPreview = (content: string) => {
    if (!content.trim()) {
      return (
        <p className="font-mono text-xs italic text-[#B8B9AA]">
          No content written yet. Switch to &quot;Write&quot; mode to add notes.
        </p>
      );
    }

    const lines = content.split("\n");
    return (
      <div className="space-y-2 text-xs leading-relaxed text-[#F3F0E6]">
        {lines.map((line, idx) => {
          if (line.startsWith("# ")) {
            return (
              <h1
                key={idx}
                className="border-b border-[#62695D] pb-1 pt-2 font-mono text-base font-bold uppercase text-[#F3F0E6]"
              >
                {line.replace("# ", "")}
              </h1>
            );
          }
          if (line.startsWith("## ")) {
            return (
              <h2 key={idx} className="pt-1.5 font-mono text-sm font-bold text-[#D7FF00]">
                {line.replace("## ", "")}
              </h2>
            );
          }
          if (line.startsWith("### ")) {
            return (
              <h3 key={idx} className="font-mono text-xs font-bold text-[#EDE8D8]">
                {line.replace("### ", "")}
              </h3>
            );
          }
          if (line.startsWith("- ") || line.startsWith("* ")) {
            return (
              <li key={idx} className="ml-4 list-disc text-[#F3F0E6]">
                {line.replace(/^[-*]\s+/, "")}
              </li>
            );
          }
          if (/^\d+\.\s+/.test(line)) {
            return (
              <li key={idx} className="ml-4 list-decimal font-mono text-[#F3F0E6]">
                {line.replace(/^\d+\.\s+/, "")}
              </li>
            );
          }
          if (line.startsWith("> ")) {
            return (
              <blockquote
                key={idx}
                className="rounded-r border-l-2 border-[#D7FF00] bg-[#202720] py-1 pl-3 italic text-[#EDE8D8]"
              >
                {line.replace("> ", "")}
              </blockquote>
            );
          }
          if (line.startsWith("```")) {
            return (
              <div
                key={idx}
                className="my-1 overflow-x-auto rounded-lg border border-[#62695D] bg-[#202720] p-3 font-mono text-[11px] text-[#D7FF00]"
              >
                {line.replace(/```[a-z]*/g, "")}
              </div>
            );
          }
          if (!line.trim()) {
            return <div key={idx} className="h-2" />;
          }

          // Inline styling format for bold, code, links
          return (
            <p key={idx} className="text-[#F3F0E6]">
              {line}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-[#62695D] bg-[#252D26]">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between border-b border-[#62695D] bg-[#202720] px-3 py-1.5 text-xs">
        {/* Formatting Actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => insertText("**", "**")}
            className="rounded p-1.5 text-[#B8B9AA] hover:bg-[#2C352D] hover:text-[#EDE8D8]"
            title="Bold (**text**)"
          >
            <Bold className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertText("*", "*")}
            className="rounded p-1.5 text-[#B8B9AA] hover:bg-[#2C352D] hover:text-[#EDE8D8]"
            title="Italic (*text*)"
          >
            <Italic className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertText("# ")}
            className="rounded p-1.5 text-[#B8B9AA] hover:bg-[#2C352D] hover:text-[#EDE8D8]"
            title="Heading 1 (# )"
          >
            <Heading1 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertText("## ")}
            className="rounded p-1.5 text-[#B8B9AA] hover:bg-[#2C352D] hover:text-[#EDE8D8]"
            title="Heading 2 (## )"
          >
            <Heading2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertText("- ")}
            className="rounded p-1.5 text-[#B8B9AA] hover:bg-[#2C352D] hover:text-[#EDE8D8]"
            title="Bullet List (- )"
          >
            <List className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertText("1. ")}
            className="rounded p-1.5 text-[#B8B9AA] hover:bg-[#2C352D] hover:text-[#EDE8D8]"
            title="Numbered List (1. )"
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertText("```ts\n", "\n```")}
            className="rounded p-1.5 text-[#B8B9AA] hover:bg-[#2C352D] hover:text-[#EDE8D8]"
            title="Code Block (```)"
          >
            <Code className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertText("> ")}
            className="rounded p-1.5 text-[#B8B9AA] hover:bg-[#2C352D] hover:text-[#EDE8D8]"
            title="Quote (> )"
          >
            <Quote className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertText("[", "](https://)")}
            className="rounded p-1.5 text-[#B8B9AA] hover:bg-[#2C352D] hover:text-[#EDE8D8]"
            title="Link ([text](url))"
          >
            <LinkIcon className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Write vs Preview Tabs */}
        <div className="flex items-center gap-1 rounded-lg border border-[#62695D] bg-[#1B211C] p-0.5">
          <button
            type="button"
            onClick={() => setActiveTab("write")}
            className={cn(
              "flex items-center gap-1 rounded px-2.5 py-1 font-mono text-[11px] font-bold transition-colors",
              activeTab === "write"
                ? "bg-[#D7FF00] text-[#1B211C]"
                : "text-[#B8B9AA] hover:text-[#EDE8D8]"
            )}
          >
            <Edit3 className="h-3 w-3" />
            Write
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={cn(
              "flex items-center gap-1 rounded px-2.5 py-1 font-mono text-[11px] font-bold transition-colors",
              activeTab === "preview"
                ? "bg-[#D7FF00] text-[#1B211C]"
                : "text-[#B8B9AA] hover:text-[#EDE8D8]"
            )}
          >
            <Eye className="h-3 w-3" />
            Preview
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="p-3">
        {activeTab === "write" ? (
          <textarea
            id="mypath-markdown-area"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            style={{ minHeight }}
            className="w-full resize-y bg-transparent font-mono text-xs leading-relaxed text-[#F3F0E6] placeholder:text-[#B8B9AA]/50 focus:outline-none"
          />
        ) : (
          <div style={{ minHeight }} className="custom-scrollbar overflow-y-auto p-1">
            {renderPreview(value)}
          </div>
        )}
      </div>
    </div>
  );
}
