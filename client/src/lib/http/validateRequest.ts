import { ZodSchema, ZodError } from "zod";
import { normalizeError } from "./normalize/normalize-error";

export async function validateJson<T = any>(
  request: Request,
  schema: ZodSchema<T>
): Promise<{
  data?: T;
  error?: ReturnType<typeof normalizeError>;
}> {
  try {
    const body = await request.json();
    const data = schema.parse(body);

    return { data };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        error: normalizeError(error, 422),
      };
    }

    return {
      error: normalizeError(error, 400),
    };
  }
}
