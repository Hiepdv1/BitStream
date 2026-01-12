"use client";

import { Button } from "@/components/ui/Button";
import { Play, Info } from "lucide-react";

interface HeroProps {
  title: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  isLive?: boolean;
}

export function Hero({
  title,
  description,
  imageUrl,
  videoUrl,
  isLive = false,
}: HeroProps) {
  return (
    <div className="relative w-full h-[85vh] flex items-center overflow-hidden bg-background">
      <div className="absolute inset-0 z-0">
        {videoUrl ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover dark:opacity-60 opacity-90 transition-opacity duration-500"
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        ) : (
          <div
            className="w-full h-full bg-cover bg-center transition-transform duration-1000 hover:scale-105"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
        )}
        <div className="absolute inset-0 bg-linear-to-r from-background via-background/80 to-transparent z-10" />
        <div className="absolute inset-0 hero-gradient-overlay z-10" />
      </div>

      <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="max-w-2xl space-y-6 animate-in slide-in-from-left-10 fade-in duration-700">
          {isLive && (
            <div className="inline-flex items-center space-x-2 bg-red-600/90 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg backdrop-blur-xs live-pulse">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <span>LIVE NOW</span>
            </div>
          )}

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-bold leading-tight text-text-main hero-text-shadow">
            {title}
          </h1>

          <p className="text-lg sm:text-xl text-text-muted line-clamp-3 font-medium max-w-lg hero-text-shadow">
            {description}
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <Button className="h-14 px-8 rounded-xl text-lg font-bold bg-brand hover:bg-brand-hover text-white shadow-lg shadow-brand/25 transition-transform hover:-translate-y-1">
              <Play className="mr-2 h-5 w-5 fill-current" />
              Watch Now
            </Button>
            <Button
              variant="outline"
              className="h-14 px-8 rounded-xl text-lg font-semibold bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 transition-all hover:scale-105"
            >
              <Info className="mr-2 h-5 w-5" />
              More Info
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
