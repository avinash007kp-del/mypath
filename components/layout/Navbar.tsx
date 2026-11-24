"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Bell, Search, Moon, Sun, Menu, Sparkles } from "lucide-react";

interface NavbarProps {
  onOpenMobileMenu?: () => void;
}

export function Navbar({ onOpenMobileMenu }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const getPageTitle = () => {
    if (!pathname) return "Dashboard";
    if (pathname === "/") return "Developer Dashboard";
    if (pathname.startsWith("/roadmaps/create")) return "Create New Roadmap";
    if (pathname.includes("/edit")) return "Edit Roadmap";
    if (pathname.startsWith("/roadmaps/")) return "Roadmap Details";
    if (pathname.startsWith("/roadmaps")) return "All Roadmaps";
    if (pathname.startsWith("/study-session")) return "Deep Work Study Timer";
    if (pathname.startsWith("/daily-goals")) return "Daily Learning Goals";
    if (pathname.startsWith("/notes")) return "Personal Learning Notes";
    if (pathname.startsWith("/resources")) return "Curated Resources";
    if (pathname.startsWith("/milestones")) return "Milestones & Deadlines";
    if (pathname.startsWith("/calendar")) return "Learning Calendar";
    if (pathname.startsWith("/analytics")) return "Analytics & Progress";
    if (pathname.startsWith("/projects")) return "Hands-on Projects";
    if (pathname.startsWith("/settings")) return "Settings & Config";
    return "Developer Platform";
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/roadmaps?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-[#62695D] bg-[#1B211C]/90 px-4 backdrop-blur-md md:px-6">
      {/* Left side: Mobile menu toggle + Page Title */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="rounded-xl p-2 text-[#B8B9AA] transition-colors hover:bg-[#2C352D] hover:text-[#F3F0E6] md:hidden"
            aria-label="Open mobile navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <div>
          <h1 className="text-sm font-black tracking-tight text-[#F3F0E6] md:text-base">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Middle & Right side */}
      <div className="flex items-center gap-3">
        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="relative hidden w-48 sm:block md:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B8B9AA]" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roadmaps..."
            className="w-full rounded-xl border border-[#62695D] bg-[#202720] py-1.5 pl-9 pr-3 text-xs text-[#F3F0E6] transition-colors placeholder:text-[#B8B9AA]/50 focus:border-[#D7FF00] focus:outline-none focus:ring-1 focus:ring-[#D7FF00]"
          />
        </form>

        {/* Theme Preference Control */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#62695D] bg-[#202720] text-[#B8B9AA] transition-all hover:border-[#D7FF00]/50 hover:bg-[#2C352D] hover:text-[#D7FF00]"
          title={isDarkMode ? "Dark mode active (Default)" : "Light mode"}
        >
          {isDarkMode ? (
            <Moon className="h-4 w-4 text-[#D7FF00]" />
          ) : (
            <Sun className="h-4 w-4 text-amber-400" />
          )}
        </button>

        {/* Notifications Icon with dropdown indicator */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#62695D] bg-[#202720] text-[#B8B9AA] transition-all hover:border-[#D7FF00]/50 hover:bg-[#2C352D] hover:text-[#D7FF00]"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#D7FF00]" />
          </button>

          {/* Simple Notifications Popover */}
          {notificationsOpen && (
            <div className="absolute right-0 z-50 mt-2 w-72 rounded-2xl border border-[#62695D] bg-[#252D26] p-3.5 shadow-2xl">
              <div className="mb-2 flex items-center justify-between border-b border-[#62695D]/40 pb-2">
                <span className="text-xs font-bold text-[#F3F0E6]">Notifications</span>
                <span className="font-mono text-[10px] text-[#D7FF00]">1 New</span>
              </div>
              <div className="flex items-start gap-2.5 rounded-xl border border-[#62695D] bg-[#202720] p-2.5">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#D7FF00]" />
                <div>
                  <p className="text-xs font-bold text-[#F3F0E6]">Swiss Brutalism Active</p>
                  <p className="mt-0.5 text-[11px] text-[#B8B9AA]">
                    Your personal roadmap tracker has been upgraded to editorial brutalist
                    aesthetics.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User profile avatar */}
        <div className="flex items-center gap-2 pl-1">
          <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#D7FF00] bg-[#202720] p-0.5 transition-transform hover:scale-105">
            <span className="font-mono text-xs font-bold text-[#D7FF00]">AV</span>
          </div>
        </div>
      </div>
    </header>
  );
}
