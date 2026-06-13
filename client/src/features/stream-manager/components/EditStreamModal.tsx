"use client";

import { useEffect, useState } from "react";
import { X, PlaySquare } from "lucide-react";
import { StreamItem } from "../types";
import { EditStreamForm } from "./EditStreamForm";

interface EditStreamModalProps {
  stream: StreamItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditStreamModal = ({
  stream,
  isOpen,
  onClose,
}: EditStreamModalProps) => {
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose, isSubmitting]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted || !isOpen || !stream) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
        onClick={() => {
          if (!isSubmitting) onClose();
        }}
      />

      {/* Modal Container */}
      <div
        className="relative w-full max-w-2xl bg-background border border-border/50 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
              <PlaySquare className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-main">Edit Stream</h2>
              <p className="text-sm text-text-muted mt-0.5">
                Update your stream details and settings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className={`p-2 rounded-lg text-text-muted hover:text-text-main hover:bg-surface transition-colors ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <EditStreamForm
            stream={stream}
            onCancel={onClose}
            onSubmittingChange={setIsSubmitting}
          />
        </div>
      </div>
    </div>
  );
};
