"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  MessageSquare,
  Compass,
  Target,
  BookOpen,
  Split,
  CalendarDays,
  Plus,
  Trash2,
  Sparkles,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { IAIConversation } from "@/types/ai";
import { fetchConversationsApi, deleteConversationApi } from "@/services/api";
import { toast } from "sonner";

interface AIAssistantLayoutProps {
  children: React.ReactNode;
  activeConversationId?: string;
  onSelectConversation?: (id: string) => void;
  onNewChat?: () => void;
}

const NAV_ITEMS = [
  {
    href: "/ai-assistant",
    label: "AI Mentor Chat",
    icon: MessageSquare,
    exact: true,
  },
  {
    href: "/ai-assistant/roadmap-generator",
    label: "Roadmap Generator",
    icon: Compass,
  },
  {
    href: "/ai-assistant/next-topic",
    label: "Next Topic Engine",
    icon: Target,
  },
  {
    href: "/ai-assistant/resource-finder",
    label: "Resource Finder",
    icon: BookOpen,
  },
  {
    href: "/ai-assistant/topic-breakdown",
    label: "Topic Breakdown",
    icon: Split,
  },
  {
    href: "/ai-assistant/learning-plan",
    label: "Weekly Study Plan",
    icon: CalendarDays,
  },
];

export function AIAssistantLayout({
  children,
  activeConversationId,
  onSelectConversation,
  onNewChat,
}: AIAssistantLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [conversations, setConversations] = useState<IAIConversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const loadConversations = async () => {
    try {
      setLoadingConversations(true);
      const list = await fetchConversationsApi(20);
      setConversations(list);
    } catch {
      // Silently handle initial empty state
    } finally {
      setLoadingConversations(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [activeConversationId]);

  const handleDeleteConversation = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await deleteConversationApi(id);
      setConversations((prev) => prev.filter((c) => c._id !== id));
      toast.success("Conversation deleted");
      if (activeConversationId === id && onNewChat) {
        onNewChat();
      }
    } catch {
      toast.error("Failed to delete conversation");
    }
  };

  const handleStartNewChat = () => {
    if (onNewChat) {
      onNewChat();
    } else {
      router.push("/ai-assistant");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-140px)] w-full flex-col overflow-hidden rounded-2xl border border-[#62695D] bg-[#252D26] shadow-lg lg:flex-row">
      {/* Mobile Subnav Header */}
      <div className="flex items-center justify-between border-b border-[#62695D] bg-[#202720] px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2 font-space text-sm font-bold text-[#F3F0E6]">
          <Sparkles className="h-4 w-4 text-[#D7FF00]" />
          <span>AI Assistant Hub</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg border border-[#62695D] bg-[#252D26] p-1.5 text-[#B8B9AA] hover:text-[#F3F0E6]"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar Subnavigation */}
      <aside
        className={cn(
          "flex w-full flex-shrink-0 flex-col border-r border-[#62695D] bg-[#202720] p-4 lg:w-72",
          mobileMenuOpen ? "block" : "hidden lg:flex"
        )}
      >
        <div className="mb-4 flex items-center justify-between border-b border-[#62695D]/40 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#D7FF00] font-bold text-[#1B211C]">
              <Sparkles className="h-4 w-4 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-space text-xs font-bold uppercase tracking-wider text-[#F3F0E6]">
                AI Copilot Hub
              </h2>
              <p className="font-mono text-[10px] text-[#B8B9AA]">Curriculum Intelligence</p>
            </div>
          </div>
          <button
            onClick={handleStartNewChat}
            className="flex items-center gap-1 rounded-lg bg-[#D7FF00] px-2.5 py-1.5 font-space text-xs font-bold uppercase tracking-wider text-[#1B211C] transition-colors hover:bg-[#c4eb00]"
            title="Start New Conversation"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>New</span>
          </button>
        </div>

        {/* AI Navigation Hub Links */}
        <nav className="mb-6 space-y-1">
          <div className="px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#B8B9AA]">
            Modules
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "group flex items-center justify-between rounded-xl px-3 py-2 font-space text-xs font-semibold transition-all",
                  isActive
                    ? "bg-[#D7FF00] font-bold text-[#1B211C] shadow-sm"
                    : "text-[#B8B9AA] hover:bg-[#252D26] hover:text-[#F3F0E6]"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      isActive ? "text-[#1B211C]" : "text-[#B8B9AA] group-hover:text-[#D7FF00]"
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="h-3.5 w-3.5 stroke-[2.5] text-[#1B211C]" />}
              </Link>
            );
          })}
        </nav>

        {/* Recent Conversations History */}
        <div className="flex min-h-0 flex-1 flex-col border-t border-[#62695D]/40 pt-4">
          <div className="flex items-center justify-between px-2 pb-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#B8B9AA]">
              Saved Sessions
            </span>
            <span className="rounded border border-[#62695D]/60 bg-[#252D26] px-1.5 py-0.5 font-mono text-[10px] text-[#EDE8D8]">
              {conversations.length}
            </span>
          </div>

          <div className="custom-scrollbar flex-1 space-y-1 overflow-y-auto pr-1">
            {loadingConversations && conversations.length === 0 ? (
              <div className="py-4 text-center text-xs text-[#B8B9AA]">Loading history...</div>
            ) : conversations.length === 0 ? (
              <div className="py-6 text-center font-mono text-xs italic text-[#B8B9AA]">
                No past chats. Start one above!
              </div>
            ) : (
              conversations.map((c) => {
                const isSelected = activeConversationId === c._id;
                return (
                  <div
                    key={c._id}
                    onClick={() => {
                      if (onSelectConversation) {
                        onSelectConversation(c._id);
                      } else {
                        router.push(`/ai-assistant?chatId=${c._id}`);
                      }
                      setMobileMenuOpen(false);
                    }}
                    className={cn(
                      "group flex cursor-pointer items-center justify-between rounded-xl px-2.5 py-2 text-xs transition-colors",
                      isSelected
                        ? "border border-[#62695D] bg-[#252D26] font-bold text-[#D7FF00]"
                        : "text-[#B8B9AA] hover:bg-[#252D26] hover:text-[#F3F0E6]"
                    )}
                  >
                    <div className="flex items-center gap-2 truncate pr-1">
                      <MessageSquare className="h-3.5 w-3.5 flex-shrink-0 text-[#B8B9AA] group-hover:text-[#D7FF00]" />
                      <span className="truncate">{c.title || "Untitled Chat"}</span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteConversation(e, c._id)}
                      className="rounded p-1 text-[#B8B9AA] opacity-0 transition-opacity hover:text-rose-400 group-hover:opacity-100"
                      title="Delete chat"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* AI System Status Footer */}
        <div className="mt-auto flex items-center justify-between border-t border-[#62695D]/40 pt-3 font-mono text-[10px] text-[#B8B9AA]">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#D7FF00]" />
            <span>AI Copilot Active</span>
          </div>
          <span className="rounded border border-[#62695D]/60 bg-[#252D26] px-1.5 py-0.5 font-mono text-[10px] text-[#EDE8D8]">
            GPT-4o
          </span>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-[#1B211C]">{children}</main>
    </div>
  );
}
