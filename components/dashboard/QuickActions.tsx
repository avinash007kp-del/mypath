import React from "react";
import Link from "next/link";
import { Compass, TrendingUp, Sparkles, Clock, Zap } from "lucide-react";

export function QuickActions() {
  const actions = [
    {
      index: "01",
      title: "AI Curriculum Synth",
      description: "Synthesize full roadmaps with GPT-4o",
      href: "/ai-assistant/roadmap-generator",
      icon: Sparkles,
      accent: "text-[#D7FF00]",
    },
    {
      index: "02",
      title: "Study Timer Studio",
      description: "Launch interval Pomodoro tracker",
      href: "/study-session",
      icon: Clock,
      accent: "text-[#EDE8D8]",
    },
    {
      index: "03",
      title: "Explore Curriculums",
      description: "Filter and inspect active visual paths",
      href: "/roadmaps",
      icon: Compass,
      accent: "text-[#D7FF00]",
    },
    {
      index: "04",
      title: "Learning Analytics",
      description: "Evaluate cadence, streak and velocity",
      href: "/analytics",
      icon: TrendingUp,
      accent: "text-[#EDE8D8]",
    },
  ];

  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-[#65685B] bg-[#171C18] p-6 shadow-sm sm:p-7">
      <div>
        <div className="mb-4 flex items-center gap-3 border-b border-[#65685B]/30 pb-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#D7FF00] font-black text-[#111512] shadow-sm">
            <Zap className="h-4 w-4 fill-[#111512]" />
          </div>
          <div>
            <h3 className="font-space text-sm font-bold uppercase tracking-wider text-[#F3F0E6] sm:text-base">
              QUICK ACTIONS
            </h3>
            <p className="font-sans text-xs text-[#A5A79B]">
              Shortcuts for frequent curriculum workflows.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <Link
                key={act.title}
                href={act.href}
                className="group flex items-center justify-between rounded-xl border border-[#65685B]/40 bg-[#202720] p-3 transition-all duration-150 hover:border-[#65685B] hover:bg-[#202720]/80"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#65685B] bg-[#171C18] transition-transform group-hover:scale-105">
                    <Icon className={`h-4 w-4 ${act.accent}`} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="truncate font-space text-xs font-bold uppercase tracking-wider text-[#F3F0E6] transition-colors group-hover:text-[#EDE8D8]">
                      {act.title}
                    </h4>
                    <p className="truncate font-sans text-[11px] text-[#A5A79B]">
                      {act.description}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center pl-2">
                  <span className="font-mono text-xs text-[#A5A79B] transition-all group-hover:translate-x-0.5 group-hover:text-[#D7FF00]">
                    →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[#65685B]/30 pt-3 font-mono text-[10px] text-[#A5A79B]">
        <span>PRESS SHORTCUTS</span>
        <span className="font-bold text-[#D7FF00]">ALT + 1..4</span>
      </div>
    </div>
  );
}
