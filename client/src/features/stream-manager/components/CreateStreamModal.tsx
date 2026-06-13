"use client";

import { useEffect, useCallback, useState } from "react";
import { X, Radio } from "lucide-react";
import { CreateStreamForm } from "@/features/create-stream/components";

interface CreateStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateStreamModal({ isOpen, onClose }: CreateStreamModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const safeClose = useCallback(() => {
    if (!isSubmitting) onClose();
  }, [isSubmitting, onClose]);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") safeClose();
    },
    [safeClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={safeClose}
      />

      {/* Modal Content */}
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-surface border border-white/5 shadow-2xl animate-in zoom-in-95 duration-200 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20 scrollbar-track-transparent"
        role="dialog"
        aria-label="Create Stream"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 bg-surface/95 backdrop-blur-md border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
              <Radio className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-main tracking-tight">
                Create Stream
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Set up your stream details before going live
              </p>
            </div>
          </div>
          <button
            onClick={safeClose}
            disabled={isSubmitting}
            className="p-2 rounded-xl text-text-muted hover:text-text-main hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body — reuses CreateStreamForm */}
        <div className="p-6">
          <CreateStreamForm
            onCancel={safeClose}
            onSubmittingChange={setIsSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
