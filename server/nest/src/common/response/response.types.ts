export interface BasePaginationMeta {
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface PagePaginationMeta extends BasePaginationMeta {
  page: number;
}

export interface OffsetPaginationMeta extends BasePaginationMeta {
  nextOffsetMs: number | null;
  hasMore: boolean;
}

// export interface CursorPaginationMeta extends BasePaginationMeta {
//   nextCursor: string | null;
// }

export interface BaseResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
  meta?: BasePaginationMeta;
}
