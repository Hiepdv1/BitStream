"use client";

import { useRef } from "react";
import { MoveRight, MoveLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ContentItem {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl: string;
  category?: string;
}

interface ContentSectionProps {
  title: string;
  items: ContentItem[];
  variant?: "poster" | "card" | "wide";
  viewAllLink?: string;
}

export function ContentSection({
  title,
  items,
  variant = "card",
  viewAllLink,
}: ContentSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const getAspectRatio = () => {
    switch (variant) {
      case "poster":
        return "aspect-[2/3]";
      case "wide":
        return "aspect-[16/9]";
      case "card":
      default:
        return "aspect-[4/3]";
    }
  };

  return (
    <section className="py-8 space-y-4">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-text-main to-text-secondary bg-clip-text text-transparent">
          {title}
        </h2>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            onClick={() => scroll("left")}
            className="hidden sm:inline-flex rounded-full hover:bg-surface-hover/50 text-text-secondary w-10 h-10 p-0 items-center justify-center"
          >
            <MoveLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            onClick={() => scroll("right")}
            className="hidden sm:inline-flex rounded-full hover:bg-surface-hover/50 text-text-secondary w-10 h-10 p-0 items-center justify-center"
          >
            <MoveRight className="w-5 h-5" />
          </Button>
          {viewAllLink && (
            <Button
              variant="ghost"
              className="text-brand hover:text-brand-hover hover:bg-brand/10"
            >
              View All
            </Button>
          )}
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto gap-4 sm:gap-6 px-4 sm:px-6 lg:px-8 pb-8 pt-2 scrollbar-hide snap-x section-mask-fade"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((item, idx) => (
          <div
            key={item.id}
            className={`flex-none snap-start media-card-hover group relative cursor-pointer overflow-hidden rounded-2xl bg-surface border border-border shadow-sm dark:shadow-none hover:shadow-xl hover:shadow-brand/10 transition-shadow ${
              variant === "poster" ? "w-40 sm:w-56" : "w-64 sm:w-80"
            }`}
          >
            <div
              className={`relative w-full ${getAspectRatio()} overflow-hidden`}
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: `url(${item.thumbnailUrl})` }}
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

              {item.category && (
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-1 text-xs font-bold bg-white/20 backdrop-blur-md text-white rounded-md border border-white/10">
                    {item.category}
                  </span>
                </div>
              )}
            </div>

            <div className="p-4 space-y-1">
              <h3 className="font-bold text-lg text-text-main line-clamp-1 group-hover:text-brand transition-colors">
                {item.title}
              </h3>
              {item.description && (
                <p className="text-sm text-text-muted line-clamp-2">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
