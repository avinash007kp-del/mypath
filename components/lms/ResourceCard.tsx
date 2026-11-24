"use client";

import React from "react";
import {
  ExternalLink,
  Star,
  CheckCircle2,
  Trash2,
  Youtube,
  BookOpen,
  GraduationCap,
  Bookmark,
  FileCode,
  FileText,
  Link as LinkIcon,
} from "lucide-react";
import { ILearningResource, ResourceType } from "@/types/lms";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface ResourceCardProps {
  resource: ILearningResource;
  onToggleFavorite?: (resource: ILearningResource) => void;
  onToggleStatus?: (resource: ILearningResource) => void;
  onDelete?: (id: string) => void;
}

export function ResourceCard({
  resource,
  onToggleFavorite,
  onToggleStatus,
  onDelete,
}: ResourceCardProps) {
  const getTypeIcon = (type: ResourceType) => {
    switch (type) {
      case "YouTube video":
        return <Youtube className="h-4 w-4 text-red-400" />;
      case "Documentation":
        return <BookOpen className="h-4 w-4 text-[#D7FF00]" />;
      case "Online course":
        return <GraduationCap className="h-4 w-4 text-amber-400" />;
      case "GitHub repository":
        return <FileCode className="h-4 w-4 text-[#EDE8D8]" />;
      case "PDF":
      case "Article":
      case "Book":
        return <FileText className="h-4 w-4 text-sky-400" />;
      default:
        return <LinkIcon className="h-4 w-4 text-stone-400" />;
    }
  };

  const isCompleted = resource.status === "Completed";

  return (
    <div
      className={cn(
        "group flex flex-col justify-between rounded-xl border border-[#62695D] bg-[#252D26] p-4 transition-all hover:border-[#D7FF00] hover:bg-[#2C352D]",
        isCompleted && "border-[#62695D] bg-[#252D26]"
      )}
    >
      <div>
        {/* Top Header: Type + Favorite + Open */}
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#62695D] bg-[#202720]">
              {getTypeIcon(resource.type)}
            </div>
            <span className="font-mono text-[11px] text-[#B8B9AA]">{resource.type}</span>
          </div>

          <div className="flex items-center gap-1">
            {onToggleFavorite && (
              <button
                onClick={() => onToggleFavorite(resource)}
                className="rounded p-1 text-[#B8B9AA] transition-colors hover:text-[#D7FF00]"
                title={resource.isFavorite ? "Remove favorite" : "Mark as favorite"}
              >
                <Star
                  className={cn("h-4 w-4", resource.isFavorite && "fill-[#D7FF00] text-[#D7FF00]")}
                />
              </button>
            )}

            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded p-1 text-[#B8B9AA] transition-colors hover:bg-[#202720] hover:text-[#EDE8D8]"
              title="Open resource in new tab"
            >
              <ExternalLink className="h-4 w-4 text-[#D7FF00]" />
            </a>
          </div>
        </div>

        {/* Title */}
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 line-clamp-1 block font-mono text-sm font-bold text-[#F3F0E6] transition-colors group-hover:text-[#D7FF00]"
        >
          {resource.title}
        </a>

        {/* Description */}
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#B8B9AA]">
          {resource.description || "No description provided."}
        </p>

        {/* Roadmap Tag if associated */}
        {resource.roadmapTitle && (
          <div className="mt-2 flex items-center gap-1 font-mono text-[11px] text-[#D7FF00]">
            <Bookmark className="h-3 w-3 text-[#D7FF00]" />
            <span className="max-w-[200px] truncate">{resource.roadmapTitle}</span>
          </div>
        )}

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1">
            {resource.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="rounded border border-[#62695D] bg-[#202720] px-1.5 py-0.5 font-mono text-[10px] text-[#B8B9AA]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer: Rating, Status Toggle & Delete */}
      <div className="mt-4 flex items-center justify-between border-t border-[#62695D]/40 pt-3 text-xs">
        {/* Rating stars */}
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                "h-3 w-3",
                star <= resource.rating ? "fill-[#D7FF00] text-[#D7FF00]" : "text-[#62695D]"
              )}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          {onToggleStatus && (
            <button
              onClick={() => onToggleStatus(resource)}
              className={cn(
                "flex items-center gap-1 rounded-md border px-2.5 py-1 font-mono text-[11px] font-bold transition-colors",
                isCompleted
                  ? "border-[#D7FF00] bg-[#2C352D] text-[#D7FF00]"
                  : "border-[#62695D] bg-[#202720] text-[#B8B9AA] hover:text-[#EDE8D8]"
              )}
            >
              <CheckCircle2 className="h-3 w-3 text-[#D7FF00]" />
              {isCompleted ? "Completed" : "Mark Done"}
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(resource._id)}
              className="rounded p-1 text-[#B8B9AA] transition-colors hover:bg-red-500/10 hover:text-red-400"
              title="Delete resource"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
