"use client";

import { InputHTMLAttributes, forwardRef, useState, useRef, useEffect } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { HASHTAG_REGEX } from "@/constants/regex";

const highlightHashtags = (text: string) => {
  if (!text) return null;
  const parts = text.split(HASHTAG_REGEX).filter(Boolean);
  return parts.map((part, i) => {
    if (part.startsWith("#")) {
      return (
        <span key={`${part}-${i}`} className="text-brand font-bold underline">
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

export const inputVariants = cva(
  "!caret-current !dark:caret-white w-full outline-none transition-all duration-200 font-medium text-text-main text-sm rounded-xl border-2 border-border",
  {
    variants: {
      variant: {
        default: "input-field peer",
        surface: "h-11 px-4 bg-surface",
        admin: "admin-gift-form-input",
        ghost: "bg-transparent border-transparent focus:bg-surface/50",
      },
      hasError: {
        true: "",
        false: "",
      },
      isNumber: {
        true: "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
      },
    },
    compoundVariants: [
      {
        variant: "default",
        hasError: true,
        class: "input-field-error",
      },
      {
        variant: "default",
        hasError: false,
        class: "not-placeholder-shown:border-brand",
      },
      {
        variant: "surface",
        hasError: true,
        class: "border-error focus:border-error",
      },
      {
        variant: "surface",
        hasError: false,
        class:
          "focus:border-brand focus:ring-4 focus:ring-brand/20 hover:border-text-muted/30",
      },
      {
        variant: "admin",
        hasError: true,
        class: "admin-gift-form-input--error",
      },
    ],
    defaultVariants: {
      variant: "default",
      hasError: false,
    },
  },
);

export interface InputProps
  extends
    Omit<InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  enableHashtags?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      type,
      label,
      placeholder,
      required,
      error,
      className,
      icon,
      enableHashtags,
      variant = "default",
      onChange,
      onScroll,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    const togglePasswordVisibility = () => {
      setShowPassword((prev) => !prev);
    };

    const [internalValue, setInternalValue] = useState(
      (props.value as string) || (props.defaultValue as string) || "",
    );

    useEffect(() => {
      if (props.value !== undefined) {
        setInternalValue(props.value as string);
      }
    }, [props.value]);

    const overlayRef = useRef<HTMLDivElement>(null);
    const internalRef = useRef<HTMLInputElement>(null);
    const scrollPosRef = useRef(0);
    const isBlurring = useRef(false);

    const handleScroll = (e: React.UIEvent<HTMLInputElement>) => {
      if (isBlurring.current) {
        if (e.currentTarget.scrollLeft !== scrollPosRef.current) {
          e.currentTarget.scrollLeft = scrollPosRef.current;
          if (overlayRef.current) {
            overlayRef.current.scrollLeft = scrollPosRef.current;
          }
        }
        return;
      }
      scrollPosRef.current = e.currentTarget.scrollLeft;
      if (overlayRef.current) {
        overlayRef.current.scrollLeft = e.currentTarget.scrollLeft;
      }
      onScroll?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (enableHashtags) {
        isBlurring.current = true;
        setTimeout(() => {
          isBlurring.current = false;
        }, 100);
      }
      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(e.target.value);
      onChange?.(e);
    };

    const uniqueTags =
      enableHashtags && internalValue
        ? Array.from(new Set(internalValue.match(/#\w+/g) || []))
        : [];

    return (
      <div className="relative">
        <div className="relative">
          {enableHashtags && (
            <div
              className={cn(
                inputVariants({
                  variant,
                  hasError: !!error,
                  isNumber: type === "number",
                }),
                "absolute inset-0 z-0 pointer-events-none flex items-center border-transparent text-transparent! bg-transparent!",
              )}
              aria-hidden="true"
            >
              <div
                ref={overlayRef}
                className="w-full overflow-hidden whitespace-pre text-zinc-900 dark:text-zinc-100"
              >
                {internalValue ? (
                  highlightHashtags(internalValue)
                ) : (
                  <span
                    className={cn(
                      "font-normal",
                      variant === "default"
                        ? "text-transparent"
                        : "text-text-muted/50",
                    )}
                  >
                    {placeholder ||
                      (variant === "default" && label ? " " : undefined)}
                  </span>
                )}
              </div>
            </div>
          )}
          <input
            ref={(node) => {
              internalRef.current = node;
              if (typeof ref === "function") {
                ref(node);
              } else if (ref) {
                (
                  ref as React.MutableRefObject<HTMLInputElement | null>
                ).current = node;
              }
            }}
            id={id}
            type={inputType}
            placeholder={
              placeholder || (variant === "default" && label ? " " : undefined)
            }
            required={required}
            className={cn(
              inputVariants({
                variant,
                hasError: !!error,
                isNumber: type === "number",
              }),
              enableHashtags &&
                "bg-transparent! text-transparent! placeholder-transparent! caret-zinc-900! dark:caret-white relative z-10",
              className,
            )}
            {...props}
            onChange={handleChange}
            onScroll={handleScroll}
            onBlur={handleBlur}
          />

          {label && variant === "default" && (
            <label
              htmlFor={id}
              className={cn(
                "input-label rounded-xl bg-none bg-transparent peer-focus:top-0 peer-[:not(:placeholder-shown)]:top-0 peer-focus:text-xs top-1/2 -translate-y-1/2 peer-placeholder-shown:text-base text-xs px-2 font-semibold peer-placeholder-shown:text-text-muted",
                error
                  ? "peer-focus:bg-error peer-[:not(:placeholder-shown)]:bg-error text-white peer-focus:text-white"
                  : "peer-focus:text-brand text-brand peer-focus:bg-black/90 peer-[:not(:placeholder-shown)]:bg-black/90",
              )}
            >
              {label}
              {required && <span className="input-label-required">*</span>}
            </label>
          )}

          {isPassword && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="input-icon-wrapper"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          )}

          {icon && !isPassword && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
              {icon}
            </div>
          )}
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
          <div className="input-error-msg">
            <svg
              className="w-4 h-4 text-error shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <p className="font-medium">{error}</p>
          </div>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
