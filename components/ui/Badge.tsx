import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "accent"
    | "lime"
    | "ivory"
    | "secondary"
    | "outline"
    | "beginner"
    | "intermediate"
    | "advanced"
    | "destructive"
    | "warning"
    | "success";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const baseStyles =
    "inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-semibold tracking-wide transition-colors font-mono";

  const variants = {
    default: "bg-[#171C18] text-[#EDE8D8] border border-[#65685B]",
    accent: "bg-[#D7FF00]/20 text-[#D7FF00] border border-[#D7FF00]/50 font-bold",
    lime: "bg-[#D7FF00] text-[#111512] font-bold border border-[#D7FF00]",
    ivory: "bg-[#EDE8D8] text-[#111512] font-bold border border-[#EDE8D8]",
    secondary: "bg-[#202720] text-[#A5A79B] border border-[#65685B]/60",
    outline: "border border-[#65685B] text-[#F3F0E6] bg-transparent",
    beginner: "bg-[#171C18] text-[#D7FF00] border border-[#65685B]",
    intermediate: "bg-[#171C18] text-[#EDE8D8] border border-[#65685B]",
    advanced: "bg-[#202720] text-[#F3F0E6] border border-[#D7FF00]/50",
    destructive: "bg-rose-950/60 text-rose-300 border border-rose-800/60",
    warning: "bg-amber-950/60 text-amber-300 border border-amber-800/60",
    success: "bg-[#D7FF00]/20 text-[#D7FF00] border border-[#D7FF00]/40",
  };

  return (
    <span className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
    </span>
  );
}
