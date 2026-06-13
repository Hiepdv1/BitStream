import { memo } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface SectionHeadingProps {
  title: string;
  showDot?: boolean;
  viewAllLink?: string;
}

export const SectionHeading = memo(
  ({ title, showDot, viewAllLink }: SectionHeadingProps) => {
    return (
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {showDot && (
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          )}
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            {title}
          </h2>
        </div>
        {viewAllLink && (
          <Link
            href={viewAllLink}
            className="flex items-center gap-1 text-sm font-semibold text-orange-500 hover:text-orange-400 transition-colors"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    );
  },
);

SectionHeading.displayName = "SectionHeading";
