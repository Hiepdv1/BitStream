import { BaseResponse, PaginationMeta } from './response.types';

export function Ok<T>(data: T, message = 'OK'): BaseResponse<T> {
  return {
    success: true,
    message,
    data,
  };
}

export function paginatedResponse<T>(
  data: T[],
  meta: PaginationMeta,
  message = 'OK',
): BaseResponse<T[]> {
  return {
    success: true,
    message,
    data,
    meta,
  };
}

export function Fail(
  message: string,
  errors: unknown = null,
): BaseResponse<null> {
  return {
    success: false,
    message,
    errors,
  };
}
