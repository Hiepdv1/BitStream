"use client";

import { cn } from "@/lib/utils";
import {
  TextareaHTMLAttributes,
  forwardRef,
  useState,
  useRef,
  useEffect,
} from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { HASHTAG_REGEX } from "@/constants/regex";

const highlightHashtags = (text: string) => {
  if (!text) return null;
  const parts = text.split(HASHTAG_REGEX).filter(Boolean);

  return parts.map((part, i) => {
    if (part.startsWith("#")) {
      return (
        <span key={`${part}-${i}`} className="text-brand font-medium underline">
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

export const textareaVariants = cva(
  "w-full outline-none transition-all duration-200 font-medium text-sm rounded-xl py-3 px-4 resize-none disabled:opacity-50 disabled:cursor-not-allowed scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20 scrollbar-track-transparent border-2 border-border",
  {
    variants: {
      variant: {
        default: "bg-transparent text-text-main peer",
        surface: "bg-surface/50 text-white placeholder-text-muted",
        ghost: "bg-transparent border-transparent focus:bg-surface/50",
      },
      hasError: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "default",
        hasError: true,
        class: "border-error focus:border-error",
      },
      {
        variant: "default",
        hasError: false,
        class: "border-border focus:border-brand",
      },
      {
        variant: "surface",
        hasError: true,
        class: "border-error focus:border-error focus:ring-error",
      },
      {
        variant: "surface",
        hasError: false,
        class:
          "focus:border-brand focus:ring-4 focus:ring-brand/20 hover:border-text-muted/30",
      },
    ],
    defaultVariants: {
      variant: "surface",
      hasError: false,
    },
  },
);

export interface TextareaProps
  extends
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  label?: string;
  error?: string;
  enableHashtags?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      id,
      label,
      placeholder,
      required,
      className,
      variant = "surface",
      enableHashtags,
      error,
      onChange,
      onScroll,
      ...props
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = useState(
      (props.value as string) || (props.defaultValue as string) || "",
    );
    const overlayRef = useRef<HTMLDivElement>(null);
    const internalRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
      if (props.value !== undefined) {
        setInternalValue(props.value as string);
      }
    }, [props.value]);

    const adjustHeight = () => {
      if (!enableHashtags) return;
      const el = internalRef.current;
      if (!el) return;

      el.style.height = "auto";
      el.style.height = `${el.scrollHeight + 4}px`;
    };

    useEffect(() => {
      adjustHeight();
      window.addEventListener("resize", adjustHeight);
      return () => window.removeEventListener("resize", adjustHeight);
    }, [internalValue, enableHashtags]);

    const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
      if (overlayRef.current) {
        overlayRef.current.scrollTop = e.currentTarget.scrollTop;
        overlayRef.current.scrollLeft = e.currentTarget.scrollLeft;
      }
      onScroll?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInternalValue(e.target.value);
      onChange?.(e);
    };

    const uniqueTags = enableHashtags && internalValue
      ? Array.from(new Set(internalValue.match(/#\w+/g) || []))
      : [];

    return (
      <div className="relative">
        {label && (
          <label
            htmlFor={id}
            className="block text-[10px] uppercase font-bold tracking-widest text-text-muted mb-2"
          >
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}

        <div className="relative">
          {enableHashtags && (
            <div
              ref={overlayRef}
              className={cn(
                textareaVariants({ variant, hasError: !!error }),
                "absolute inset-0 z-0 text-zinc-900 dark:text-zinc-100 pointer-events-none overflow-hidden border-transparent bg-transparent!",
                "wrap-break-word whitespace-pre-wrap",
              )}
              aria-hidden="true"
            >
              {internalValue ? (
                <>
                  {highlightHashtags(internalValue)}
                  {internalValue.endsWith("\n") && <br />}
                </>
              ) : (
                <span className="text-text-muted/50 font-normal">
                  {placeholder}
                </span>
              )}
            </div>
          )}
          <textarea
            ref={(node) => {
              internalRef.current = node;
              if (typeof ref === "function") {
                ref(node);
              } else if (ref) {
                (
                  ref as React.MutableRefObject<HTMLTextAreaElement | null>
                ).current = node;
              }
            }}
            id={id}
            placeholder={placeholder}
            required={required}
            className={cn(
              textareaVariants({ variant, hasError: !!error }),
              enableHashtags &&
                "bg-transparent! text-transparent! placeholder-transparent! caret-zinc-900! dark:caret-white! relative z-10 overflow-hidden resize-none",
              className,
            )}
            {...props}
            onChange={handleChange}
            onScroll={handleScroll}
          />
        </div>

        {uniqueTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1.5">
            {uniqueTags.map((tag, i) => (
              <span
                key={i}
                className="text-xs font-semibold text-brand bg-brand/10 px-2 py-0.5 rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {error && (
          <div className="mt-1.5 flex items-start gap-1">
            <svg
              className="w-3.5 h-3.5 text-error shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-xs text-error font-medium">{error}</p>
          </div>
        )}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";
