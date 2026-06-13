"use client";

import { Button } from "@/components/ui/Button";
import { Play, Plus } from "lucide-react";
import { memo } from "react";

interface HeroProps {
  title: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  isLive?: boolean;
}

const Hero = ({
  title,
  description,
  imageUrl,
  videoUrl,
  isLive = false,
}: HeroProps) => {
  return (
    <div className="relative w-full h-[60vh] sm:h-[70vh] flex items-center overflow-hidden rounded-2xl group">
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
        <div className="absolute inset-0 bg-linear-to-r from-white via-white/80 dark:from-black dark:via-black/80 to-transparent z-10" />
      </div>

      <div className="relative z-20 h-full flex flex-col justify-end pb-16 px-8 sm:px-12 lg:px-16 w-full">
        <div className="max-w-3xl space-y-4 animate-in slide-in-from-bottom-8 fade-in duration-700">
          <div className="inline-flex items-center space-x-2 bg-brand text-white px-3 py-1 rounded-sm text-[10px] font-black tracking-widest uppercase shadow-lg">
            <span>NEW PREMIERE</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-display font-black leading-[1.1] tracking-tight dark:text-white text-zinc-700 drop-shadow-2xl">
            {title}
          </h1>

          <p className="text-base sm:text-lg dark:text-zinc-300 text-zinc-500 font-medium max-w-xl leading-relaxed drop-shadow-md">
            {description}
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <Button variant="primary" size="md" className="rounded-md">
              <Play className="mr-2 h-4 w-4 fill-white" />
              Watch Now
            </Button>
            <Button
              variant="secondary"
              size="md"
              className="rounded-md backdrop-blur-md"
            >
              <Plus className="mr-2 h-4 w-4" />
              My List
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(Hero);
