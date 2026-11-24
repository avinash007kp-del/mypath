"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Dashboard", href: "/dashboard", path: "dashboard" },
  { label: "My Roadmaps", href: "/roadmaps", path: "my-roadmaps" },
  { label: "Workspace", href: "/workspace", path: "workspace" },
  { label: "Focus Session", href: "/study-session", path: "focus-session" },
  { label: "Analytics", href: "/analytics", path: "analytics" },
  { label: "Pathfinder AI", href: "/ai-assistant", path: "pathfinder-ai" },
  { label: "Profile", href: "/profile", path: "profile" },
];

export function GlassNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed left-0 right-0 top-0 z-50">
      <div className="mx-auto flex h-20 max-w-7xl items-center px-gutter">
        <div className="flex w-full items-center justify-between rounded-full border border-primary-container/70 bg-surface/80 px-gutter py-space-sm shadow-lg shadow-black/30 backdrop-blur-md">
          {/* Brand Identity */}
          <div className="flex items-center gap-space-md">
            <Link href="/dashboard" className="group flex items-center gap-space-md">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-secondary/30 bg-primary-container text-secondary transition-transform group-hover:scale-105">
                <span className="material-symbols-outlined text-sm font-bold">alt_route</span>
              </div>
              <span className="hidden font-headline-sm text-headline-sm uppercase tracking-tight text-on-surface sm:inline-block">
                MyPath
              </span>
            </Link>
            <span className="hidden rounded-DEFAULT border border-outline-variant px-space-xs py-0.5 font-label-sm text-label-sm uppercase text-primary md:inline-block">
              CORE_V2.6
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-space-lg lg:flex">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/dashboard"
                  ? pathname === "/dashboard" || pathname === "/"
                  : pathname === link.href ||
                    pathname.startsWith(link.href + "/") ||
                    (link.path === "workspace" && pathname.startsWith("/workspace")) ||
                    (link.path === "focus-session" &&
                      (pathname.startsWith("/study-session") ||
                        pathname.startsWith("/focus-session"))) ||
                    (link.path === "profile" &&
                      (pathname.startsWith("/profile") || pathname.startsWith("/settings")));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "py-1 font-label-md text-label-md uppercase tracking-wider transition-colors",
                    isActive
                      ? "relative font-bold text-tertiary-fixed after:absolute after:-bottom-1 after:left-1/2 after:h-1 after:w-1 after:-translate-x-1/2 after:rounded-full after:bg-tertiary-fixed after:content-['']"
                      : "text-on-surface-variant hover:text-on-surface"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* User Profile Avatar & Mobile Hamburger */}
          <div className="flex items-center gap-space-md">
            <Link
              href="/profile"
              className="group relative flex items-center justify-center"
              title="Scholar Profile"
            >
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-outline-variant bg-surface-container-high transition-colors hover:border-tertiary-fixed">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAAnRjH18n69GHO5tplF8WLyZcdPbN7Xf1_9nWcWN3K9nfwvHnltDi0jtmZu9dmUSe524twWOMhBJw2ZosyQHYXlJIylCH81sMOVsrsFPBTcE5gNhAUAwcL1l6LK2s4JqheS3nWUunuD-Rt-U-dimmb242PJdOZvFJw5u50GzYAZ0FZlaSZ6Z6bCgQRujHhMT2DVOaMI2VxMknWeRLAWSrxPBj1g62iGLlC0gPrJw"
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-secondary ring-2 ring-surface"></span>
            </Link>

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-DEFAULT p-1.5 text-on-surface hover:text-tertiary-fixed lg:hidden"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mx-auto -mt-2 max-w-7xl px-gutter lg:hidden">
          <div className="flex flex-col gap-space-sm rounded-DEFAULT border border-primary-container/80 bg-surface/95 p-space-md shadow-2xl backdrop-blur-xl">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/dashboard"
                  ? pathname === "/dashboard" || pathname === "/"
                  : pathname === link.href ||
                    pathname.startsWith(link.href + "/") ||
                    (link.path === "workspace" && pathname.startsWith("/workspace")) ||
                    (link.path === "focus-session" &&
                      (pathname.startsWith("/study-session") ||
                        pathname.startsWith("/focus-session"))) ||
                    (link.path === "profile" &&
                      (pathname.startsWith("/profile") || pathname.startsWith("/settings")));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "rounded-DEFAULT px-space-sm py-space-xs font-label-md text-label-md uppercase tracking-wider transition-colors",
                    isActive
                      ? "border-l-2 border-tertiary-fixed bg-primary-container/50 font-bold text-tertiary-fixed"
                      : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
