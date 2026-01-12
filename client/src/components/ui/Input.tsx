"use client";

import { InputHTMLAttributes, forwardRef, useState } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
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
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    const togglePasswordVisibility = () => {
      setShowPassword((prev) => !prev);
    };

    return (
      <div className={`input-group ${className ?? ""}`}>
        <div className="relative">
          <input
            ref={ref}
            id={id}
            type={inputType}
            placeholder={placeholder || " "}
            required={required}
            className={`input-field  peer ${
              error ? "input-field-error" : "not-placeholder-shown:border-brand"
            }`}
            {...props}
          />

          {label && (
            <label
              htmlFor={id}
              className={`${
                error
                  ? "peer-focus:bg-error peer-[:not(:placeholder-shown)]:bg-error text-white peer-focus:text-white"
                  : "peer-focus:text-brand text-brand peer-focus:bg-black/90 peer-[:not(:placeholder-shown)]:bg-black/90"
              } input-label rounded-xl bg-none bg-transparent peer-focus:top-0 peer-[:not(:placeholder-shown)]:top-0 peer-focus:text-xs top-1/2 -translate-y-1/2 peer-placeholder-shown:text-base text-xs px-2 font-semibold peer-placeholder-shown:text-text-muted`}
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
            <p>{error}</p>
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
