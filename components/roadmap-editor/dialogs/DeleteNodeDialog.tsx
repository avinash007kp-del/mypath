"use client";

import React from "react";
import { Dialog } from "@/components/ui/Dialog";

interface DeleteNodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  nodeTitle?: string;
  isMulti?: boolean;
  count?: number;
}

export function DeleteNodeDialog({
  isOpen,
  onClose,
  onConfirm,
  nodeTitle,
  isMulti = false,
  count = 1,
}: DeleteNodeDialogProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isMulti ? `Delete ${count} Selected Nodes?` : `Delete Node?`}
      description={
        isMulti
          ? `Are you sure you want to delete ${count} selected nodes? All connected edges and dependencies will also be removed.`
          : `Are you sure you want to delete "${nodeTitle || "this node"}"? All connected edges will also be removed from the roadmap.`
      }
      confirmLabel="Delete"
      variant="danger"
      onConfirm={onConfirm}
    />
  );
}
