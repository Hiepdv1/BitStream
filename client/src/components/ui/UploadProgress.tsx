"use client";

import { memo } from "react";
import { X, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface UploadProgressProps {
  progress: number;
  onCancel: () => void;
  title?: string;
  description?: string;
}

export const UploadProgress = memo(function UploadProgress({
  progress,
  onCancel,
  title = "Uploading Assets",
  description = "Please wait while your media files are securely uploaded and processed by the server.",
}: UploadProgressProps) {
  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface border border-border shadow-2xl rounded-2xl p-8 max-w-sm w-full text-center flex flex-col items-center animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-brand/10 border border-brand/20 rounded-full flex items-center justify-center mb-5">
          <UploadCloud className="w-8 h-8 text-brand animate-pulse" />
        </div>

        <h3 className="font-heading font-bold text-xl text-text-main mb-2 tracking-tight">
          {title}
        </h3>
        <p className="text-xs text-text-muted leading-relaxed font-medium mb-6">
          {description}
        </p>

        <div className="w-full bg-background border border-border rounded-xl p-4 mb-6 shadow-inner">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-bold tracking-widest uppercase text-text-muted">
              Progress
            </span>
            <span className="text-lg font-black tracking-tight text-brand">
              {progress}%
            </span>
          </div>
          <div className="h-2 bg-surface overflow-hidden rounded-full border border-border shadow-sm">
            <div
              className="h-full bg-brand rounded-full transition-all duration-300 ease-out relative shadow-[0_0_10px_rgba(var(--brand),0.5)]"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 w-full animate-pulse" />
            </div>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full text-text-secondary hover:text-error hover:border-error hover:bg-error/10 transition-colors cursor-pointer"
          onClick={onCancel}
        >
          <X className="w-4 h-4 mr-1" />
          Cancel Upload
        </Button>
      </div>
    </div>
  );
});
