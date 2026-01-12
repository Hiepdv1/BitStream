"use client";

import { ReactNode, useState } from "react";
import { AlertCircle, AlertTriangle, XCircle, RefreshCw } from "lucide-react";

interface ErrorDisplayProps {
  title?: string;
  message: string;
  icon?: ReactNode;
  variant?: "default" | "danger" | "warning";
  fullScreen?: boolean;
  onRetry?: () => void;
  className?: string;
}

export function ErrorDisplay({
  title = "Something went wrong",
  message,
  icon,
  variant = "default",
  fullScreen = false,
  onRetry,
  className = "",
}: ErrorDisplayProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (onRetry) {
      setIsRetrying(true);
      await onRetry();
      setTimeout(() => setIsRetrying(false), 1000);
    }
  };

  const getDefaultIcon = () => {
    switch (variant) {
      case "danger":
        return <XCircle className="w-full h-full" />;
      case "warning":
        return <AlertTriangle className="w-full h-full" />;
      default:
        return <AlertCircle className="w-full h-full" />;
    }
  };

  const variantStyles = {
    default: {
      iconColor: "text-blue-500 dark:text-blue-400",
      titleColor: "text-gray-900 dark:text-gray-100",
      messageColor: "text-gray-600 dark:text-gray-300",
      buttonBg:
        "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500",
    },
    danger: {
      iconColor: "text-red-500 dark:text-red-400",
      titleColor: "text-gray-900 dark:text-gray-100",
      messageColor: "text-gray-600 dark:text-gray-300",
      buttonBg:
        "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500",
    },
    warning: {
      iconColor: "text-amber-500 dark:text-amber-400",
      titleColor: "text-gray-900 dark:text-gray-100",
      messageColor: "text-gray-600 dark:text-gray-300",
      buttonBg:
        "bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={`${
        fullScreen ? "fixed inset-0 z-50 flex items-center justify-center" : ""
      }`}
    >
      {fullScreen && (
        <div className="absolute inset-0 bg-gray-900/60 dark:bg-black/80 backdrop-blur-sm" />
      )}

      <div
        className={`
          relative flex items-center gap-4
          ${
            fullScreen
              ? "max-w-2xl w-full mx-4 flex-col text-center"
              : "flex-row"
          }
          ${className}
        `}
      >
        <div className={`shrink-0 ${styles.iconColor}`}>
          <div className={`${fullScreen ? "w-16 h-16" : "w-8 h-8"}`}>
            {icon || getDefaultIcon()}
          </div>
        </div>

        <div className={`flex-1 ${fullScreen ? "text-center" : "text-left"}`}>
          <h2 className={`text-xl font-semibold ${styles.titleColor} mb-1`}>
            {title}
          </h2>
          <p className={`text-base ${styles.messageColor} leading-relaxed`}>
            {message}
          </p>

          {onRetry && (
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className={`
                mt-4 py-2.5 px-6 rounded-lg font-medium
                transition-all duration-200
                inline-flex items-center justify-center gap-2
                ${styles.buttonBg}
                text-white
                shadow-lg hover:shadow-xl
                transform hover:scale-105 active:scale-95
                disabled:opacity-50 disabled:cursor-not-allowed
                disabled:transform-none
              `}
            >
              <RefreshCw
                className={`w-4 h-4 ${isRetrying ? "animate-spin" : ""}`}
              />
              {isRetrying ? "Retrying..." : "Try Again"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
