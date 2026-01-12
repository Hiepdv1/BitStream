export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export interface BaseResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
  meta?: PaginationMeta;
}
