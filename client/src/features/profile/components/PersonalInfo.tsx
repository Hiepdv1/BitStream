"use client";

import { memo, useEffect, useMemo, useState } from "react";
import { UserCircle, Loader2, AlertTriangle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUpdateProfile } from "../hook/useUpdateProfile";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { useAppQueryClient } from "@/hooks";

const profileSchema = z.object({
  displayName: z
    .string()
    .min(3, "Display name must be at least 3 characters")
    .max(50, "Display name must not exceed 50 characters"),
  bio: z.string().max(500, "Bio must not exceed 500 characters").optional(),
});

type ProfileInput = z.infer<typeof profileSchema>;

interface PersonalInfoProps {
  initialDisplayName: string;
  initialBio: string;
  email: string;
}

export const PersonalInfo = memo(function PersonalInfo({
  initialDisplayName,
  initialBio,
  email,
}: PersonalInfoProps) {
  const { mutate: updateProfile } = useUpdateProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const { invalidateProfile } = useAppQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, dirtyFields, isDirty },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    values: {
      displayName: initialDisplayName,
      bio: initialBio,
    },
  });

  const onSubmit = (data: ProfileInput) => {
    const payload: { name?: string; bio?: string } = {};

    if (dirtyFields.displayName) {
      payload.name = data.displayName;
    }
    if (dirtyFields.bio) {
      payload.bio = data.bio || "";
    }

    if (Object.keys(payload).length === 0) {
      return;
    }

    setIsSubmitting(true);
    setApiError(null);

    updateProfile(payload, {
      onSuccess: () => {
        toast.success("Profile updated successfully!");
        invalidateProfile();
      },
      onError: (error) => {
        setApiError(error.message || "Failed to update profile");
      },
      onSettled: () => {
        setIsSubmitting(false);
      },
    });
  };

  return (
    <div className="profile-card">
      <div className="profile-card-header">
        <div className="profile-card-icon">
          <UserCircle className="w-5 h-5 text-brand" />
        </div>
        <div>
          <h3 className="profile-card-title text-text-main">
            Personal Information
          </h3>
          <p className="profile-card-subtitle text-text-muted">
            Manage your personal details
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 pt-0 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="profile-form-label">Display Name</label>
            <input
              type="text"
              {...register("displayName")}
              className={`profile-form-input ${
                errors.displayName
                  ? "border-red-500/50 focus:border-red-500"
                  : ""
              }`}
              placeholder="Your display name"
              disabled={isSubmitting}
            />
            {errors.displayName && (
              <p className="text-xs text-red-500 mt-1">
                {errors.displayName.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="profile-form-label">Email Address</label>
            <input
              type="email"
              value={email}
              disabled
              className="profile-form-input opacity-60 cursor-not-allowed bg-surface"
              placeholder="your@email.com"
            />
            <p className="text-xs text-text-muted mt-1">
              Email address cannot be changed
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="profile-form-label">Bio</label>
          <textarea
            {...register("bio")}
            className={`profile-form-textarea ${
              errors.bio ? "border-red-500/50 focus:border-red-500" : ""
            }`}
            placeholder="Tell us about yourself..."
            rows={4}
            disabled={isSubmitting}
          />
          {errors.bio && (
            <p className="text-xs text-red-500 mt-1">{errors.bio.message}</p>
          )}
        </div>

        {apiError && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <Button
            type="submit"
            variant="primary"
            disabled={!isDirty || isSubmitting}
            className="min-w-[140px]"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </span>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
});
