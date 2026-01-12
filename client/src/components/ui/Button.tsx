import { ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      isLoading = false,
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    let btnClass = "btn btn-md group";

    if (fullWidth) btnClass += " btn-full";

    switch (variant) {
      case "primary":
        btnClass += " btn-primary";
        break;
      case "secondary":
        btnClass += " btn-secondary";
        break;
      case "outline":
        btnClass += " btn-outline";
        break;
      case "ghost":
        btnClass += " btn-ghost";
        break;
      case "danger":
        btnClass += " btn-danger";
        break;
    }

    return (
      <button
        ref={ref}
        className={`${btnClass} ${className}`}
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
          className={`flex items-center gap-2 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
        >
          {children}
        </span>

        {variant === "primary" && !isLoading && !disabled && (
          <div className="btn-primary-shine group-hover:animate-[shimmer_1.5s_infinite]"></div>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
