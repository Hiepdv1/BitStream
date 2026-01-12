import { z } from "zod";
import { ERROR_MESSAGES, PASSWORD_MIN_LENGTH } from "../constants";

export const signInSchema = z.object({
  email: z
    .string()
    .min(1, ERROR_MESSAGES.REQUIRED_FIELD)
    .email(ERROR_MESSAGES.INVALID_EMAIL),
  password: z.string().min(1, ERROR_MESSAGES.REQUIRED_FIELD),
});

export type SignInFormData = z.infer<typeof signInSchema>;
