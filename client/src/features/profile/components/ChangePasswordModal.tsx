"use client";

import { useEffect, useState } from "react";
import { X, KeyRound, Loader2, AlertTriangle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { useChangePassword } from "../hook/useChangePassword";

const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Old password is required"),
    password: z
      .string()
      .min(8, "Password must be more than 7 characters")
      .max(30, "Password must not exceed 30 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal = ({
  isOpen,
  onClose,
}: ChangePasswordModalProps) => {
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const { mutate: changePassword } = useChangePassword();

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose, isSubmitting]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      // Reset form when modal closes
      if (!isSubmitting) {
        reset();
        setApiError(null);
      }
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, reset, isSubmitting]);

  if (!mounted || !isOpen) return null;

  const onSubmit = (data: ChangePasswordInput) => {
    setIsSubmitting(true);
    setApiError(null);
    changePassword(
      {
        oldPassword: data.oldPassword,
        password: data.password,
      },
      {
        onSuccess: () => {
          toast.success("Password changed successfully!");
          onClose();
          reset();
        },
        onError(error) {
          setApiError(error.message || "Failed to change password");
        },
        onSettled() {
          setIsSubmitting(false);
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
        onClick={() => {
          if (!isSubmitting) onClose();
        }}
      />

      {/* Modal Container */}
      <div
        className="relative w-full max-w-md bg-background border border-border/50 rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {isSubmitting && (
          <div className="absolute inset-0 z-50 bg-background/60 backdrop-blur-[1px] flex items-center justify-center cursor-not-allowed"></div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-main">
                Change Password
              </h2>
              <p className="text-sm text-text-muted mt-0.5">
                Update your account password
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className={`p-2 rounded-lg text-text-muted hover:text-text-main hover:bg-surface transition-colors ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Input
                label="Current Password"
                type="password"
                placeholder="Enter your current password"
                variant="surface"
                {...register("oldPassword")}
                error={errors.oldPassword?.message}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-1.5">
              <Input
                label="New Password"
                type="password"
                placeholder="Enter your new password"
                variant="surface"
                {...register("password")}
                error={errors.password?.message}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-1.5">
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Confirm your new password"
                variant="surface"
                {...register("confirmPassword")}
                error={errors.confirmPassword?.message}
                disabled={isSubmitting}
              />
            </div>

            {apiError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-start gap-2 animate-in slide-in-from-top-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            <div className="pt-4 flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isSubmitting}
                className="text-text-main"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Changing...
                  </span>
                ) : (
                  "Change Password"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
