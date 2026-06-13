import { PaginationMeta } from "../normalize/types";

export interface NormalizedResponseSuccess<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}
