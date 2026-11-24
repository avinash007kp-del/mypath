import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "MyPath – Personal Learning Roadmap Platform",
  description:
    "A modern developer learning roadmap platform inspired by roadmap.sh. Track skills, milestones, and learning paths with MongoDB integration.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="flex min-h-screen flex-col bg-surface font-body-md text-on-surface antialiased">
        <AppShell>{children}</AppShell>
        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "#1f201f",
              border: "1px solid #1e5128",
              color: "#e4e2e0",
            },
          }}
        />
      </body>
    </html>
  );
}
