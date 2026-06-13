"use client";

import { memo } from "react";
import { X, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface GiftUploadProgressProps {
  progress: number;
  onCancel: () => void;
}

export const GiftUploadProgress = memo(function GiftUploadProgress({
  progress,
  onCancel,
}: GiftUploadProgressProps) {
  return (
    <div className="admin-gift-upload-overlay">
      <div className="admin-gift-upload-card">
        <div className="admin-gift-upload-icon-wrapper">
          <UploadCloud className="w-8 h-8 text-brand animate-pulse" />
        </div>

        <h3 className="admin-gift-upload-title">Uploading Assets</h3>
        <p className="admin-gift-upload-desc">
          Please wait while your media files are securely uploaded and processed
          by the server.
        </p>

        <div className="admin-gift-upload-bar-wrapper">
          <div className="admin-gift-upload-bar-info">
            <span className="admin-gift-upload-bar-label">Progress</span>
            <span className="admin-gift-upload-bar-percent">{progress}%</span>
          </div>
          <div className="admin-gift-upload-bar-bg">
            <div
              className="admin-gift-upload-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="admin-gift-upload-cancel"
          onClick={onCancel}
        >
          <X className="w-4 h-4 mr-1" />
          Cancel Upload
        </Button>
      </div>
    </div>
  );
});
