"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GiftBasicInfo } from "./GiftBasicInfo";
import { GiftMediaAssets } from "./GiftMediaAssets";
import { GiftSettings } from "./GiftSettings";
import { GiftLivePreview } from "../shared/GiftLivePreview";
import { GiftTier, ShakeLevel } from "../../types/gift";
import { CreateGiftFormData, createGiftSchema } from "../../schema/gift";
import { useCreateGift } from "../../hooks";
import { toFormData } from "@/helpers/form-data.helper";
import { toast } from "sonner";
import { UploadProgress } from "@/components/ui/UploadProgress";
import { useAppQueryClient } from "@/hooks";
interface MediaFile {
  file: File | null;
  previewUrl: string | null;
}

const DEFAULT_MEDIA: MediaFile = { file: null, previewUrl: null };

export const CreateGiftPage = () => {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ── Form ──
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateGiftFormData>({
    resolver: zodResolver(createGiftSchema),
    defaultValues: {
      name: "",
      price: 50,
      duration: 5,
      tier: GiftTier.BASIC,
      shake_level: ShakeLevel.NONE,
      is_active: true,
    },
  });

  // Watch form values for live preview
  const watchedName = watch("name");
  const watchedTier = watch("tier");
  const watchedPrice = watch("price");
  const watchedIsActive = watch("is_active");

  // ── Media State ──
  const [imageFile, setImageFile] = useState<MediaFile>(DEFAULT_MEDIA);
  const [effectFile, setEffectFile] = useState<MediaFile>(DEFAULT_MEDIA);
  const [soundFile, setSoundFile] = useState<MediaFile>(DEFAULT_MEDIA);
  const [effectData, setEffectData] = useState<object | null>(null);
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const { refreshGiftDashboard } = useAppQueryClient();

  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { mutateAsync: giftMutationAsync } = useCreateGift();

  // ── Image Upload ──
  const handleImageChange = useCallback((file: File | null) => {
    setImageError(null);
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImageFile({ file, previewUrl });
    } else {
      setImageFile(DEFAULT_MEDIA);
    }
  }, []);

  // ── Effect (Lottie) Upload ──
  const handleEffectChange = useCallback((file: File | null) => {
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setEffectFile({ file, previewUrl });

      // Parse Lottie JSON
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          setEffectData(data);
        } catch {
          console.error("Invalid Lottie JSON file");
          setEffectData(null);
        }
      };
      reader.readAsText(file);
    } else {
      setEffectFile(DEFAULT_MEDIA);
      setEffectData(null);
    }
  }, []);

  // ── Sound Upload ──
  const handleSoundChange = useCallback((file: File | null) => {
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setSoundFile({ file, previewUrl });
    } else {
      setSoundFile(DEFAULT_MEDIA);
      setIsPlayingSound(false);
    }
  }, []);

  // ── Test Effect ──
  const handleTestEffect = useCallback(() => {
    // Re-parse and set effect data to trigger re-render in preview
    if (effectFile.file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          setEffectData(null); // reset first to force re-mount
          requestAnimationFrame(() => setEffectData(data));
        } catch {
          console.error("Invalid Lottie JSON file");
        }
      };
      reader.readAsText(effectFile.file);
    }
  }, [effectFile.file]);

  // ── Sound Playback ──
  const handleToggleSound = useCallback(() => {
    if (!soundFile.previewUrl) return;

    if (isPlayingSound) {
      audioRef.current?.pause();
      setIsPlayingSound(false);
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio(soundFile.previewUrl);
        audioRef.current.onended = () => setIsPlayingSound(false);
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlayingSound(true);
    }
  }, [isPlayingSound, soundFile.previewUrl]);

  // ── Active toggle ──
  const handleActiveChange = useCallback(
    (active: boolean) => {
      setValue("is_active", active);
    },
    [setValue],
  );

  const handleGoBack = useCallback(() => {
    router.push("/admin/gifts");
  }, [router]);

  // ── Submit ──
  const onSubmit = useCallback(
    async (data: CreateGiftFormData) => {
      if (!imageFile.file) {
        setImageError("Thumbnail image is required.");
        return;
      }

      const formData = toFormData({
        name: data.name,
        price: data.price,
        duration: data.duration,
        tier: data.tier,
        shake_level: data.shake_level,
        is_active: data.is_active,
        image: imageFile.file,
        effect: effectFile.file,
        sound: soundFile.file,
      });

      abortControllerRef.current = new AbortController();
      setUploadProgress(0);

      await giftMutationAsync(
        {
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
        },
        {
          onSuccess: (data) => {
            refreshGiftDashboard();
            toast.success("Gift created successfully", {
              description: `You have successfully created a new gift ${data.name}`,
            });

            handleGoBack();
          },
          onError: (error) => {
            toast.error(error.message);
          },
          onSettled: () => {
            setUploadProgress(null);
            abortControllerRef.current = null;
          },
        },
      );
    },
    [
      imageFile.file,
      effectFile.file,
      soundFile.file,
      handleGoBack,
      giftMutationAsync,
      refreshGiftDashboard,
    ],
  );

  const handleCancelUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return (
    <div className="admin-create-gift">
      {uploadProgress !== null && (
        <UploadProgress
          progress={uploadProgress}
          onCancel={handleCancelUpload}
        />
      )}
      {/* Breadcrumb */}
      <div className="admin-create-gift-breadcrumb">
        <button
          type="button"
          onClick={handleGoBack}
          className="text-text-muted hover:text-brand transition-colors cursor-pointer"
        >
          Gifts
        </button>
        <ChevronRight className="w-3 h-3 admin-create-gift-breadcrumb-sep" />
        <span className="admin-create-gift-breadcrumb-current">
          Create New Asset
        </span>
      </div>

      {/* Header */}
      <div className="admin-create-gift-header">
        <h1>Create New Gift</h1>
        <p>
          Configure interactive 3D and animated assets for viewers to support
          creators. Ensure all media meet BitStream optimization standards.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="admin-create-gift-layout">
          {/* Left Column: Form */}
          <div>
            <GiftBasicInfo register={register} errors={errors} />
            <GiftMediaAssets
              imageFile={imageFile}
              effectFile={effectFile}
              soundFile={soundFile}
              imageError={imageError}
              onImageChange={handleImageChange}
              onEffectChange={handleEffectChange}
              onSoundChange={handleSoundChange}
              onTestEffect={handleTestEffect}
              isPlayingSound={isPlayingSound}
              onToggleSound={handleToggleSound}
            />
            <GiftSettings
              register={register}
              errors={errors}
              isActive={watchedIsActive}
              onActiveChange={handleActiveChange}
            />

            {/* Submit Buttons */}
            <div className="admin-gift-submit">
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={handleGoBack}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
              >
                Create Gift
              </Button>
            </div>
          </div>

          {/* Right Column: Live Preview */}
          <GiftLivePreview
            name={watchedName}
            tier={watchedTier}
            price={watchedPrice}
            effectData={effectData}
            imagePreviewUrl={imageFile.previewUrl}
          />
        </div>
      </form>
    </div>
  );
};
