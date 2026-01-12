import { PaginationMeta } from "../normalize/types";

export interface NormalizedResponseSuccess<T> {
  success: true;
  message: string;
  data: T;
  status: number;
  meta?: PaginationMeta;
}
