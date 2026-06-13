import { memo } from "react";
import { Radio, Eye, Clock } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

interface LiveNowSectionProps {
  title?: string;
  game?: string;
  viewers?: number;
  durationMinutes?: number;
}

const formatViewers = (n: number): string => {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
};

const formatDuration = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

export const LiveNowSection = memo(
  ({
    title = "Epic Weekend Tournament Finals!",
    game = "CyberArena 2077",
    viewers = 45500,
    durationMinutes = 134,
  }: LiveNowSectionProps) => {
    return (
      <div className="w-full mb-10">
        <SectionHeading title="Live Now" showDot />

        <div className="w-full rounded-2xl overflow-hidden border border-border bg-surface shadow-sm">
          {/* Video placeholder */}
          <div className="relative w-full aspect-video bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center overflow-hidden">
            {/* Abstract animated bg */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-brand/30 blur-[80px] animate-pulse-slow" />
              <div
                className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-orange-500/20 blur-[60px] animate-pulse-slow"
                style={{ animationDelay: "1s" }}
              />
            </div>

            {/* Center icon */}
            <div className="relative z-10 flex flex-col items-center gap-3 text-white/40">
              <Radio className="w-16 h-16 stroke-1" />
              <span className="text-sm font-medium tracking-widest uppercase">
                Live Preview
              </span>
            </div>

            {/* Overlay badges */}
            <div className="absolute top-4 left-4 flex items-center gap-2 z-20">
              <div className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg shadow-red-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                LIVE
              </div>
              <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1 rounded-full">
                <Eye className="w-3 h-3" />
                {formatViewers(viewers)}
              </div>
            </div>

            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1 rounded-full z-20">
              <Clock className="w-3 h-3" />
              {formatDuration(durationMinutes)}
            </div>
          </div>

          {/* Stream info */}
          <div className="px-5 py-4 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-text-main line-clamp-1">
                {title}
              </h3>
              <p className="text-sm text-text-muted mt-0.5">
                {game} • Live for {formatDuration(durationMinutes)}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
              </span>
              <span className="text-xs font-bold text-red-500 uppercase tracking-wide">
                Live
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

LiveNowSection.displayName = "LiveNowSection";
