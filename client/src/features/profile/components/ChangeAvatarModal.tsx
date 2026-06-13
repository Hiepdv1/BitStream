"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera,
  X,
  Upload,
  Loader2,
  AlertTriangle,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { useUploadAvatar } from "../hook/useUploadAvatar";
import { useAppQueryClient } from "@/hooks";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

interface ChangeAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarUrl: string | null;
  userName: string | null;
}

export const ChangeAvatarModal = ({
  isOpen,
  onClose,
  currentAvatarUrl,
  userName,
}: ChangeAvatarModalProps) => {
  const [mounted, setMounted] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: uploadAvatar } = useUploadAvatar();
  const { invalidateProfile } = useAppQueryClient();

  const initials = (userName?.[0] || "U").toUpperCase();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isUploading) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, isUploading]);

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

  const handleClose = useCallback(() => {
    if (isUploading) return;
    setSelectedFile(null);
    setPreviewUrl(null);
    setApiError(null);
    setIsDragOver(false);
    onClose();
  }, [isUploading, onClose]);

  const validateFile = useCallback((file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Please select a valid image file (JPEG, PNG, WebP, or GIF)";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "Image size must be less than 5MB";
    }
    return null;
  }, []);

  const handleFileSelect = useCallback(
    (file: File) => {
      const error = validateFile(file);
      if (error) {
        setApiError(error);
        return;
      }

      setApiError(null);
      setSelectedFile(file);

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    },
    [validateFile],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
      // Reset input so same file can be selected again
      e.target.value = "";
    },
    [handleFileSelect],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect],
  );

  const handleUpload = useCallback(() => {
    if (!selectedFile) return;

    setIsUploading(true);
    setApiError(null);

    uploadAvatar(selectedFile, {
      onSuccess: () => {
        toast.success("Avatar updated successfully!");
        invalidateProfile();
        handleClose();
      },
      onError: (error) => {
        setApiError(error.message || "Failed to upload avatar");
      },
      onSettled: () => {
        setIsUploading(false);
      },
    });
  }, [selectedFile, uploadAvatar, invalidateProfile, handleClose]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
        onClick={() => {
          if (!isUploading) handleClose();
        }}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg bg-background border border-border/50 rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {isUploading && (
          <div className="absolute inset-0 z-50 bg-background/60 backdrop-blur-[1px] flex items-center justify-center cursor-not-allowed">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-brand" />
              <span className="text-sm text-text-muted font-medium">
                Uploading avatar...
              </span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
              <Camera className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-main">
                Change Avatar
              </h2>
              <p className="text-sm text-text-muted mt-0.5">
                Upload a new profile picture
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className={`p-2 rounded-lg text-text-muted hover:text-text-main hover:bg-surface transition-colors ${
              isUploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current & Preview */}
          <div className="flex items-center justify-center gap-8">
            {/* Current Avatar */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-text-muted font-semibold">
                Current
              </span>
              <div className="avatar-preview-circle avatar-preview-current">
                {currentAvatarUrl ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_ASSET_URL}/assets/avatar/${currentAvatarUrl}`}
                    alt="Current avatar"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-2xl font-bold text-white">
                    {initials}
                  </span>
                )}
              </div>
            </div>

            {/* Arrow */}
            {previewUrl && (
              <div className="flex flex-col items-center gap-2 animate-in fade-in duration-300">
                <span className="text-[10px] uppercase tracking-widest text-transparent font-semibold">
                  &nbsp;
                </span>
                <div className="flex items-center gap-1 text-text-muted">
                  <svg width="32" height="12" viewBox="0 0 32 12" fill="none">
                    <path
                      d="M0 6h28m0 0l-5-5m5 5l-5 5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            )}

            {/* New Preview */}
            {previewUrl && (
              <div className="flex flex-col items-center gap-2 animate-in fade-in slide-in-from-left-4 duration-300">
                <span className="text-[10px] uppercase tracking-widest text-brand font-semibold">
                  New
                </span>
                <div className="avatar-preview-circle avatar-preview-new">
                  <img
                    src={previewUrl}
                    alt="New avatar preview"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Drop Zone */}
          <div
            className={`avatar-dropzone ${
              isDragOver ? "avatar-dropzone-active" : "avatar-dropzone-idle"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(",")}
              onChange={handleInputChange}
              className="hidden"
            />

            <div className="flex flex-col items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-200 ${
                  isDragOver
                    ? "bg-brand/20 text-brand"
                    : "bg-white/5 text-text-muted"
                }`}
              >
                {isDragOver ? (
                  <Upload className="w-6 h-6" />
                ) : (
                  <ImageIcon className="w-6 h-6" />
                )}
              </div>

              <div className="text-center">
                <p className="text-sm font-medium text-text-main">
                  {isDragOver ? (
                    "Drop your image here"
                  ) : (
                    <>
                      <span className="text-brand cursor-pointer hover:text-brand-hover transition-colors">
                        Click to upload
                      </span>{" "}
                      or drag and drop
                    </>
                  )}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  JPEG, PNG, WebP or GIF • Max 5MB
                </p>
              </div>

              {selectedFile && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand/10 border border-brand/20 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <ImageIcon className="w-3.5 h-3.5 text-brand" />
                  <span className="text-xs text-brand font-medium truncate max-w-[200px]">
                    {selectedFile.name}
                  </span>
                  <span className="text-xs text-text-muted">
                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Error */}
          {apiError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-start gap-2 animate-in slide-in-from-top-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isUploading}
              className="text-text-main"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={!selectedFile || isUploading}
              onClick={handleUpload}
              className="min-w-[140px]"
            >
              {isUploading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Avatar
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
