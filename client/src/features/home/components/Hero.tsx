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
        <div className="absolute inset-0 bg-linear-to-r from-black via-black/80 to-transparent z-10" />
        <div className="absolute inset-0 hero-gradient-overlay z-10 mix-blend-overlay opacity-50" />
      </div>

      <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 pt-20 h-full flex flex-col justify-center">
        <div className="max-w-3xl space-y-8 animate-in slide-in-from-left-10 fade-in duration-700">
          {isLive && (
            <div className="inline-flex items-center space-x-2 bg-red-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg shadow-red-600/20 backdrop-blur-sm animate-pulse">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
              </span>
              <span className="tracking-wide">LIVE NOW</span>
            </div>
          )}

          <h1 className="text-5xl sm:text-7xl md:text-8xl font-display font-black leading-none tracking-tight text-white drop-shadow-2xl">
            {title}
          </h1>

          <p className="text-lg sm:text-2xl text-zinc-300 line-clamp-3 font-medium max-w-2xl leading-relaxed drop-shadow-md">
            {description}
          </p>

          <div className="flex flex-wrap gap-6 pt-4">
            <Button className="h-16 px-10 rounded-full text-xl font-bold bg-white text-black hover:bg-white/90 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] transition-all hover:scale-105 active:scale-95">
              <Play className="mr-3 h-6 w-6 fill-black" />
              Watch Now
            </Button>
            <Button
              variant="outline"
              className="h-16 px-10 rounded-full text-xl font-semibold bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/20 transition-all hover:scale-105 active:scale-95"
            >
              <Info className="mr-3 h-6 w-6" />
              More Info
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
