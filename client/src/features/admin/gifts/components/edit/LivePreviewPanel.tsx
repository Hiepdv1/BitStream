"use client";

import { useEffect, useMemo, useRef, useState, memo } from "react";
import dynamic from "next/dynamic";
import { Play, Ban } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const getAssetUrl = (
  path: string | undefined | null,
  type: "effects" | "sounds" | "images",
) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const baseUrl = process.env.NEXT_PUBLIC_ASSET_URL || "";
  const cleanPath = path.startsWith("/")
    ? path
    : `/assets/gift/${type}/${path}`;
  return `${baseUrl}${cleanPath}`;
};

interface LivePreviewPanelProps {
  effectUrl: string | null;
  imageUrl: string;
  soundUrl: string | null;

  imageFile: File | null;
  effectFile: File | null;
  soundFile: File | null;

  giftName: string;
  price: number;
  duration: number;
  shakeLevel: string;
  chatMode: boolean;
  streamMode: boolean;
  onChatModeChange: (v: boolean) => void;
  onStreamModeChange: (v: boolean) => void;
}

export const LivePreviewPanel = memo(function LivePreviewPanel({
  effectUrl,
  imageUrl,
  soundUrl,
  imageFile,
  effectFile,
  soundFile,
  giftName,
  price,
  duration,
  shakeLevel,
  chatMode,
  streamMode,
  onChatModeChange,
  onStreamModeChange,
}: LivePreviewPanelProps) {
  const [effectData, setEffectData] = useState<any>(null);
  const [isLoadingEffect, setIsLoadingEffect] = useState(false);
  const lottieRef = useRef<any>(null);

  const resolvedEffectUrl = useMemo(() => {
    // Prioritize uploaded file
    if (effectFile) return URL.createObjectURL(effectFile);
    return getAssetUrl(effectUrl, "effects");
  }, [effectUrl, effectFile]);

  const resolvedImageUrl = useMemo(() => {
    if (imageFile) return URL.createObjectURL(imageFile);
    return getAssetUrl(imageUrl, "images");
  }, [imageUrl, imageFile]);

  const resolvedSoundUrl = useMemo(() => {
    if (soundFile) return URL.createObjectURL(soundFile);
    return getAssetUrl(soundUrl, "sounds");
  }, [soundUrl, soundFile]);

  useEffect(() => {
    let isMounted = true;
    setEffectData(null);

    if (resolvedEffectUrl) {
      setIsLoadingEffect(true);
      fetch(resolvedEffectUrl)
        .then((res) => res.json())
        .then((data) => {
          if (isMounted) setEffectData(data);
        })
        .catch((err) => console.error("Could not fetch animation:", err))
        .finally(() => {
          if (isMounted) setIsLoadingEffect(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [resolvedEffectUrl]);

  return (
    <div className="bg-background border border-border shadow-xs rounded-2xl overflow-hidden">
      {/* Stage */}
      <div className="relative bg-black aspect-4/3 flex items-center justify-center">
        <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] font-bold text-white tracking-widest uppercase">
            LIVE PREVIEW
          </span>
        </div>

        {effectData ? (
          <Lottie
            lottieRef={lottieRef}
            animationData={effectData}
            loop={false}
            autoplay
            className="w-3/4 h-3/4 object-contain"
          />
        ) : resolvedImageUrl ? (
          <img
            src={resolvedImageUrl}
            alt={giftName}
            className="max-w-[70%] max-h-[70%] object-contain rounded-lg"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="flex flex-col items-center gap-3 text-white/40">
            {isLoadingEffect ? (
              <>
                <div className="w-7 h-7 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] tracking-widest uppercase font-bold">
                  Loading...
                </p>
              </>
            ) : (
              <p className="text-xs tracking-widest uppercase font-bold">
                No preview available
              </p>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-5 space-y-5">
        <Button
          variant="outline"
          fullWidth
          className="h-11 border-border hover:bg-surface-hover hover:border-brand hover:text-brand transition-colors group text-xs font-bold tracking-widest uppercase cursor-pointer"
          onClick={() => {
            lottieRef.current?.goToAndPlay(0);
            if (resolvedSoundUrl) {
              const audio = new Audio(resolvedSoundUrl);
              audio.volume = 0.5;
              audio.play().catch((e) => console.log("Sound error:", e));
            }
          }}
        >
          <Play className="w-4 h-4 mr-2 group-hover:fill-current" />
          Play Full Preview
        </Button>

        <div className="space-y-3 border-b border-border pb-5">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-text-muted">
              <Ban className="w-4 h-4" /> Preview Chat Mode
            </span>
            <ToggleSwitch
              checked={chatMode}
              onChange={(v) => onChatModeChange(v)}
              id="prevChat"
              disabled
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-text-muted">
              <Play className="w-4 h-4" /> Preview Stream Mode
            </span>
            <ToggleSwitch
              checked={streamMode}
              onChange={(v) => onStreamModeChange(v)}
              id="prevStream"
              disabled
            />
          </div>
          <div className="flex items-center justify-between text-sm pt-1">
            <span className="flex items-center gap-2 text-text-muted">
              ❖ Visual Shake Preview
            </span>
            <Button
              variant="ghost"
              className="text-brand text-[10px] font-bold tracking-widest uppercase border-b border-brand/30 hover:border-brand cursor-pointer transition-colors pb-0.5"
            >
              TEST IMPULSE
            </Button>
          </div>
        </div>

        {/* Quick Info */}
        <div className="space-y-3">
          <h4 className="font-heading font-bold text-sm">Quick Stats</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface rounded-xl p-3 border border-border">
              <div className="text-[10px] font-bold tracking-widest text-text-muted uppercase mb-1">
                Duration
              </div>
              <div className="text-lg font-black text-brand tracking-tight">
                {duration}s
              </div>
            </div>
            <div className="bg-surface rounded-xl p-3 border border-border">
              <div className="text-[10px] font-bold tracking-widest text-text-muted uppercase mb-1">
                Shake
              </div>
              <div className="text-lg font-black text-warning tracking-tight capitalize">
                {shakeLevel}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
