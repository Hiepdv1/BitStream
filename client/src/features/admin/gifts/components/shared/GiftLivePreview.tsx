"use client";

import { memo, useCallback, useEffect, useRef, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { RotateCcw, Timer, Gift as GiftIcon, ImageIcon } from "lucide-react";
import { GiftTier } from "../../types/gift";

// Dynamic import for lottie-react to avoid SSR issues
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

interface GiftLivePreviewProps {
  name: string;
  tier: GiftTier;
  price: number;
  effectData: object | null;
  imagePreviewUrl: string | null;
}

const TIER_BADGE_CLASS: Record<string, string> = {
  BASIC: "admin-gift-tier-badge--basic",
  RARE: "admin-gift-tier-badge--rare",
  EPIC: "admin-gift-tier-badge--epic",
  LEGENDARY: "admin-gift-tier-badge--legendary",
};

const SPEED_OPTIONS = [0.5, 1, 1.5, 2];

export const GiftLivePreview = memo(function GiftLivePreview({
  name,
  tier,
  price,
  effectData,
  imagePreviewUrl,
}: GiftLivePreviewProps) {
  const lottieRef = useRef<any>(null);
  const [speedIndex, setSpeedIndex] = useState(1);
  const [progress, setProgress] = useState(0);
  const animationFrameRef = useRef<number | null>(null);

  const currentSpeed = SPEED_OPTIONS[speedIndex];

  const displayName = useMemo(() => name || "Gift Name", [name]);

  const displayPrice = useMemo(
    () => (price > 0 ? price.toLocaleString() : "0"),
    [price],
  );

  // ── Animation progress tracking ──
  useEffect(() => {
    if (!effectData || !lottieRef.current) return;

    const updateProgress = () => {
      const lottie = lottieRef.current;
      if (lottie) {
        const currentFrame = lottie.animationItem?.currentFrame || 0;
        const totalFrames = lottie.animationItem?.totalFrames || 1;
        setProgress((currentFrame / totalFrames) * 100);
      }
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    };

    animationFrameRef.current = requestAnimationFrame(updateProgress);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [effectData]);

  // ── Speed control ──
  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.setSpeed(currentSpeed);
    }
  }, [currentSpeed]);

  const handleRestart = useCallback(() => {
    if (lottieRef.current) {
      lottieRef.current.goToAndPlay(0);
    }
  }, []);

  const handleCycleSpeed = useCallback(() => {
    setSpeedIndex((prev) => (prev + 1) % SPEED_OPTIONS.length);
  }, []);

  // ── Estimated file size ──
  const estimatedFileSize = useMemo(() => {
    if (!effectData) return null;
    const bytes = new Blob([JSON.stringify(effectData)]).size;
    const kb = bytes / 1024;
    if (kb >= 1024) {
      return `${(kb / 1024).toFixed(1)} MB`;
    }
    return `${kb.toFixed(1)} KB`;
  }, [effectData]);

  const isSafeSize = useMemo(() => {
    if (!effectData) return true;
    const bytes = new Blob([JSON.stringify(effectData)]).size;
    return bytes < 2 * 1024 * 1024; // < 2MB
  }, [effectData]);

  return (
    <div className="admin-gift-preview-panel">
      {/* ── Card 1: Thumbnail Preview ── */}
      <div className="admin-gift-preview-card admin-gift-preview-card--thumb">
        <div className="admin-gift-preview-header">
          <span className="admin-gift-preview-header-title">
            Thumbnail Preview
          </span>
          <ImageIcon className="w-3.5 h-3.5 text-text-muted" />
        </div>

        <div className="admin-gift-preview-thumb-stage">
          {imagePreviewUrl ? (
            <img
              src={imagePreviewUrl}
              alt="Gift thumbnail"
              className="admin-gift-preview-thumb-img"
            />
          ) : (
            <div className="admin-gift-preview-placeholder">
              <ImageIcon className="admin-gift-preview-placeholder-icon" />
              <span className="admin-gift-preview-placeholder-text">
                Upload a thumbnail image
              </span>
            </div>
          )}
        </div>

        {/* Gift Info Summary */}
        <div className="admin-gift-preview-info">
          <span
            className={`admin-gift-preview-info-badge admin-gift-tier-badge ${TIER_BADGE_CLASS[tier] || TIER_BADGE_CLASS.BASIC}`}
          >
            {tier}
          </span>
          <h3 className="admin-gift-preview-info-name">{displayName}</h3>
          <div className="admin-gift-preview-info-meta">
            <span className="admin-gift-preview-info-price">
              <span
                className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold"
                style={{
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  color: "#fff",
                }}
              >
                ₿
              </span>
              {displayPrice} Coins
            </span>
          </div>
        </div>
      </div>

      {/* ── Card 2: Animation Preview ── */}
      <div className="admin-gift-preview-card admin-gift-preview-card--anim">
        <div className="admin-gift-preview-header">
          <span className="admin-gift-preview-header-title">
            Animation Preview
          </span>
          <div className="admin-gift-preview-dots">
            <span className="admin-gift-preview-dot admin-gift-preview-dot--red" />
            <span className="admin-gift-preview-dot admin-gift-preview-dot--yellow" />
            <span className="admin-gift-preview-dot admin-gift-preview-dot--green" />
          </div>
        </div>

        {/* Lottie Stage */}
        <div className="admin-gift-preview-stage">
          {effectData ? (
            <div className="admin-gift-preview-lottie">
              <Lottie
                lottieRef={lottieRef}
                animationData={effectData}
                loop={true}
                autoplay={true}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          ) : (
            <div className="admin-gift-preview-placeholder">
              <GiftIcon className="admin-gift-preview-placeholder-icon" />
              <span className="admin-gift-preview-placeholder-text">
                Upload a Lottie file to preview
              </span>
            </div>
          )}
        </div>

        {/* Controls */}
        {effectData && (
          <div className="admin-gift-preview-controls">
            <div className="admin-gift-preview-loop">
              <span className="admin-gift-preview-loop-label">
                Animation Loop
              </span>
              <span className="admin-gift-preview-loop-status">Enabled</span>
            </div>

            <div className="admin-gift-preview-progress">
              <div
                className="admin-gift-preview-progress-bar"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="admin-gift-preview-actions">
              <button
                type="button"
                className="admin-gift-preview-action-btn"
                onClick={handleRestart}
              >
                <RotateCcw className="w-4 h-4" />
                Restart
              </button>
              <button
                type="button"
                className="admin-gift-preview-action-btn"
                onClick={handleCycleSpeed}
              >
                <Timer className="w-4 h-4" />
                {currentSpeed}x Speed
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        {effectData && (
          <div className="admin-gift-preview-stats">
            <h4 className="admin-gift-preview-stats-title">
              Optimization Stats
            </h4>
            <div className="admin-gift-preview-stats-row">
              <span className="admin-gift-preview-stats-label">
                Estimated File Size
              </span>
              <span
                className={`admin-gift-preview-stats-value ${isSafeSize ? "admin-gift-preview-stats-value--safe" : ""}`}
              >
                {estimatedFileSize} {isSafeSize ? "(Safe)" : "(Large)"}
              </span>
            </div>
            <div className="admin-gift-preview-stats-row">
              <span className="admin-gift-preview-stats-label">
                Playback Speed
              </span>
              <span className="admin-gift-preview-stats-value">
                {currentSpeed}x
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
