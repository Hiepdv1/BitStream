import z from "zod";
import { GiftTier, ShakeLevel } from "../types/gift";

export const createGiftSchema = z.object({
  name: z
    .string()
    .min(2, "Gift name must be at least 2 characters")
    .max(50, "Gift name must be at most 50 characters"),
  price: z
    .number()
    .int("Price must be a whole number")
    .min(1, "Price must be at least 1 coin"),
  duration: z
    .number()
    .int("Duration must be a whole number")
    .min(1, "Duration must be at least 1 second")
    .max(30, "Duration must be at most 30 seconds"),
  tier: z.nativeEnum(GiftTier),
  shake_level: z.nativeEnum(ShakeLevel),
  is_active: z.boolean(),
});

export type CreateGiftFormData = z.infer<typeof createGiftSchema>;
