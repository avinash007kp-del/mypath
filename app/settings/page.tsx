"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Settings,
  Database,
  Moon,
  Bell,
  Shield,
  CheckCircle,
  RefreshCw,
  Palette,
  Layers,
  Terminal,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function SettingsPage() {
  const paletteColors = [
    { name: "Main Canvas", hex: "#1B211C", desc: "Background canvas" },
    { name: "Card Surface", hex: "#252D26", desc: "Standard card containers" },
    { name: "Elevated", hex: "#2C352D", desc: "Modals & active tabs" },
    { name: "Input Surface", hex: "#202720", desc: "Inputs & code blocks" },
    { name: "Primary Accent", hex: "#D7FF00", desc: "Electric lime CTAs" },
    { name: "Warm Ivory", hex: "#EDE8D8", desc: "Editorial focus & titles" },
    { name: "Primary Text", hex: "#F3F0E6", desc: "High contrast prose" },
    { name: "Secondary Text", hex: "#B8B9AA", desc: "Subtitles & meta tags" },
    { name: "Border Neutral", hex: "#62695D", desc: "1px crisp structural grid" },
  ];

  return (
    <div className="max-w-4xl space-y-6 pb-16">
      {/* Editorial Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#62695D]/40 pb-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded border border-[#62695D] bg-[#2C352D] px-2 py-0.5 font-mono text-[11px] uppercase tracking-widest text-[#D7FF00]">
              CONFIG &amp; PREFERENCES
            </span>
          </div>
          <h1 className="flex items-center gap-2.5 text-3xl font-black tracking-tight text-[#F3F0E6]">
            <Settings className="h-7 w-7 text-[#D7FF00]" />
            Platform Settings
          </h1>
          <p className="mt-1 text-xs text-[#B8B9AA] md:text-sm">
            Manage database configuration, developer preferences, color system, and platform
            defaults.
          </p>
        </div>
        <Link
          href="/profile"
          className="inline-flex shrink-0 items-center gap-2 rounded bg-[#D7FF00] px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-[#1B211C] transition-colors hover:bg-[#b8f1b9]"
        >
          <User className="h-4 w-4" />
          <span>View Scholar Profile</span>
        </Link>
      </div>

      {/* Database Connection Card */}
      <div className="space-y-4 rounded-2xl border border-[#62695D] bg-[#252D26] p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#62695D]/40 pb-3">
          <div className="flex items-center gap-2.5">
            <Database className="h-5 w-5 text-[#D7FF00]" />
            <h3 className="text-base font-bold text-[#F3F0E6]">MongoDB Database Connection</h3>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded border border-[#62695D] bg-[#2C352D] px-2.5 py-1 font-mono text-[11px] font-medium text-[#D7FF00]">
            <CheckCircle className="h-3.5 w-3.5 text-[#D7FF00]" />
            Connected
          </span>
        </div>

        <p className="text-xs leading-relaxed text-[#B8B9AA]">
          MyPath connects to MongoDB Atlas or local MongoDB using Mongoose connection caching.
          Ensure your{" "}
          <code className="rounded border border-[#62695D]/50 bg-[#202720] px-1.5 py-0.5 font-mono text-[#D7FF00]">
            MONGODB_URI
          </code>{" "}
          environment variable is set in your{" "}
          <code className="rounded border border-[#62695D]/50 bg-[#202720] px-1.5 py-0.5 font-mono text-[#EDE8D8]">
            .env.local
          </code>{" "}
          file.
        </p>

        <div className="custom-scrollbar overflow-x-auto rounded-xl border border-[#62695D] bg-[#202720] p-3.5 font-mono text-xs text-[#EDE8D8]">
          MONGODB_URI=mongodb+srv://&lt;username&gt;:&lt;password&gt;@cluster.mongodb.net/mypath?retryWrites=true&amp;w=majority
        </div>

        <div className="flex flex-col justify-between gap-3 pt-2 sm:flex-row sm:items-center">
          <div>
            <h4 className="text-xs font-bold text-[#F3F0E6]">
              Database Partition & Cluster Status
            </h4>
            <p className="text-[11px] text-[#B8B9AA]">
              Autonomous client-side replication and local zero-knowledge cache enabled.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#D7FF00]" />
            <span className="font-mono text-xs text-[#D7FF00]">CLUSTER ONLINE</span>
          </div>
        </div>
      </div>

      {/* Swiss Brutalism Design System Palette Card */}
      <div className="space-y-4 rounded-2xl border border-[#62695D] bg-[#252D26] p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#62695D]/40 pb-3">
          <div className="flex items-center gap-2.5">
            <Palette className="h-5 w-5 text-[#D7FF00]" />
            <div>
              <h3 className="text-base font-bold text-[#F3F0E6]">
                Design System &amp; Color Palette
              </h3>
              <p className="text-xs text-[#B8B9AA]">
                Swiss Brutalism + Editorial Poster Color Tokens
              </p>
            </div>
          </div>
          <span className="rounded border border-[#62695D] bg-[#202720] px-2 py-0.5 font-mono text-[11px] text-[#EDE8D8]">
            9 Theme Tokens
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {paletteColors.map((color) => (
            <div
              key={color.hex}
              className="flex items-center gap-3 rounded-xl border border-[#62695D] bg-[#202720] p-3"
            >
              <div
                className="h-10 w-10 shrink-0 rounded-lg border border-[#62695D] shadow-inner"
                style={{ backgroundColor: color.hex }}
              />
              <div className="min-w-0">
                <span className="block truncate font-mono text-xs font-bold text-[#F3F0E6]">
                  {color.hex}
                </span>
                <p className="truncate text-[11px] font-medium text-[#EDE8D8]">{color.name}</p>
                <p className="truncate text-[10px] text-[#B8B9AA]">{color.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Architecture & Future Scale Card */}
      <div className="space-y-3 rounded-2xl border border-[#62695D] bg-[#252D26] p-6 shadow-sm">
        <div className="flex items-center gap-2.5 border-b border-[#62695D]/40 pb-3">
          <Shield className="h-5 w-5 text-[#D7FF00]" />
          <h3 className="text-base font-bold text-[#F3F0E6]">Architecture &amp; System Specs</h3>
        </div>
        <p className="text-xs leading-relaxed text-[#B8B9AA]">
          MyPath is engineered with modular micro-architecture and full database persistence:
        </p>
        <ul className="list-none space-y-2 text-xs text-[#EDE8D8]">
          <li className="flex items-start gap-2">
            <span className="font-mono font-bold text-[#D7FF00]">01.</span>
            <span>
              Roadmap visual graph schema is decoupled from curriculum metadata for high-performance
              React Flow rendering.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-mono font-bold text-[#D7FF00]">02.</span>
            <span>
              REST API routes protected with Zod validation schemas and MongoDB ObjectId safety
              wrappers.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-mono font-bold text-[#D7FF00]">03.</span>
            <span>
              AI Copilot engine with structured JSON responses for roadmap generation, prerequisite
              inspection, and topic quizzes.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-mono font-bold text-[#D7FF00]">04.</span>
            <span>
              Single active study session concurrency enforcement with real-time interval timing and
              streak tracking.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
