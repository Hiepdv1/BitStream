import { ButtonHTMLAttributes, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva("btn group", {
  variants: {
    variant: {
      primary: "btn-primary",
      secondary: "btn-secondary",
      outline: "btn-outline",
      ghost: "btn-ghost",
      danger: "btn-danger",
    },
    size: {
      xs: "btn-xs",
      sm: "btn-sm",
      md: "btn-md",
      lg: "btn-lg",
    },
    fullWidth: {
      true: "btn-full",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
    fullWidth: false,
  },
});

export interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      fullWidth = false,
      isLoading = false,
      children,
      disabled,
      type = "button",
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-xl">
            <svg
              className="w-5 h-5 animate-spin text-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        )}

        <span
          className={cn(
            "flex items-center",
            isLoading ? "opacity-0" : "opacity-100",
          )}
        >
          {children}
        </span>

        {variant === "primary" && !isLoading && !disabled && (
          <div className="btn-primary-shine group-hover:animate-[shimmer_1.5s_infinite]"></div>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
