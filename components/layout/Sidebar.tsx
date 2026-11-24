"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  LayoutDashboard,
  GitFork,
  CheckSquare,
  Timer,
  FileText,
  Link2,
  Trophy,
  Calendar,
  BarChart3,
  Bot,
  Settings,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Roadmaps", href: "/roadmaps", icon: GitFork },
  { label: "Focus Timer", href: "/study-session", icon: Timer },
  { label: "Daily Goals", href: "/daily-goals", icon: CheckSquare },
  { label: "Notes", href: "/notes", icon: FileText },
  { label: "Resources", href: "/resources", icon: Link2 },
  { label: "Milestones", href: "/milestones", icon: Trophy },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "AI Copilot", href: "/ai-assistant", icon: Bot },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "sticky top-0 z-30 hidden h-screen select-none flex-col border-r border-[#62695D] bg-[#252D26] transition-all duration-300 md:flex",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-[#62695D]/40 px-4">
        <Link href="/dashboard" className="group flex items-center gap-3 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#62695D] bg-[#2C352D] text-[#D7FF00] shadow-sm transition-transform group-hover:scale-105">
            <Compass className="h-5 w-5 stroke-[2.2]" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col leading-none">
              <span className="flex items-center gap-1 text-lg font-black tracking-tight text-[#F3F0E6]">
                MyPath
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#D7FF00]" />
              </span>
              <span className="mt-0.5 font-mono text-[11px] text-[#B8B9AA]">
                Developer Roadmaps
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="rounded-lg p-1.5 text-[#B8B9AA] transition-colors hover:bg-[#2C352D] hover:text-[#D7FF00]"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="custom-scrollbar flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "border-l-2 border-[#D7FF00] bg-[#2C352D] font-bold text-[#D7FF00] shadow-sm"
                  : "text-[#B8B9AA] hover:bg-[#202720] hover:text-[#F3F0E6]"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-colors",
                  isActive ? "text-[#D7FF00]" : "text-[#B8B9AA] group-hover:text-[#F3F0E6]"
                )}
              />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
              {isActive && !isCollapsed && (
                <span className="ml-auto h-2 w-2 rounded-full bg-[#D7FF00]" />
              )}
            </Link>
          );
        })}
      </div>

      {/* User Profile Section at bottom */}
      <div className="border-t border-[#62695D]/40 bg-[#202720] p-3">
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-[#252D26]",
            isCollapsed && "justify-center p-1"
          )}
        >
          <div className="relative">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D7FF00] bg-[#252D26] font-mono text-xs font-bold text-[#D7FF00]">
              AV
            </div>
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-[#D7FF00] ring-2 ring-[#202720]" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-[#F3F0E6]">Avinash</p>
              <p className="truncate font-mono text-[11px] text-[#B8B9AA]">avinash@mypath.dev</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
