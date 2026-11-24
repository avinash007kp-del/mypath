import React from "react";
import { FolderGit2 } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#62695D] bg-[#252D26]/40 p-10 text-center",
        className
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#62695D] bg-[#2C352D] text-[#D7FF00]">
        {icon || <FolderGit2 className="h-7 w-7" />}
      </div>
      <h3 className="text-base font-bold text-[#F3F0E6]">{title}</h3>
      <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-[#B8B9AA]">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button onClick={onAction} variant="primary" size="md">
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
