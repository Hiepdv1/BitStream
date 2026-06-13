"use client";

import { useEffect, useState } from "react";
import { useConfirmStore } from "@/hooks/useConfirm";
import { AlertTriangle, LogOut, Trash2, Loader2 } from "lucide-react";
import { Textarea } from "./Textarea";

export function ConfirmDialog() {
  const { isOpen, isLoading, error, config, handleConfirm, handleCancel } =
    useConfirmStore();
  const [inputValue, setInputValue] = useState("");
  const [reasonValue, setReasonValue] = useState("");

  useEffect(() => {
    if (isOpen) {
      setInputValue("");
      setReasonValue("");
    }
  }, [isOpen]);

  if (!isOpen || !config) return null;

  const {
    title,
    description,
    variant = "info",
    confirmText = "Confirm",
    cancelText = "Cancel",
    requireInput,
    icon,
    reason,
  } = config;

  let isConfirmDisabled = false;
  if (requireInput && inputValue !== requireInput) {
    isConfirmDisabled = true;
  }

  const minLen = reason?.min || 0;
  const maxLen = reason?.max || 500;
  const currentLen = reasonValue.trim().length;

  if (reason?.isOpen) {
    if (reason.isRequired && currentLen === 0) {
      isConfirmDisabled = true;
    }
    if ((currentLen > 0 || reason.isRequired) && currentLen < minLen) {
      isConfirmDisabled = true;
    }
  }

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          icon: <Trash2 className="w-5 h-5 text-red-500" />,
          iconBg: "bg-red-500/10",
          confirmBtnContent:
            "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500/20",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="w-5 h-5 text-[#f59e0b]" />,
          iconBg: "bg-yellow-500/10",
          confirmBtnContent:
            "bg-[#f59e0b] text-white hover:bg-yellow-600 focus:ring-yellow-500/20",
        };
      case "info":
      default:
        return {
          icon: <LogOut className="w-5 h-5 text-brand" />, // brand orange
          iconBg: "bg-brand/10 text-brand",
          confirmBtnContent:
            "bg-brand text-white hover:bg-brand/90 focus:ring-brand/20",
        };
    }
  };

  const styles = getVariantStyles();
  const finalIcon = icon || styles.icon;

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={isLoading ? undefined : handleCancel}
      />

      <div
        className="relative w-full max-w-[500px] rounded-2xl bg-surface border border-white/5 shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200"
        role="dialog"
      >
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
          {/* Icon Box */}
          <div
            className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center ${styles.iconBg}`}
          >
            {finalIcon}
          </div>

          {/* Content */}
          <div className="flex-1 mt-1">
            <h2 className="text-xl font-bold text-text-main mb-2 tracking-wide font-heading">
              {title}
            </h2>
            <div className="text-sm text-text-muted leading-relaxed mb-6">
              {description}
            </div>

            {/* Extra Confirmation */}
            {requireInput && (
              <div className="mb-6">
                <label className="block text-[10px] uppercase font-bold tracking-widest text-text-muted mb-2">
                  Extra Confirmation
                </label>
                <input
                  type="text"
                  placeholder={`Type ${requireInput} to confirm`}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full bg-surface/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
                />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-start gap-2 animate-in slide-in-from-top-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Reason Field */}
            {reason && reason.isOpen && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-text-muted">
                    {reason.label || "Reason"}{" "}
                    {reason.isRequired && (
                      <span className="text-red-500">*</span>
                    )}
                  </label>
                  <span className="text-[10px] font-mono text-text-muted">
                    {reasonValue.length}/{maxLen}
                  </span>
                </div>
                <Textarea
                  placeholder={
                    reason.placeholder || "Please provide a reason..."
                  }
                  value={reasonValue}
                  onChange={(e) => setReasonValue(e.target.value)}
                  maxLength={maxLen}
                  className="min-h-[80px]"
                />
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="cursor-pointer flex-1 py-3 px-4 rounded-xl border border-black/10 dark:border-white/10 text-text-main dark:text-white font-medium text-sm hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={() => handleConfirm(reasonValue)}
                disabled={isConfirmDisabled || isLoading}
                className={`cursor-pointer relative flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-colors focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${styles.confirmBtnContent}`}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
