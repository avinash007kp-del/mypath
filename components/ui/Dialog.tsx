"use client";

import React, { useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  isLoading?: boolean;
  variant?: "danger" | "primary";
  children?: React.ReactNode;
}

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  isLoading = false,
  variant = "danger",
  children,
}: DialogProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={() => !isLoading && onClose()}
      />

      {/* Modal Dialog Content */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-[#65685B] bg-[#171C18] p-6 shadow-2xl transition-all">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-4 top-4 rounded-md p-1.5 text-[#A5A79B] transition-colors hover:bg-[#202720] hover:text-[#EDE8D8]"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-4">
          <div className="flex items-center gap-3">
            {variant === "danger" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-400">
                <AlertTriangle className="h-4 w-4" />
              </div>
            )}
            <h3 className="font-mono text-lg font-bold tracking-tight text-[#F3F0E6]">{title}</h3>
          </div>
        </div>

        {children ? (
          children
        ) : (
          <>
            {description && (
              <p className="mb-6 text-sm leading-relaxed text-[#B8B9AA]">{description}</p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={onClose}
                disabled={isLoading}
              >
                {cancelLabel}
              </Button>
              {onConfirm && (
                <Button
                  type="button"
                  variant={variant === "danger" ? "danger" : "primary"}
                  size="md"
                  onClick={onConfirm}
                  isLoading={isLoading}
                >
                  {confirmLabel}
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
