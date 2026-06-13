"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GiftTier, ShakeLevel } from "../../types/gift";
import { useDetailGift } from "../../hooks";
import { useUpdateGift } from "../../hooks/useUpdateGift";
import { toast } from "sonner";
import axios from "axios";
import { UploadProgress } from "@/components/ui/UploadProgress";

import { BasicInfoCard } from "./BasicInfoCard";
import { MediaFilesCard } from "./MediaFilesCard";
import { AnimationCard } from "./AnimationCard";
import { DisplayModesCard } from "./DisplayModesCard";
import { StatusCard } from "./StatusCard";
import { MetadataCard } from "./MetadataCard";
import { LivePreviewPanel } from "./LivePreviewPanel";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  editGiftMediaSchema,
  editGiftFormSchema,
  EditGiftFormData,
} from "../../schema/edit-gift";
import { useAppQueryClient } from "@/hooks";

export function EditGiftPage({ id }: { id: string }) {
  const { data: gift, isLoading } = useDetailGift(id);
  const { mutateAsync: updateGiftAsync } = useUpdateGift();
  const { refreshGiftDashboard, refreshHistoryDashboard } = useAppQueryClient();

  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, dirtyFields, isDirty },
  } = useForm<EditGiftFormData>({
    resolver: zodResolver(editGiftFormSchema),
    values: gift
      ? {
          name: gift.name,
          price: gift.price,
          duration: gift.duration,
          tier: gift.tier,
          shake_level: gift.shake_level,
          is_active: gift.is_active,
          is_chatMode: gift.is_chatMode,
          is_streamMode: gift.is_streamMode,
        }
      : undefined,
    defaultValues: {
      name: "",
      price: 0,
      duration: 1,
      tier: GiftTier.BASIC,
      shake_level: ShakeLevel.HIGH,
      is_active: false,
      is_chatMode: false,
      is_streamMode: false,
    },
  });

  const watchedName = watch("name");
  const watchedPrice = watch("price");
  const watchedDuration = watch("duration");
  const watchedTier = watch("tier");
  const watchedShakeLevel = watch("shake_level");
  const watchedIsActive = watch("is_active");
  const watchedChatMode = watch("is_chatMode");
  const watchedStreamMode = watch("is_streamMode");

  const [imageUrl, setImageUrl] = useState("");
  const [effectUrl, setEffectUrl] = useState<string | null>(null);
  const [soundUrl, setSoundUrl] = useState<string | null>(null);

  // ── File State for Uploads ──
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [effectFile, setEffectFile] = useState<File | null>(null);
  const [soundFile, setSoundFile] = useState<File | null>(null);

  // ── Error State (Only for File Uploads now) ──
  const [imageError, setImageError] = useState<string | null>(null);
  const [effectError, setEffectError] = useState<string | null>(null);
  const [soundError, setSoundError] = useState<string | null>(null);

  // ── Upload Progress State ──
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // ── Sync from API data (Media Files) ──
  useEffect(() => {
    if (gift) {
      setImageUrl(gift.image_url);
      setEffectUrl(gift.effect_url);
      setSoundUrl(gift.sound_url);
    }
  }, [gift]);

  useEffect(() => {
    if (watchedTier === GiftTier.BASIC) {
      setValue("is_streamMode", false);
    }
  }, [watchedTier, setValue]);

  // ── Callbacks for memoized components ──
  const handleImageFileChange = useCallback(
    (f: File | null) => {
      setImageFile(f);
      if (imageError) setImageError(null);
    },
    [imageError],
  );

  const handleEffectFileChange = useCallback(
    (f: File | null) => {
      setEffectFile(f);
      if (effectError) setEffectError(null);
    },
    [effectError],
  );

  const handleSoundFileChange = useCallback(
    (f: File | null) => {
      setSoundFile(f);
      if (soundError) setSoundError(null);
    },
    [soundError],
  );

  const handleChatModeChange = useCallback(
    (v: boolean) =>
      setValue("is_chatMode", v, { shouldDirty: true, shouldValidate: true }),
    [setValue],
  );
  const handleStreamModeChange = useCallback(
    (v: boolean) =>
      setValue("is_streamMode", v, { shouldDirty: true, shouldValidate: true }),
    [setValue],
  );
  const handleActiveChange = useCallback(
    (v: boolean) =>
      setValue("is_active", v, { shouldDirty: true, shouldValidate: true }),
    [setValue],
  );

  const handleSave = async (data: EditGiftFormData) => {
    setImageError(null);
    setEffectError(null);
    setSoundError(null);

    // Zod Validation for Files
    const fileParsed = editGiftMediaSchema.safeParse({
      imageFile,
      effectFile,
      soundFile,
    });
    if (!fileParsed.success) {
      const fieldErrors = fileParsed.error.flatten().fieldErrors;
      if (fieldErrors.imageFile)
        setImageError(fieldErrors.imageFile[0] || null);
      if (fieldErrors.effectFile)
        setEffectError(fieldErrors.effectFile[0] || null);
      if (fieldErrors.soundFile)
        setSoundError(fieldErrors.soundFile[0] || null);
      return;
    }

    if (!imageFile && !imageUrl) {
      setImageError("Image file is required to display the gift.");
      return;
    }

    if (data.price === 0) {
      const confirmZero = window.confirm(
        "Are you sure you want to set the price to 0? This will make the gift completely FREE.",
      );
      if (!confirmZero) return;
    }

    const formData = new FormData();

    Object.keys(dirtyFields).forEach((key) => {
      const fieldKey = key as keyof EditGiftFormData;
      const value = data[fieldKey];

      if (typeof value === "boolean") {
        formData.append(fieldKey, value ? "true" : "");
      } else {
        formData.append(fieldKey, String(value));
      }
    });

    if (imageFile) formData.append("image", imageFile);
    if (effectFile) formData.append("effect", effectFile);
    if (soundFile) formData.append("sound", soundFile);

    abortControllerRef.current = new AbortController();
    setUploadProgress(0);

    try {
      const response = await updateGiftAsync({
        giftID: id,
        data: formData,
        signal: abortControllerRef.current.signal,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            setUploadProgress(percentCompleted);
          }
        },
      });

      refreshGiftDashboard();
      refreshHistoryDashboard();

      toast.success("Gift updated successfully", {
        description: `You have successfully updated ${response.name}`,
      });
      router.push("/admin/gifts");
    } catch (error: any) {
      if (axios.isCancel(error) || error.name === "CanceledError") {
        toast.info("Upload canceled", {
          description: "The gift update was aborted.",
        });
      } else {
        toast.error(error.message || "Failed to update gift");
      }
    } finally {
      setUploadProgress(null);
      abortControllerRef.current = null;
    }
  };

  const handleCancelUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const canSave = isDirty || !!imageFile || !!effectFile || !!soundFile;

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-text-muted">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading gift data...</span>
        </div>
      </div>
    );
  }

  if (!gift) {
    return (
      <div className="text-center py-20 text-text-muted">
        Gift <span className="font-mono">{id}</span> not found.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleSave)} className="pb-12">
      {uploadProgress !== null && (
        <UploadProgress
          progress={uploadProgress}
          onCancel={handleCancelUpload}
          title="Updating Gift"
          description="Please wait while your gift configuration and media files are securely uploaded."
        />
      )}
      {/* ── Breadcrumb + Header ── */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center text-xs font-bold tracking-widest text-text-muted uppercase mb-3 gap-1.5">
            <Link
              href="/admin/gifts"
              className="hover:text-text-main transition-colors"
            >
              GIFTS
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-brand">
              {watchedName?.toUpperCase() || "EDIT"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-text-main">
            Edit Gift: {watchedName}
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Modify gift settings and preview changes in real time
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            disabled={uploadProgress !== null}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!canSave || uploadProgress !== null}
            isLoading={uploadProgress !== null}
          >
            Save Changes
          </Button>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] gap-6">
        {/* Left Column — Form Cards */}
        <div className="space-y-5">
          <BasicInfoCard register={register} errors={errors} />

          <MediaFilesCard
            imageUrl={imageUrl}
            effectUrl={effectUrl}
            soundUrl={soundUrl}
            imageFile={imageFile}
            effectFile={effectFile}
            soundFile={soundFile}
            imageError={imageError}
            effectError={effectError}
            soundError={soundError}
            onImageFileChange={handleImageFileChange}
            onEffectFileChange={handleEffectFileChange}
            onSoundFileChange={handleSoundFileChange}
          />

          {/* Bottom grid: Animation + DisplayModes side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <AnimationCard register={register} errors={errors} />
            <DisplayModesCard
              chatMode={watchedChatMode}
              streamMode={watchedStreamMode}
              tier={watchedTier}
              onChatModeChange={handleChatModeChange}
              onStreamModeChange={handleStreamModeChange}
            />
          </div>

          {/* Status + Metadata side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <StatusCard
              isActive={watchedIsActive}
              onActiveChange={handleActiveChange}
            />
            <MetadataCard
              id={id}
              createdAt={gift.createdAt}
              updatedAt={gift.updatedAt}
            />
          </div>
        </div>

        {/* Right Column — Live Preview (sticky) */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <LivePreviewPanel
            effectUrl={effectUrl}
            imageUrl={imageUrl}
            soundUrl={soundUrl}
            imageFile={imageFile}
            effectFile={effectFile}
            soundFile={soundFile}
            giftName={watchedName}
            price={watchedPrice}
            duration={watchedDuration}
            shakeLevel={watchedShakeLevel}
            chatMode={watchedChatMode}
            streamMode={watchedStreamMode}
            onChatModeChange={handleChatModeChange}
            onStreamModeChange={handleStreamModeChange}
          />
        </div>
      </div>
    </form>
  );
}
