import { create } from "zustand";
import { ReactNode } from "react";
import { ApiError } from "next/dist/server/api-utils";
import { AxiosError } from "axios";

export type ConfirmVariant = "danger" | "warning" | "info";

export interface ConfirmConfig {
  title: string;
  description: ReactNode;
  variant?: ConfirmVariant;
  confirmText?: string;
  cancelText?: string;
  requireInput?: string;
  icon?: ReactNode;
  reason?: {
    isOpen: boolean;
    isRequired: boolean;
    label?: string;
    placeholder?: string;
    min?: number;
    max?: number;
  };
  onConfirm?: (reason?: string) => Promise<void> | void;
  onCancel?: () => Promise<void> | void;
}

interface ConfirmState {
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  config: ConfirmConfig | null;
  resolveCallback: ((value: boolean) => void) | null;
  confirm: (config: ConfirmConfig) => Promise<boolean>;
  handleConfirm: (reason?: string) => Promise<void>;
  handleCancel: () => Promise<void>;
}

export const useConfirmStore = create<ConfirmState>((set, get) => ({
  isOpen: false,
  isLoading: false,
  error: null,
  config: null,
  resolveCallback: null,
  confirm: (config) => {
    return new Promise((resolve) => {
      set({
        isOpen: true,
        isLoading: false,
        error: null,
        config,
        resolveCallback: resolve,
      });
    });
  },
  handleConfirm: async (reasonValue?: string) => {
    const { config, resolveCallback } = get();
    if (!config) return;

    if (config.onConfirm) {
      set({ isLoading: true, error: null });
      try {
        await config.onConfirm(reasonValue);
        return set({
          isLoading: false,
          isOpen: false,
        });
      } catch (error: any) {
        return set({
          isLoading: false,
          isOpen: true,
          error: error.message || "An unexpected error occurred.",
        });
      }
    }

    if (resolveCallback) resolveCallback(true);
    set({ isOpen: false, isLoading: false });
  },
  handleCancel: async () => {
    const { config, resolveCallback } = get();
    if (!config) return;

    if (config.onCancel) {
      set({ isLoading: true, error: null });
      try {
        await config.onCancel();
      } catch (error: any) {
        const err = typeof error === "string" ? error : error?.message;

        set({
          isLoading: false,
          error: err || "An unexpected error occurred.",
        });
        return;
      }
    }

    if (resolveCallback) resolveCallback(false);
    set({ isOpen: false, isLoading: false });
  },
}));
