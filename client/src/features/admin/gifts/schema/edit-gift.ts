import { z } from "zod";
import { GiftTier, ShakeLevel } from "../types/gift";

export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];
export const ACCEPTED_SOUND_TYPES = [
  "audio/mpeg",
  "audio/wav",
  "audio/mp3",
  "audio/ogg",
];

export const editGiftMediaSchema = z.object({
  imageFile: z
    .custom<File>((val) => val instanceof File, "Please upload a file")
    .optional()
    .nullable()
    .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE,
      "Max image size is 2MB.",
    )
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .png, .webp, .gif formats are supported.",
    ),
  effectFile: z
    .custom<File>((val) => val instanceof File, "Please upload a file")
    .optional()
    .nullable()
    .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE,
      "Max effect size is 2MB.",
    )
    .refine(
      (file) =>
        !file ||
        file.name.endsWith(".json") ||
        file.type === "application/json",
      "Only .json files are supported.",
    ),
  soundFile: z
    .custom<File>((val) => val instanceof File, "Please upload a file")
    .optional()
    .nullable()
    .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE,
      "Max sound size is 2MB.",
    )
    .refine(
      (file) => !file || ACCEPTED_SOUND_TYPES.includes(file.type),
      "Only .mp3, .wav, .ogg formats are supported.",
    ),
});

export const editGiftFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Gift name must be at least 2 characters")
    .max(50, "Gift name must be at most 50 characters"),
  price: z
    .number()
    .int("Price must be a whole number")
    .min(0, "Price cannot be negative"),
  duration: z
    .number()
    .int("Duration must be a whole number")
    .min(1, "Duration must be at least 1"),
  tier: z.nativeEnum(GiftTier),
  shake_level: z.nativeEnum(ShakeLevel),
  is_active: z.boolean(),
  is_chatMode: z.boolean(),
  is_streamMode: z.boolean(),
});

export type EditGiftFormData = z.infer<typeof editGiftFormSchema>;
export type EditGiftMediaFormData = z.infer<typeof editGiftMediaSchema>;
