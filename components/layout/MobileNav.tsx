"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  PlusCircle,
  GraduationCap,
  Target,
  Clock,
  FileText,
  BookOpen,
  Trophy,
  Calendar,
  FolderKanban,
  BarChart3,
  Settings,
  X,
  Compass,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "AI Assistant", href: "/ai-assistant", icon: Sparkles },
  { label: "My Roadmaps", href: "/roadmaps", icon: Map },
  { label: "Create Roadmap", href: "/roadmaps/create", icon: PlusCircle },
  { label: "My Learning", href: "/my-learning", icon: GraduationCap },
  { label: "Daily Goals", href: "/daily-goals", icon: Target },
  { label: "Study Timer", href: "/study-session", icon: Clock },
  { label: "Notes", href: "/notes", icon: FileText },
  { label: "Resources", href: "/resources", icon: BookOpen },
  { label: "Milestones", href: "/milestones", icon: Trophy },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative flex h-full w-72 max-w-[85vw] flex-col border-r border-[#62695D] bg-[#252D26] p-4 shadow-2xl">
        <div className="mb-4 flex items-center justify-between border-b border-[#62695D]/40 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#62695D] bg-[#2C352D] text-[#D7FF00]">
              <Compass className="h-5 w-5" />
            </div>
            <span className="text-lg font-black tracking-tight text-[#F3F0E6]">MyPath</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#B8B9AA] transition-colors hover:bg-[#2C352D] hover:text-[#F3F0E6]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Links */}
        <div className="custom-scrollbar flex-1 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "border-l-2 border-[#D7FF00] bg-[#2C352D] font-bold text-[#D7FF00]"
                    : "text-[#B8B9AA] hover:bg-[#202720] hover:text-[#F3F0E6]"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-[#D7FF00]" : "text-[#B8B9AA]")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* User footer */}
        <div className="mt-auto border-t border-[#62695D]/40 pt-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#D7FF00] bg-[#202720] font-mono text-xs font-bold text-[#D7FF00]">
              AV
            </div>
            <div>
              <p className="text-xs font-bold text-[#F3F0E6]">Avinash</p>
              <p className="font-mono text-[10px] text-[#B8B9AA]">avinash@mypath.dev</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
