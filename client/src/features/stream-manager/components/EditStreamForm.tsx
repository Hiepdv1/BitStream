"use client";

import { memo, useState, useRef, useEffect } from "react";
import { CloudUpload, Loader2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import {
  createStreamSchema,
  CreateStreamInput,
} from "@/features/create-stream/schema/stream.schema";
import { HASHTAG_REGEX } from "@/constants/regex";
import { useUpdateStreamMutation } from "../hooks/useUpdateStream";
import { toFormData } from "@/helpers";
import { toast } from "sonner";
import { StreamItem } from "../types";
import { useAppQueryClient } from "@/hooks";

interface EditStreamFormProps {
  stream: StreamItem;
  onCancel?: () => void;
  onSubmittingChange?: (isSubmitting: boolean) => void;
}

export const EditStreamForm = memo(
  ({ stream, onCancel, onSubmittingChange }: EditStreamFormProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(() => {
      if (stream.thumbnail_url) {
        return `${process.env.NEXT_PUBLIC_ASSET_URL}/assets/stream-thumbnail/${stream.thumbnail_url}`;
      }

      return null;
    });

    const inputRef = useRef<HTMLInputElement | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const { mutate: updateStream, isPending } = useUpdateStreamMutation();
    const { invalidateStreamManagerList } = useAppQueryClient();

    useEffect(() => {
      onSubmittingChange?.(isPending);
    }, [isPending, onSubmittingChange]);

    const {
      register,
      handleSubmit,
      control,
      setValue,
      watch,
      formState: { errors, isDirty },
    } = useForm<CreateStreamInput>({
      resolver: zodResolver(createStreamSchema),
      defaultValues: {
        title: stream.title,
        description: stream.description || "",
        visibility: stream.visibility as "PUBLIC" | "PRIVATE",
      },
    });

    const titleVal = watch("title") || "";
    const descVal = watch("description") || "";
    const thumbnailVal = watch("thumbnail");

    const { ref: hookFormTitleRef, ...titleRest } = register("title");
    const handleTitleRef = (e: HTMLInputElement | null) => {
      hookFormTitleRef(e);
      inputRef.current = e;
    };

    const { ref: hookFormDescRef, ...descRest } = register("description");
    const handleDescRef = (e: HTMLTextAreaElement | null) => {
      hookFormDescRef(e);
      textareaRef.current = e;
    };

    const extractTags = (text: string) => {
      if (!text) return [];
      const matches = text.match(HASHTAG_REGEX) || [];
      return matches.map((tag) => tag.trim().replace("#", ""));
    };

    const hasFileChanged = thumbnailVal instanceof File;
    const hasDataChanged = isDirty || hasFileChanged;

    const onSubmit = (data: CreateStreamInput) => {
      const changedData: any = {};

      if (data.title !== stream.title) changedData.title = data.title;
      if (data.description !== (stream.description || ""))
        changedData.description = data.description;
      if (data.visibility !== stream.visibility)
        changedData.visibility = data.visibility;
      if (hasFileChanged) changedData.thumbnail = data.thumbnail;

      if (
        changedData.title !== undefined ||
        changedData.description !== undefined
      ) {
        const tagsFromTitle = extractTags(data.title);
        const tagsFromDesc = extractTags(data?.description || "");
        const allTags = Array.from(
          new Set([...tagsFromTitle, ...tagsFromDesc]),
        );
        changedData.extractedTags = allTags;
      }

      if (Object.keys(changedData).length === 0) {
        toast.error("No changes made");
        return;
      }

      const formData = toFormData(changedData);

      updateStream(
        { streamID: stream.id, data: formData },
        {
          onSuccess: () => {
            toast.success("Stream updated successfully");
            invalidateStreamManagerList();
            onCancel?.();
          },
          onError: (error) => {
            toast.error(error?.message || "Failed to update stream");
          },
        },
      );
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setValue("thumbnail", file, {
          shouldValidate: true,
          shouldDirty: true,
        });
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) {
        setValue("thumbnail", file, {
          shouldValidate: true,
          shouldDirty: true,
        });
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
    };

    return (
      <div className="w-full relative">
        {isPending && (
          <div className="absolute inset-0 z-50 bg-surface/60 backdrop-blur-[2px] rounded-xl flex items-center justify-center cursor-not-allowed" />
        )}

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-main block">
              Stream Title <span className="text-red-500">*</span>
            </label>
            <Input
              variant="surface"
              placeholder="Enter your stream title"
              enableHashtags
              {...titleRest}
              value={titleVal}
              ref={handleTitleRef}
              error={errors.title?.message}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-main flex justify-between">
              <span>Description</span>
              <span className="text-xs text-text-muted font-normal">
                {descVal.length}/5000
              </span>
            </label>
            <Textarea
              variant="surface"
              placeholder="Enter your stream description"
              rows={4}
              enableHashtags
              {...descRest}
              value={descVal}
              ref={handleDescRef}
              maxLength={5000}
              error={errors.description?.message}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-main block">
              Thumbnail
            </label>
            <div
              className="w-full border-2 border-dashed border-border hover:border-brand/50 rounded-xl bg-surface/50 flex flex-col items-center justify-center py-10 transition-colors cursor-pointer group relative overflow-hidden"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />

              {previewUrl ? (
                <>
                  <img
                    src={previewUrl}
                    alt="Thumbnail preview"
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                  />
                  <div className="relative z-10 flex flex-col items-center p-4 bg-black/60 rounded-lg backdrop-blur-sm">
                    <CloudUpload
                      className="w-8 h-8 text-white mb-2"
                      strokeWidth={1.5}
                    />
                    <p className="text-sm font-semibold text-white">
                      Click or drag to replace
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <CloudUpload
                    className="w-10 h-10 text-text-muted group-hover:text-brand transition-colors mb-3"
                    strokeWidth={1.5}
                  />
                  <p className="text-base font-semibold text-text-main mb-1">
                    Drag & drop your image here
                  </p>
                  <p className="text-sm text-text-muted">
                    or click to browse files (16:9 recommended)
                  </p>
                </>
              )}
            </div>
            {errors.thumbnail && (
              <p className="text-xs text-error font-medium">
                {errors.thumbnail.message as string}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-text-main block">
                Visibility
              </label>
              <Controller
                control={control}
                name="visibility"
                render={({ field }) => (
                  <div className="space-y-3">
                    {["PUBLIC", "PRIVATE"].map((opt) => (
                      <label
                        key={opt}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-[6px] flex items-center justify-center transition-all ${
                            field.value === opt
                              ? "border-brand bg-white"
                              : "border-text-muted/30 bg-transparent group-hover:border-text-muted/50"
                          }`}
                        />
                        <input
                          type="radio"
                          className="hidden"
                          value={opt}
                          checked={field.value === opt}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                        <span className="text-sm font-medium text-text-main capitalize">
                          {opt.toLowerCase()}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              />
            </div>
          </div>

          <div className="w-full flex items-center justify-end gap-4 mt-8 pt-4 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              className="px-6 border-border hover:bg-surface text-text-main rounded-lg py-2.5 h-auto"
              onClick={onCancel}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-6 bg-brand hover:bg-brand/90 text-white rounded-lg font-semibold py-2.5 h-auto border-none min-w-[140px]"
              disabled={isPending || !hasDataChanged}
            >
              {isPending ? (
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
  },
);

EditStreamForm.displayName = "EditStreamForm";
