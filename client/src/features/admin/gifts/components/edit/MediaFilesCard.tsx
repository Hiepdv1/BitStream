import { useState, useMemo, useRef, memo } from "react";
import {
  Eye,
  Volume2,
  Upload,
  CheckCircle2,
  X,
  AlertCircle,
  FileImage,
  FileJson,
  FileAudio,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

const getAssetUrl = (
  path: string | undefined | null,
  type: "effects" | "sounds" | "images",
) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  if (path.startsWith("blob:")) return path;
  const baseUrl = process.env.NEXT_PUBLIC_ASSET_URL || "";
  const cleanPath = path.startsWith("/")
    ? path
    : `/assets/gift/${type}/${path}`;
  return `${baseUrl}${cleanPath}`;
};

interface MediaFilesCardProps {
  imageUrl: string;
  effectUrl: string | null;
  soundUrl: string | null;

  imageFile: File | null;
  effectFile: File | null;
  soundFile: File | null;

  imageError?: string | null;
  effectError?: string | null;
  soundError?: string | null;

  onImageFileChange: (v: File | null) => void;
  onEffectFileChange: (v: File | null) => void;
  onSoundFileChange: (v: File | null) => void;
}

export const MediaFilesCard = memo(function MediaFilesCard({
  imageUrl,
  effectUrl,
  soundUrl,
  imageFile,
  effectFile,
  soundFile,
  imageError,
  effectError,
  soundError,
  onImageFileChange,
  onEffectFileChange,
  onSoundFileChange,
}: MediaFilesCardProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const effectInputRef = useRef<HTMLInputElement>(null);
  const soundInputRef = useRef<HTMLInputElement>(null);

  const resolvedImageUrl = useMemo(() => {
    if (imageFile) return URL.createObjectURL(imageFile);
    return getAssetUrl(imageUrl, "images");
  }, [imageFile, imageUrl]);

  const soundPreviewUrl = useMemo(() => {
    if (soundFile) return URL.createObjectURL(soundFile);
    return getAssetUrl(soundUrl, "sounds");
  }, [soundFile, soundUrl]);

  const playPreviewSound = () => {
    if (soundPreviewUrl) {
      const audio = new Audio(soundPreviewUrl);
      audio.volume = 0.5;
      audio
        .play()
        .catch((err) => console.error("Could not play preview audio", err));
    }
  };

  const isImageEmpty = !imageFile && (!imageUrl || !imageUrl.trim());

  return (
    <div className="bg-background border border-border shadow-xs rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-brand text-white shrink-0">
          <Upload className="w-4 h-4" />
        </div>
        <h3 className="font-heading font-bold text-lg">Media Files Upload</h3>
      </div>

      <div className="space-y-5">
        {/* Image File (Required) */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-bold tracking-widest text-text-muted uppercase">
            <span>Image Source</span>
            <span className="text-error">*</span>
          </label>
          <div className="flex gap-3 items-center">
            <div
              className={`relative flex-1 h-11 px-4 rounded-xl bg-surface border transition-colors flex items-center justify-between overflow-hidden cursor-pointer ${imageError ? "border-error hover:border-error" : isImageEmpty ? "border-error/60" : "border-border hover:border-brand"}`}
              onClick={() => imageInputRef.current?.click()}
            >
              <div className="flex items-center gap-2 text-sm text-text-main truncate">
                <FileImage className="w-4 h-4 text-text-muted shrink-0" />
                {imageFile ? (
                  <span className="font-bold text-brand truncate">
                    {imageFile.name}
                  </span>
                ) : imageUrl ? (
                  <span className="text-text-secondary truncate">
                    {imageUrl}
                  </span>
                ) : (
                  <span className="text-text-muted">Select image file...</span>
                )}
              </div>
              {(isImageEmpty || imageError) && (
                <AlertCircle className="w-4 h-4 text-error shrink-0 opacity-70" />
              )}
            </div>
            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              className="hidden"
              ref={imageInputRef}
              onChange={(e) => {
                if (e.target.files?.[0]) onImageFileChange(e.target.files[0]);
                e.target.value = "";
              }}
            />

            {(imageFile || (!isImageEmpty && resolvedImageUrl)) && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  className="shrink-0 text-zinc-900 dark:text-zinc-100 border-border h-11 cursor-pointer"
                  onClick={() => setPreviewImage(resolvedImageUrl)}
                >
                  <Eye className="w-4 h-4 mr-1.5" /> Preview
                </Button>
                <div className="w-11 h-11 rounded-lg border border-success/30 bg-success/5 flex items-center justify-center text-success shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </>
            )}
          </div>
          {/* Inline image preview thumbnail */}
          {!isImageEmpty && resolvedImageUrl && (
            <div className="mt-2 flex items-center gap-3">
              <img
                src={resolvedImageUrl}
                alt="Gift preview"
                className="w-16 h-16 rounded-lg object-contain border border-border bg-surface"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <span className="text-xs text-text-muted">
                Active Thumbnail{" "}
                {imageFile && <span className="text-brand">(Unsaved)</span>}
              </span>
            </div>
          )}
          {imageError ? (
            <p className="text-xs text-error mt-1">{imageError}</p>
          ) : isImageEmpty ? (
            <p className="text-xs text-error mt-1">
              Image file is required to display the gift.
            </p>
          ) : null}
        </div>

        {/* Lottie Effect File */}
        <div className="space-y-2">
          <label className="flex items-center justify-between text-xs font-bold tracking-widest text-text-muted uppercase">
            <span>Lottie Animation Source</span>
            <span className="text-[10px] bg-surface-hover px-2 py-0.5 rounded text-text-secondary">
              Optional
            </span>
          </label>
          <div className="flex gap-3 items-center">
            <div
              className={`relative flex-1 h-11 px-4 rounded-xl bg-surface border transition-colors flex items-center justify-between overflow-hidden cursor-pointer ${effectError ? "border-error hover:border-error" : "border-border hover:border-brand"}`}
              onClick={() => effectInputRef.current?.click()}
            >
              <div className="flex items-center gap-2 text-sm text-text-main truncate">
                <FileJson className="w-4 h-4 text-text-muted shrink-0" />
                {effectFile ? (
                  <span className="font-bold text-brand truncate">
                    {effectFile.name}
                  </span>
                ) : effectUrl ? (
                  <span className="text-text-secondary truncate">
                    {effectUrl}
                  </span>
                ) : (
                  <span className="text-text-muted">
                    Select Lottie JSON file...
                  </span>
                )}
              </div>
              {effectError && (
                <AlertCircle className="w-4 h-4 text-error shrink-0 opacity-70 right-4 absolute" />
              )}
            </div>
            <input
              type="file"
              accept=".json,application/json"
              className="hidden"
              ref={effectInputRef}
              onChange={(e) => {
                if (e.target.files?.[0]) onEffectFileChange(e.target.files[0]);
                e.target.value = "";
              }}
            />

            {(effectFile || effectUrl) && !effectError && (
              <div className="w-11 h-11 rounded-lg border border-success/30 bg-success/5 flex items-center justify-center text-success shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            )}
          </div>
          {effectError ? (
            <p className="text-xs text-error mt-1">{effectError}</p>
          ) : (
            <p className="text-[11px] text-text-muted mt-1">
              Preview is running on the Live Render Panel (Right).
            </p>
          )}
        </div>

        {/* SFX File */}
        <div className="space-y-2">
          <label className="flex items-center justify-between text-xs font-bold tracking-widest text-text-muted uppercase">
            <span>Sound Effect (SFX) Source</span>
            <span className="text-[10px] bg-surface-hover px-2 py-0.5 rounded text-text-secondary">
              Optional
            </span>
          </label>
          <div className="flex gap-3 items-center">
            <div
              className={`relative flex-1 h-11 px-4 rounded-xl bg-surface border transition-colors flex items-center justify-between overflow-hidden cursor-pointer ${soundError ? "border-error hover:border-error" : "border-border hover:border-brand"}`}
              onClick={() => soundInputRef.current?.click()}
            >
              <div className="flex items-center gap-2 text-sm text-text-main truncate">
                <FileAudio className="w-4 h-4 text-text-muted shrink-0" />
                {soundFile ? (
                  <span className="font-bold text-brand truncate">
                    {soundFile.name}
                  </span>
                ) : soundUrl ? (
                  <span className="text-text-secondary truncate">
                    {soundUrl}
                  </span>
                ) : (
                  <span className="text-text-muted">Select audio file...</span>
                )}
              </div>
              {soundError && (
                <AlertCircle className="w-4 h-4 text-error shrink-0 opacity-70 right-4 absolute" />
              )}
            </div>
            <input
              type="file"
              accept="audio/mpeg, audio/wav, audio/mp3, audio/ogg"
              className="hidden"
              ref={soundInputRef}
              onChange={(e) => {
                if (e.target.files?.[0]) onSoundFileChange(e.target.files[0]);
                e.target.value = "";
              }}
            />

            {(soundFile || soundUrl) && !soundError && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  className="shrink-0 border-border h-11 cursor-pointer"
                  onClick={playPreviewSound}
                >
                  <Volume2 className="w-4 h-4 mr-1.5" /> Play Sound
                </Button>
                <div className="w-11 h-11 rounded-lg border border-success/30 bg-success/5 flex items-center justify-center text-success shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </>
            )}
          </div>
          {soundError && (
            <p className="text-xs text-error mt-1">{soundError}</p>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-200 bg-black/70 flex items-center justify-center p-8"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-lg w-full">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-brand transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewImage}
              alt="Full preview"
              className="w-full rounded-2xl border border-white/10 shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
});
