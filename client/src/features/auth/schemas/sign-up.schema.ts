import { z } from "zod";
import { ERROR_MESSAGES, PASSWORD_MIN_LENGTH } from "../constants";

export const signUpSchema = z
  .object({
    fullName: z.string().min(1, ERROR_MESSAGES.REQUIRED_FIELD),
    email: z
      .string()
      .min(1, ERROR_MESSAGES.REQUIRED_FIELD)
      .email(ERROR_MESSAGES.INVALID_EMAIL),
    password: z
      .string()
      .min(1, ERROR_MESSAGES.REQUIRED_FIELD)
      .min(PASSWORD_MIN_LENGTH, ERROR_MESSAGES.PASSWORD_TOO_SHORT),
    confirmPassword: z.string().min(1, ERROR_MESSAGES.REQUIRED_FIELD),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: ERROR_MESSAGES.TERMS_REQUIRED,
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: ERROR_MESSAGES.PASSWORD_MISMATCH,
    path: ["confirmPassword"],
  });

export type SignUpFormData = z.infer<typeof signUpSchema>;
