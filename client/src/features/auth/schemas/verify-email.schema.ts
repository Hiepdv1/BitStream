import { z } from "zod";
import { ERROR_MESSAGES } from "../constants";

export const VerifyEmailSchema = z.object({
  token: z.string().min(1, ERROR_MESSAGES.REQUIRED_FIELD),
});

export type VerifyEmailFormData = z.infer<typeof VerifyEmailSchema>;
