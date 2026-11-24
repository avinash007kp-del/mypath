"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  RefreshCw,
  Lightbulb,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { IAIMessage, IAIConversation, AIMode } from "@/types/ai";
import { sendAIChatMessage, fetchConversationByIdApi } from "@/services/api";
import { toast } from "sonner";

interface AIChatProps {
  conversationId?: string;
  onConversationCreated?: (id: string) => void;
}

const SUGGESTED_PROMPTS = [
  "Recommend what topic I should study next based on my roadmaps.",
  "How should I structure a 90-minute daily study routine for backend architecture?",
  "Explain the difference between optimistic concurrency and pessimistic locking with code.",
  "Break down Kubernetes Pod lifecycle and scheduling into bite-sized practice steps.",
];

export function AIChat({ conversationId, onConversationCreated }: AIChatProps) {
  const [messages, setMessages] = useState<IAIMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [mode, setMode] = useState<AIMode>("general");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [currentConvId, setCurrentConvId] = useState<string | undefined>(conversationId);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Load conversation if conversationId changes
  useEffect(() => {
    if (conversationId) {
      setCurrentConvId(conversationId);
      loadConversation(conversationId);
    } else {
      setMessages([]);
      setCurrentConvId(undefined);
    }
  }, [conversationId]);

  const loadConversation = async (id: string) => {
    try {
      setInitialLoading(true);
      const res = await fetchConversationByIdApi(id);
      setMessages(res.messages);
      if (res.conversation.mode) {
        setMode(res.conversation.mode);
      }
    } catch (err: any) {
      toast.error("Failed to load conversation history");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || loading) return;

    const optimisticUserMessage: IAIMessage = {
      _id: `temp-${Date.now()}`,
      conversationId: currentConvId || "temp",
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticUserMessage]);
    setInputMessage("");
    setLoading(true);

    try {
      const response = await sendAIChatMessage({
        message: text,
        conversationId: currentConvId,
        mode,
      });

      // Update state with confirmed messages
      if (!currentConvId && response.conversation._id) {
        setCurrentConvId(response.conversation._id);
        if (onConversationCreated) {
          onConversationCreated(response.conversation._id);
        }
      }

      setMessages((prev) => {
        const withoutOptimistic = prev.filter((m) => m._id !== optimisticUserMessage._id);
        return [...withoutOptimistic, response.userMessage, response.assistantMessage];
      });

      if (response.isFallback) {
        toast.info("Generated using MyPath offline heuristic mode");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate AI response");
      setMessages((prev) => prev.filter((m) => m._id !== optimisticUserMessage._id));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Safe markdown line renderer
  const renderMessageContent = (content: string) => {
    const lines = content.split("\n");
    let inCodeBlock = false;
    let codeLanguage = "";
    let codeBuffer: string[] = [];
    const elements: React.ReactNode[] = [];

    lines.forEach((line, index) => {
      if (line.startsWith("```")) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLanguage = line.replace("```", "").trim() || "typescript";
          codeBuffer = [];
        } else {
          inCodeBlock = false;
          const codeText = codeBuffer.join("\n");
          elements.push(
            <div
              key={`code-${index}`}
              className="my-3 overflow-hidden rounded-lg border border-[#62695D] bg-[#202720]"
            >
              <div className="flex items-center justify-between border-b border-[#62695D] bg-[#252D26] px-3 py-1.5 text-[11px] text-[#B8B9AA]">
                <span className="font-mono text-[#D7FF00]">{codeLanguage}</span>
                <button
                  onClick={() => handleCopy(codeText, `code-${index}`)}
                  className="flex items-center gap-1 transition-colors hover:text-[#EDE8D8]"
                >
                  {copiedId === `code-${index}` ? (
                    <Check className="h-3 w-3 text-[#D7FF00]" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  <span>{copiedId === `code-${index}` ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <pre className="overflow-x-auto p-3 font-mono text-xs leading-relaxed text-[#EDE8D8]">
                <code>{codeText}</code>
              </pre>
            </div>
          );
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      if (line.startsWith("# ")) {
        elements.push(
          <h1
            key={index}
            className="border-b border-[#62695D] pb-1 pt-2 font-mono text-base font-bold text-[#F3F0E6]"
          >
            {line.replace("# ", "")}
          </h1>
        );
      } else if (line.startsWith("## ")) {
        elements.push(
          <h2 key={index} className="pt-2 font-mono text-sm font-bold text-[#D7FF00]">
            {line.replace("## ", "")}
          </h2>
        );
      } else if (line.startsWith("### ")) {
        elements.push(
          <h3 key={index} className="pt-1.5 font-mono text-xs font-bold text-[#EDE8D8]">
            {line.replace("### ", "")}
          </h3>
        );
      } else if (line.startsWith("- ") || line.startsWith("* ")) {
        elements.push(
          <li key={index} className="ml-4 list-disc py-0.5 text-xs text-[#F3F0E6]">
            {line.replace(/^[-*]\s+/, "")}
          </li>
        );
      } else if (/^\d+\.\s+/.test(line)) {
        elements.push(
          <div key={index} className="ml-4 py-0.5 font-mono text-xs text-[#F3F0E6]">
            {line}
          </div>
        );
      } else if (line.trim() === "") {
        elements.push(<div key={index} className="h-1.5" />);
      } else {
        elements.push(
          <p key={index} className="text-xs leading-relaxed text-[#F3F0E6]">
            {line}
          </p>
        );
      }
    });

    return <div className="space-y-1">{elements}</div>;
  };

  return (
    <div className="flex h-full flex-col bg-[#1B211C]">
      {/* Chat Header Bar */}
      <div className="flex items-center justify-between border-b border-[#62695D] bg-[#252D26]/90 px-6 py-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#62695D] bg-[#2C352D] text-[#D7FF00] shadow-sm">
            <Bot className="h-4 w-4 text-[#D7FF00]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-mono text-sm font-bold uppercase tracking-wide text-[#F3F0E6]">
                MyPath Learning Assistant
              </h1>
              <span className="rounded-full border border-[#62695D] bg-[#2C352D] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#D7FF00]">
                Context-Aware
              </span>
            </div>
            <p className="text-[11px] text-[#B8B9AA]">
              Personalized guidance synchronized with your roadmaps and completed topics
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-2">
          <span className="hidden font-mono text-xs text-[#B8B9AA] sm:inline">Mode:</span>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as AIMode)}
            className="rounded-lg border border-[#62695D] bg-[#202720] px-2.5 py-1.5 font-mono text-xs text-[#F3F0E6] focus:border-[#D7FF00] focus:outline-none"
          >
            <option value="general">General Mentorship</option>
            <option value="roadmap">Roadmap Strategy</option>
            <option value="next_topic">Next Topic Advice</option>
            <option value="resource">Resource Discovery</option>
            <option value="breakdown">Topic Breakdown</option>
            <option value="learning_plan">Weekly Study Plan</option>
          </select>
        </div>
      </div>

      {/* Messages Stream Container */}
      <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
        {initialLoading ? (
          <div className="flex h-full items-center justify-center gap-2 font-mono text-xs text-[#B8B9AA]">
            <RefreshCw className="h-4 w-4 animate-spin text-[#D7FF00]" />
            <span>Loading conversation...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="mx-auto max-w-2xl px-4 py-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#62695D] bg-[#252D26] text-[#D7FF00]">
              <Sparkles className="h-6 w-6 text-[#D7FF00]" />
            </div>
            <h2 className="mb-2 font-mono text-base font-bold uppercase tracking-wide text-[#F3F0E6]">
              How can I assist your engineering learning today?
            </h2>
            <p className="mx-auto mb-8 max-w-md text-xs leading-relaxed text-[#B8B9AA]">
              I can recommend unblocked topics, break down complex concepts into subtasks, suggest
              verified resources, or optimize your study hours.
            </p>

            {/* Quick Prompt Cards */}
            <div className="grid grid-cols-1 gap-2 text-left sm:grid-cols-2">
              {SUGGESTED_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="group flex items-start gap-2.5 rounded-xl border border-[#62695D] bg-[#252D26] p-3 text-xs text-[#B8B9AA] transition-all hover:border-[#D7FF00] hover:bg-[#2C352D] hover:text-[#F3F0E6]"
                >
                  <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#D7FF00] transition-transform group-hover:scale-110" />
                  <span className="leading-snug">{prompt}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg._id || index}
                className={cn(
                  "flex max-w-3xl gap-3",
                  isUser ? "ml-auto justify-end" : "mr-auto justify-start"
                )}
              >
                {!isUser && (
                  <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-[#62695D] bg-[#252D26] text-[#D7FF00]">
                    <Bot className="h-4 w-4 text-[#D7FF00]" />
                  </div>
                )}

                <div
                  className={cn(
                    "max-w-2xl rounded-xl border px-4 py-3 text-xs leading-relaxed",
                    isUser
                      ? "rounded-tr-none border-[#62695D] bg-[#2C352D] text-[#F3F0E6]"
                      : "rounded-tl-none border-[#62695D] bg-[#252D26] text-[#F3F0E6] shadow-sm"
                  )}
                >
                  <div className="mb-1.5 flex items-center justify-between gap-4 border-b border-[#62695D]/40 pb-1 text-[10px] text-[#B8B9AA]">
                    <span className="font-mono font-semibold text-[#EDE8D8]">
                      {isUser ? "You" : "MyPath AI"}
                    </span>
                    {!isUser && (
                      <div className="flex items-center gap-2">
                        {msg.metadata?.model && (
                          <span className="rounded border border-[#62695D]/40 bg-[#202720] px-1.5 py-0.5 font-mono text-[9px] text-[#B8B9AA]">
                            {msg.metadata.model}
                          </span>
                        )}
                        <button
                          onClick={() => handleCopy(msg.content, msg._id || String(index))}
                          className="transition-colors hover:text-[#EDE8D8]"
                          title="Copy response"
                        >
                          {copiedId === (msg._id || String(index)) ? (
                            <Check className="h-3 w-3 text-[#D7FF00]" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-1">
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      renderMessageContent(msg.content)
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-[#62695D] bg-[#252D26] font-mono text-xs font-bold text-[#EDE8D8]">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {loading && (
          <div className="mr-auto flex max-w-3xl gap-3">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-[#62695D] bg-[#252D26] text-[#D7FF00]">
              <Bot className="h-4 w-4 animate-spin text-[#D7FF00]" />
            </div>
            <div className="flex items-center gap-2 rounded-xl rounded-tl-none border border-[#62695D] bg-[#252D26] px-4 py-3 text-xs text-[#B8B9AA]">
              <span className="h-1.5 w-1.5 animate-ping rounded-full bg-[#D7FF00]" />
              <span className="font-mono">Synthesizing personalized learning guidance...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Composer Box */}
      <div className="border-t border-[#62695D] bg-[#252D26]/90 p-4">
        <div className="relative mx-auto max-w-3xl rounded-xl border border-[#62695D] bg-[#202720] transition-colors focus-within:border-[#D7FF00]">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder="Ask anything about your roadmaps, topics, or software engineering concepts..."
            className="w-full resize-none bg-transparent p-3 pr-12 text-xs text-[#F3F0E6] placeholder-[#B8B9AA]/50 focus:outline-none"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || loading}
            className="absolute bottom-2.5 right-2.5 rounded-lg bg-[#D7FF00] p-2 font-bold text-[#1B211C] transition-colors hover:bg-[#c2e600] disabled:bg-[#2C352D] disabled:text-[#B8B9AA]/30"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <div className="mx-auto mt-2 flex max-w-3xl items-center justify-between px-1 font-mono text-[11px] text-[#B8B9AA]">
          <span>Press Enter to send, Shift+Enter for newline</span>
          <span>MyPath AI • Structured Outputs</span>
        </div>
      </div>
    </div>
  );
}
