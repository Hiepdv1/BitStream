"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Edit2,
  Ban,
  Trash2,
  CheckCircle,
  VolumeX,
  HelpCircle,
} from "lucide-react";
import { Gift, GiftTier } from "../../types/gift";
import { SideDrawer } from "@/components/ui/SideDrawer";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { Button } from "@/components/ui/Button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import { useConfirmStore } from "@/hooks/useConfirm";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

interface GiftDetailDrawerProps {
  gift: Gift | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (id: string) => void;
  onToggleActive?: (id: string, active: boolean) => Promise<void> | void;
  onDelete?: (id: string) => Promise<void> | void;
  handleUpdateGiftSettings: (
    id: string,
    is_chat_mode: boolean | null,
    is_stream_mode: boolean | null,
  ) => Promise<void> | void;
}

const TIER_BADGE_CLASS: Record<string, string> = {
  BASIC: "admin-gift-tier-badge--basic",
  RARE: "admin-gift-tier-badge--rare",
  EPIC: "admin-gift-tier-badge--epic",
  LEGENDARY: "admin-gift-tier-badge--legendary",
};

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

export function GiftDetailDrawer({
  gift,
  isOpen,
  onClose,
  onEdit,
  onToggleActive,
  onDelete,
  handleUpdateGiftSettings,
}: GiftDetailDrawerProps) {
  const lottieRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(0.5);
  const [effectData, setEffectData] = useState<any>(null);

  const { confirm } = useConfirmStore();

  const urls = useMemo(
    () => ({
      effect: getAssetUrl(gift?.effect_url, "effects"),
      sound: getAssetUrl(gift?.sound_url, "sounds"),
      image: getAssetUrl(gift?.image_url, "images"),
    }),
    [gift],
  );

  useEffect(() => {
    let isMounted = true;

    if (!isOpen || !gift) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      return;
    }

    setIsPlaying(true);
    setSpeed(1);
    setEffectData(null);

    // Fetch Lottie JSON
    if (urls.effect) {
      fetch(urls.effect)
        .then((res) => res.json())
        .then((data) => {
          if (isMounted) setEffectData(data);
        })
        .catch((err) => console.error("Lottie fetch error:", err));
    }

    // Setup Audio
    if (urls.sound) {
      const audio = new Audio(urls.sound);
      audio.loop = true;
      audio.volume = volume;
      audioRef.current = audio;
      audio.play().catch(() => console.log("Autoplay prevented by browser"));
    }

    return () => {
      isMounted = false;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [urls.effect, urls.sound, isOpen, gift]);

  if (!gift) return null;

  // --- Handlers ---
  const handleTogglePlay = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);

    if (nextState) {
      lottieRef.current?.play();
      audioRef.current?.play();
    } else {
      lottieRef.current?.pause();
      audioRef.current?.pause();
    }
  };

  const handleRestart = () => {
    lottieRef.current?.goToAndPlay(0);
    if (audioRef.current) audioRef.current.currentTime = 0;
    setIsPlaying(true);
  };

  const handleChangeSpeed = (newSpeed: number) => {
    setSpeed(newSpeed);
    lottieRef.current?.setSpeed(newSpeed);
    if (audioRef.current) audioRef.current.playbackRate = newSpeed;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  const handleDisableClick = async () => {
    if (!onToggleActive) return;
    if (gift.is_active) {
      await onToggleActive(gift.id, false);
    } else {
      await onToggleActive(gift.id, true);
    }
  };

  const handleDeleteClick = async () => {
    if (!onDelete) return;
    const isConfirmed = await confirm({
      title: "Delete Gift?",
      description: `This action cannot be undone. The ${gift.name} gift will be permanently removed.`,
      variant: "danger",
      requireInput: "DELETE",
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => await onDelete(gift.id),
    });
    if (isConfirmed) onClose();
  };

  const handleChangeMode = async (
    mode: "chat" | "stream",
    checked: boolean,
  ) => {
    if (gift.tier === GiftTier.BASIC && mode === "stream") {
      return;
    }

    if (mode === "chat") {
      await handleUpdateGiftSettings(gift.id, checked, null);
    } else {
      await handleUpdateGiftSettings(gift.id, null, checked);
    }
  };

  // --- Nodes ---
  const titleNode = (
    <div className="flex items-center gap-2">
      <span>{gift.name}</span>
      <span
        className={`admin-gift-tier-badge text-sm ${TIER_BADGE_CLASS[gift.tier] || TIER_BADGE_CLASS.BASIC}`}
      >
        {gift.tier}
      </span>
    </div>
  );

  const footerNode = (
    <div className="flex gap-3">
      <Button
        variant="outline"
        className="flex-1 font-medium text-sm text-text-main border-border hover:bg-surface-hover shadow-sm"
        onClick={() => onEdit?.(gift.id)}
      >
        <Edit2 className="w-4 h-4 mr-2" /> Edit
      </Button>
      <Button
        variant="outline"
        className={`flex-1 font-medium text-sm ${gift.is_active ? "text-warning border-warning/20 hover:bg-warning/10" : "text-success border-success/20 hover:bg-success/10"}`}
        onClick={handleDisableClick}
      >
        {gift.is_active ? (
          <Ban className="w-4 h-4 mr-2" />
        ) : (
          <CheckCircle className="w-4 h-4 mr-2" />
        )}
        {gift.is_active ? "Disable" : "Enable"}
      </Button>
      <Button
        variant="danger"
        className="flex-1 font-medium text-sm text-error bg-error/10 hover:bg-error/20 border-error/20"
        onClick={handleDeleteClick}
      >
        <Trash2 className="w-4 h-4 mr-2" /> Delete
      </Button>
    </div>
  );

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={titleNode}
      subtitle="Configure asset properties & behavior"
      footer={footerNode}
      width="max-w-[550px]"
    >
      <div className="space-y-8">
        {/* Section: Advanced Gift Preview */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 bg-brand rounded-full" />
            <h3 className="text-[11px] font-bold tracking-widest text-text-muted uppercase">
              Advanced Gift Preview
            </h3>
          </div>

          <div className="space-y-4">
            {/* Stage */}
            <div className="relative bg-[#000000] rounded-2xl aspect-video overflow-hidden border border-border flex items-center justify-center shadow-inner">
              {effectData ? (
                <Lottie
                  lottieRef={lottieRef}
                  animationData={effectData}
                  loop={true}
                  autoplay={true}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-text-muted">
                  <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs">Loading assets...</p>
                </div>
              )}

              {gift.is_chatMode && (
                <div className="absolute bottom-4 left-4 bg-surface/90 backdrop-blur-sm border border-border rounded-xl p-3 pr-5 flex items-center gap-3 animate-in slide-in-from-bottom-2 fade-in">
                  <div className="w-6 h-6 rounded-full bg-brand/20 border border-brand/50 shrink-0" />
                  <p className="text-xs text-text-main">
                    <span className="text-brand font-semibold">Admin:</span>{" "}
                    Just sent a {gift.name}!
                  </p>
                </div>
              )}
            </div>

            {/* Play Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  className="cursor-pointer w-10 h-10 rounded-xl bg-background border border-border hover:bg-surface-hover shadow-sm flex items-center justify-center transition-colors text-text-main"
                  onClick={handleTogglePlay}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4 ml-0.5" />
                  )}
                </button>
                <button
                  className="cursor-pointer w-10 h-10 rounded-xl bg-background border border-border hover:bg-surface-hover shadow-sm flex items-center justify-center transition-colors text-text-main"
                  onClick={handleRestart}
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <div className="flex bg-background border border-border rounded-xl p-1 ml-2 shadow-sm">
                  {[0.5, 1, 1.5, 2].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleChangeSpeed(s)}
                      className={`cursor-pointer px-3 py-1.5 outline-none border-none rounded-lg text-xs font-medium transition-colors ${speed === s ? "bg-brand text-white shadow-sm border border-border/50" : "text-text-muted hover:text-text-main hover:bg-brand/20"}`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* View Modes */}
            <div className="flex gap-4">
              <div className="flex-1 bg-background shadow-xs border border-border rounded-xl p-4 flex items-center justify-between">
                <span className="text-xs font-bold tracking-widest text-text-muted uppercase">
                  Chat Mode
                </span>
                <ToggleSwitch
                  id="chatMode"
                  checked={gift.is_chatMode}
                  onChange={async (checked) =>
                    await handleChangeMode("chat", checked)
                  }
                />
              </div>
              <div className="flex-1 bg-background shadow-xs border border-border rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold tracking-widest text-text-muted uppercase">
                    Stream Mode
                  </span>
                  {gift.tier === GiftTier.BASIC && (
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="w-4 h-4 text-warning cursor-help hover:text-warning/80 transition-colors" />
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>Basic tier gifts do not support Stream Mode.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <ToggleSwitch
                  id="streamMode"
                  checked={gift.is_streamMode}
                  disabled={gift.tier === GiftTier.BASIC}
                  onChange={async (checked) =>
                    await handleChangeMode("stream", checked)
                  }
                />
              </div>
            </div>

            {/* Properties */}
            <div className="bg-background shadow-xs border border-border rounded-xl p-4 flex items-center divide-x divide-border">
              <div className="flex-1 px-4 first:pl-0 flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase">
                  Duration
                </span>
                <span className="text-sm font-semibold text-text-main">
                  {gift.duration}s
                </span>
              </div>
              <div className="flex-1 px-4 flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase">
                  Shake Level
                </span>
                <span className="text-sm font-bold text-error">
                  {gift.shake_level || "HIGH"}
                </span>
              </div>
              <div className="flex-1 px-4 last:pr-0 flex items-center gap-3">
                {urls.sound ? (
                  <Volume2 className="w-4 h-4 text-text-muted shrink-0" />
                ) : (
                  <VolumeX className="w-4 h-4 text-text-muted shrink-0" />
                )}
                {urls.sound ? (
                  <div className="flex-1 flex items-center">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-full h-1 bg-surface rounded-full appearance-none outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand"
                      style={{
                        backgroundImage:
                          "linear-gradient(var(--color-brand), var(--color-brand))",
                        backgroundSize: `${volume * 100}% 100%`,
                        backgroundRepeat: "no-repeat",
                      }}
                    />
                  </div>
                ) : (
                  <span className="text-[10px] text-text-muted italic truncate">
                    No Audio
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Section: Basic Info Overview */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 bg-brand rounded-full" />
            <h3 className="text-[11px] font-bold tracking-widest text-text-muted uppercase">
              Basic Information
            </h3>
          </div>

          <div className="bg-background shadow-sm border border-border rounded-xl p-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-surface border border-border shrink-0 flex items-center justify-center p-2">
              {urls.image ? (
                <img
                  src={urls.image}
                  alt={gift.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full bg-linear-to-tr from-brand to-accent rounded-lg opacity-20" />
              )}
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-text-main mb-1 tracking-wide font-heading">
                {gift.name}
              </h4>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-warning">
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold bg-warning text-white">
                    ₿
                  </span>
                  {gift.price.toLocaleString()} Coins
                </div>
                <div className="text-xs text-text-muted bg-surface border border-border px-2 py-0.5 rounded-lg">
                  ID: {gift.id.slice(0, 8).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </SideDrawer>
  );
}
