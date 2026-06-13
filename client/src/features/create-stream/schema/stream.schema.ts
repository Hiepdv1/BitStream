import { z } from "zod";
import { HASHTAG_REGEX } from "@/constants/regex";

const extractTags = (text: string) => {
  if (!text) return [];
  const matches = text.match(HASHTAG_REGEX) || [];
  return matches.map((tag) => tag.trim().replace("#", ""));
};

export const createStreamSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(200, "Title must not exceed 200 characters"),
    description: z
      .string()
      .max(5000, "Description must not exceed 500 characters")
      .optional(),
    visibility: z.enum(["PUBLIC", "PRIVATE"]),
    thumbnail: z
      .any()
      .refine(
        (file) =>
          !file || (typeof window !== "undefined" && file instanceof File),
        "Invalid file format",
      )
      .optional(),
  })
  .superRefine((data, ctx) => {
    const titleTags = extractTags(data.title);
    const descTags = extractTags(data.description || "");

    titleTags.forEach((tag) => {
      if (tag.length > 20) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Hashtag #${tag} in title must not exceed 20 characters`,
          path: ["title"],
        });
      }
    });

    descTags.forEach((tag) => {
      if (tag.length > 20) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Hashtag #${tag} in description must not exceed 20 characters`,
          path: ["description"],
        });
      }
    });

    const allTags = new Set([...titleTags, ...descTags]);
    if (allTags.size > 10) {
      const errorMsg = `Maximum 10 hashtags allowed (found ${allTags.size})`;

      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: errorMsg,
        path: ["title"],
      });

      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: errorMsg,
        path: ["description"],
      });
    }
  });

export type CreateStreamInput = z.infer<typeof createStreamSchema>;
