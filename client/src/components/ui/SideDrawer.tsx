"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

export interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
}

export function SideDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = "max-w-[480px]",
}: SideDrawerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!mounted) return null;

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-100 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className={`relative flex flex-col h-full bg-surface border-l border-border shadow-2xl w-full ${width} animate-in slide-in-from-right duration-300`}
        aria-modal="true"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 xs:p-8 border-b border-border shrink-0">
          <div>
            {title && (
              <div className="text-3xl font-bold font-heading tracking-wide flex items-center gap-3 text-text-main">
                {title}
              </div>
            )}
            {subtitle && (
              <div className="text-sm text-text-muted mt-1.5">{subtitle}</div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 -mr-2 rounded-xl text-text-muted hover:bg-surface-hover hover:text-text-main transition-colors focus:outline-none focus:ring-2 focus:ring-brand/50 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 xs:p-8">
          {children}
        </div>

        {/* Fixed Footer */}
        {footer && (
          <div className="p-6 xs:p-8 border-t border-border bg-surface/80 backdrop-blur-md shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
