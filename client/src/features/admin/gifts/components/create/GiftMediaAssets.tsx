"use client";

import { memo, useCallback, useRef } from "react";
import { ImageIcon, Upload, Play, Pause } from "lucide-react";

interface MediaFile {
  file: File | null;
  previewUrl: string | null;
}

interface GiftMediaAssetsProps {
  imageFile: MediaFile;
  effectFile: MediaFile;
  soundFile: MediaFile;
  imageError?: string | null;
  onImageChange: (file: File | null) => void;
  onEffectChange: (file: File | null) => void;
  onSoundChange: (file: File | null) => void;
  onTestEffect: () => void;
  isPlayingSound: boolean;
  onToggleSound: () => void;
}

export const GiftMediaAssets = memo(function GiftMediaAssets({
  imageFile,
  effectFile,
  soundFile,
  imageError,
  onImageChange,
  onEffectChange,
  onSoundChange,
  onTestEffect,
  isPlayingSound,
  onToggleSound,
}: GiftMediaAssetsProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const effectInputRef = useRef<HTMLInputElement>(null);
  const soundInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      onImageChange(file);
    },
    [onImageChange],
  );

  const handleEffectSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      onEffectChange(file);
    },
    [onEffectChange],
  );

  const handleSoundSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      onSoundChange(file);
    },
    [onSoundChange],
  );

  const handleImageClick = useCallback(() => {
    imageInputRef.current?.click();
  }, []);

  const handleEffectClick = useCallback(() => {
    effectInputRef.current?.click();
  }, []);

  const handleSoundClick = useCallback(() => {
    soundInputRef.current?.click();
  }, []);

  return (
    <div className="admin-gift-form-section">
      <div className="admin-gift-form-section-header">
        <div className="admin-gift-form-section-icon">
          <ImageIcon className="w-4 h-4" />
        </div>
        <h3 className="admin-gift-form-section-title">Media Assets</h3>
      </div>

      {/* Thumbnail Image */}
      <div className="admin-gift-media-row">
        <label className="admin-gift-form-label">
          Thumbnail Image (PNG/WEBP)
        </label>
        <div className="admin-gift-media-input-row">
          <div className="admin-gift-file-upload" style={{ flex: 1 }}>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/png,image/webp,image/jpeg"
              onChange={handleImageSelect}
              className="admin-gift-file-input"
              id="gift-image-upload"
            />
            <div className="admin-gift-file-label">
              <Upload className="w-4 h-4 shrink-0" />
              {imageFile.file ? (
                <span className="admin-gift-file-name">
                  {imageFile.file.name}
                </span>
              ) : (
                <span>Choose thumbnail image...</span>
              )}
            </div>
          </div>
          <button
            type="button"
            className={`admin-gift-media-btn ${imageFile.previewUrl ? "admin-gift-media-btn--active" : ""}`}
            onClick={handleImageClick}
            disabled={!imageFile.file}
          >
            Preview
          </button>
        </div>
        {imageError && (
          <p className="admin-gift-form-error mt-1.5">{imageError}</p>
        )}
      </div>

      {/* Animation File (Lottie) */}
      <div className="admin-gift-media-row">
        <label className="admin-gift-form-label">
          Animation File (Lottie/URL)
        </label>
        <div className="admin-gift-media-input-row">
          <div className="admin-gift-file-upload" style={{ flex: 1 }}>
            <input
              ref={effectInputRef}
              type="file"
              accept="application/json,.json,.lottie"
              onChange={handleEffectSelect}
              className="admin-gift-file-input"
              id="gift-effect-upload"
            />
            <div className="admin-gift-file-label">
              <Upload className="w-4 h-4 shrink-0" />
              {effectFile.file ? (
                <span className="admin-gift-file-name">
                  {effectFile.file.name}
                </span>
              ) : (
                <span>Choose Lottie animation file...</span>
              )}
            </div>
          </div>
          <button
            type="button"
            className={`admin-gift-media-btn ${effectFile.file ? "admin-gift-media-btn--active" : ""}`}
            onClick={onTestEffect}
            disabled={!effectFile.file}
          >
            Test Flow
          </button>
        </div>
      </div>

      {/* Activation Sound */}
      <div className="admin-gift-media-row">
        <label className="admin-gift-form-label">
          Activation Sound (MP3/WAV) — Optional
        </label>
        <div className="admin-gift-media-input-row">
          <div className="admin-gift-file-upload" style={{ flex: 1 }}>
            <input
              ref={soundInputRef}
              type="file"
              accept="audio/mpeg,audio/wav,audio/mp3"
              onChange={handleSoundSelect}
              className="admin-gift-file-input"
              id="gift-sound-upload"
            />
            <div className="admin-gift-file-label">
              <Upload className="w-4 h-4 shrink-0" />
              {soundFile.file ? (
                <span className="admin-gift-file-name">
                  {soundFile.file.name}
                </span>
              ) : (
                <span>Choose activation sound...</span>
              )}
            </div>
          </div>
          <button
            type="button"
            className={`admin-gift-media-btn ${isPlayingSound ? "admin-gift-media-btn--active" : ""}`}
            onClick={onToggleSound}
            disabled={!soundFile.file}
          >
            {isPlayingSound ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
});
