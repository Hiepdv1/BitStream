export interface NormalizedResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  fieldErrors?: Record<string, string[]>;
  meta?: PaginationMeta;
  status: number;
}

export interface PaginationMeta {
  page: number | null;
  limit: number;
  total: number;
  nextOffsetMs?: number;
  hasMore?: boolean;
}
