import { BasePaginationMeta, BaseResponse } from './response.types';

export function paginatedResponse<T>(
  data: T[],
  meta: BasePaginationMeta,
  message = 'OK',
): BaseResponse<T[]> {
  const cleanMeta = Object.fromEntries(
    Object.entries(meta).filter(([_, v]) => v !== null && v !== undefined),
  ) as BasePaginationMeta;

  return {
    success: true,
    message,
    data,
    meta: cleanMeta,
  };
}

export function Ok<T>(data: T, message = 'OK'): BaseResponse<T> {
  return { success: true, message, data };
}

export function Fail(
  message: string,
  errors: unknown = null,
): BaseResponse<null> {
  return { success: false, message, errors };
}
