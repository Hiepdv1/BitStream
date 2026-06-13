import React, { useState } from "react";

interface ExpandableTextProps {
  children: React.ReactNode;
  maxLines?: number;
  className?: string;
}

export const ExpandableText: React.FC<ExpandableTextProps> = ({
  children,
  maxLines = 5,
  className = "text-zinc-700 dark:text-zinc-300 text-sm",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!children) return null;

  return (
    <div className="relative w-full flex flex-col items-center ">
      <div
        style={{
          display: "-webkit-box",
          WebkitLineClamp: isExpanded ? "unset" : maxLines,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
        className={`${className} whitespace-pre-line leading-relaxed w-full`}
      >
        {children}
      </div>
      <div className="absolute left-1/2 -translate-x-1/2 translate-y-1/2 bottom-0 mt-3 dynamic-btn-wrapper w-full flex justify-center">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-4 py-1.5 text-xs rounded-full 
                     bg-zinc-100 text-zinc-600 hover:bg-zinc-200
                     dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700/80
                     transition-all border border-zinc-200 dark:border-zinc-700
                     focus:outline-none shadow-sm cursor-pointer font-bold"
        >
          {isExpanded ? "Show less" : "Show more"}
        </button>
      </div>
    </div>
  );
};
