"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  BookOpen,
  Search,
  ExternalLink,
  ShieldCheck,
  BookmarkPlus,
  Check,
  RefreshCw,
  Sparkles,
  Layers,
  Globe,
} from "lucide-react";
import { AIResourceItem, ResourceSuggestionResponse } from "@/types/ai";
import { fetchAIResourcesApi, createResourceApi } from "@/services/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function ResourceFinderView() {
  const searchParams = useSearchParams();
  const initialTopic = searchParams.get("topic") || "";

  const [topicTitle, setTopicTitle] = useState(initialTopic);
  const [category, setCategory] = useState("Web Development");
  const [difficulty, setDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">(
    "Intermediate"
  );
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ResourceSuggestionResponse | null>(null);
  const [savedUrls, setSavedUrls] = useState<Set<string>>(new Set());

  const handleSearch = async (overrideTopic?: string) => {
    const query = (overrideTopic || topicTitle).trim();
    if (!query) {
      toast.error("Please enter a topic to discover resources");
      return;
    }

    setLoading(true);
    try {
      const res = await fetchAIResourcesApi({
        topicTitle: query,
        category,
        difficulty,
      });
      setData(res);
    } catch (err: any) {
      toast.error(err?.message || "Failed to find resources");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialTopic) {
      setTopicTitle(initialTopic);
      handleSearch(initialTopic);
    }
  }, [initialTopic]);

  const handleSaveToMyResources = async (res: AIResourceItem) => {
    try {
      // Map AI resource types to LMS types
      let lmsType: any = "Documentation";
      if (res.type === "Course") lmsType = "Online course";
      else if (res.type === "Video") lmsType = "YouTube video";
      else if (res.type === "Book") lmsType = "Book";
      else if (res.type === "Interactive Tutorial") lmsType = "Other";
      else if (res.type === "Article" || res.type === "Cheatsheet") lmsType = "Article";
      else if (res.type === "Project Repo") lmsType = "GitHub repository";

      await createResourceApi({
        title: res.title,
        url: res.url,
        type: lmsType,
        author: res.authorOrPlatform || res.domain,
        description: `${res.description} (Difficulty: ${res.difficulty}, Est: ${res.estimatedDuration || "N/A"})`,
        tags: [topicTitle, res.domain, "AI-Suggested"],
        rating: 5,
        isFavorite: false,
        status: "Pending",
      });

      setSavedUrls((prev) => new Set(prev).add(res.url));
      toast.success(`"${res.title}" added to your LMS Resources!`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to save resource");
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-8">
      {/* Header */}
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#62695D] bg-[#252D26] px-3 py-1 font-mono text-xs font-semibold text-[#D7FF00]">
          <BookOpen className="h-3.5 w-3.5 text-[#D7FF00]" />
          <span>CURATED DEVELOPER MATERIAL FINDER</span>
        </div>
        <h1 className="font-mono text-2xl font-bold uppercase tracking-tight text-[#F3F0E6] sm:text-3xl">
          AI Resource Finder
        </h1>
        <p className="mt-1 max-w-2xl text-xs text-[#B8B9AA] sm:text-sm">
          Discover high-impact, verified documentation, interactive sandboxes, and production
          repositories. Strictly verified links with zero hallucinated or broken URLs.
        </p>
      </div>

      {/* Search Bar & Filters Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        className="space-y-3 rounded-2xl border border-[#62695D] bg-[#252D26] p-4 sm:p-5"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B8B9AA]" />
            <input
              type="text"
              value={topicTitle}
              onChange={(e) => setTopicTitle(e.target.value)}
              placeholder="Search topic e.g. React Server Components, Docker Networking, PyTorch Tensors"
              className="w-full rounded-xl border border-[#62695D] bg-[#202720] py-2.5 pl-10 pr-4 font-mono text-xs text-[#F3F0E6] placeholder-[#B8B9AA]/50 focus:border-[#D7FF00] focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl border border-[#62695D] bg-[#202720] px-3 py-2.5 font-mono text-xs text-[#F3F0E6] focus:border-[#D7FF00] focus:outline-none"
            >
              <option value="Web Development">Web Development</option>
              <option value="AI & Machine Learning">AI & Machine Learning</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Data Science">Data Science</option>
              <option value="Mobile Development">Mobile Development</option>
            </select>

            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="rounded-xl border border-[#62695D] bg-[#202720] px-3 py-2.5 font-mono text-xs text-[#F3F0E6] focus:border-[#D7FF00] focus:outline-none"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl bg-[#D7FF00] px-5 py-2.5 font-mono text-xs font-bold uppercase text-[#1B211C] transition-all hover:bg-[#c2e600] disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin text-[#1B211C]" />
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-[#1B211C]" />
                  <span>Find</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 text-xs text-[#B8B9AA]">
          <span className="flex-shrink-0 font-mono text-[11px] text-[#B8B9AA]">Suggestions:</span>
          {[
            "Next.js App Router",
            "TypeScript Generics",
            "Redis Caching",
            "Docker Compose",
            "PyTorch Autograd",
          ].map((tag, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setTopicTitle(tag);
                handleSearch(tag);
              }}
              className="flex-shrink-0 rounded border border-[#62695D] bg-[#202720] px-2 py-0.5 font-mono text-[11px] text-[#B8B9AA] transition-colors hover:bg-[#2C352D] hover:text-[#EDE8D8]"
            >
              {tag}
            </button>
          ))}
        </div>
      </form>

      {/* Results Section */}
      {loading ? (
        <div className="py-20 text-center">
          <RefreshCw className="mx-auto mb-2 h-6 w-6 animate-spin text-[#D7FF00]" />
          <p className="font-mono text-xs text-[#B8B9AA]">
            Finding verified documentation and tutorials...
          </p>
        </div>
      ) : !data ? (
        <div className="rounded-2xl border border-[#62695D] bg-[#252D26] p-6 py-16 text-center">
          <Globe className="mx-auto mb-2 h-8 w-8 text-[#B8B9AA]" />
          <h3 className="mb-1 font-mono text-sm font-bold text-[#F3F0E6]">
            Discover Authoritative Resources
          </h3>
          <p className="mx-auto max-w-sm text-xs text-[#B8B9AA]">
            Type any software topic or choose one from the suggestions above to get verified
            learning materials.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-[#62695D] bg-[#252D26] p-4 font-mono text-xs text-[#F3F0E6]">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#D7FF00]" />
              <span>{data.summary}</span>
            </div>
            <span className="text-[11px] font-bold text-[#D7FF00]">
              {data.resources.length} verified results
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {data.resources.map((res, idx) => {
              const isSaved = savedUrls.has(res.url);

              return (
                <div
                  key={idx}
                  className="flex flex-col justify-between rounded-2xl border border-[#62695D] bg-[#252D26] p-5 transition-colors hover:border-[#D7FF00]"
                >
                  <div>
                    {/* Card Badges */}
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="rounded border border-[#62695D] bg-[#202720] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#D7FF00]">
                          {res.type}
                        </span>
                        {res.isVerified && (
                          <span className="inline-flex items-center gap-1 rounded border border-[#62695D] bg-[#2C352D] px-1.5 py-0.5 text-[10px] text-[#EDE8D8]">
                            <ShieldCheck className="h-3 w-3 text-[#D7FF00]" />
                            Verified Domain
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {res.free && (
                          <span className="rounded border border-[#62695D] bg-[#202720] px-1.5 py-0.5 font-mono text-[10px] text-[#EDE8D8]">
                            Free
                          </span>
                        )}
                        <span className="font-mono text-[10px] text-[#B8B9AA]">
                          {res.difficulty}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="mb-1 font-mono text-sm font-bold leading-snug text-[#F3F0E6]">
                      {res.title}
                    </h3>

                    {/* Description */}
                    <p className="mb-3 text-xs leading-relaxed text-[#B8B9AA]">{res.description}</p>

                    {/* Metadata */}
                    <div className="mb-3 space-y-0.5 font-mono text-[11px] text-[#B8B9AA]">
                      <div>
                        Author / Provider:{" "}
                        <span className="text-[#EDE8D8]">{res.authorOrPlatform}</span>
                      </div>
                      {res.estimatedDuration && (
                        <div>
                          Estimated Time:{" "}
                          <span className="text-[#EDE8D8]">{res.estimatedDuration}</span>
                        </div>
                      )}
                      <div>
                        Domain: <span className="font-bold text-[#D7FF00]">{res.domain}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bottom Bar */}
                  <div className="flex items-center justify-between border-t border-[#62695D]/40 pt-3">
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-xs text-[#B8B9AA] transition-colors hover:text-[#EDE8D8]"
                    >
                      <span>Visit Resource</span>
                      <ExternalLink className="h-3.5 w-3.5 text-[#D7FF00]" />
                    </a>

                    <button
                      onClick={() => handleSaveToMyResources(res)}
                      disabled={isSaved}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition-colors",
                        isSaved
                          ? "cursor-default border border-[#62695D] bg-[#2C352D] text-[#D7FF00]"
                          : "border border-[#62695D] bg-[#202720] text-[#B8B9AA] hover:bg-[#D7FF00] hover:text-[#1B211C]"
                      )}
                    >
                      {isSaved ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-[#D7FF00]" />
                          <span>Saved</span>
                        </>
                      ) : (
                        <>
                          <BookmarkPlus className="h-3.5 w-3.5" />
                          <span>+ Add to LMS</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
