"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { GlassNavbar } from "./GlassNavbar";
import { EditorialBackground } from "./EditorialBackground";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  // In full-screen interactive roadmap editor, bypass standard floating layout
  if (pathname && pathname.includes("/editor")) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-surface text-on-surface selection:bg-tertiary-fixed selection:text-on-tertiary-fixed">
        {children}
      </div>
    );
  }

  // In onboarding, register, login, or auth terminal, use full-screen terminal layout without the floating dashboard navbar
  if (
    pathname &&
    (pathname.startsWith("/onboarding") ||
      pathname.startsWith("/register") ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/auth"))
  ) {
    return (
      <div className="relative flex min-h-screen flex-col bg-surface text-on-surface selection:bg-primary-container selection:text-on-primary-container">
        <EditorialBackground />
        <main className="w-full flex-1">{children}</main>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-surface text-on-surface selection:bg-tertiary-fixed selection:text-on-tertiary-fixed">
      {/* Background Grid Rules */}
      <EditorialBackground />

      {/* Floating Centered Pill Navbar */}
      <GlassNavbar />

      {/* Main Container */}
      <main className="w-full flex-1 bg-surface pt-20">{children}</main>
    </div>
  );
}
