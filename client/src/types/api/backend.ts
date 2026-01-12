export interface IBackendResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  error?: string | Array<{ message: string; field?: string }>;
}

export interface IFetchResult<T> {
  success: boolean;
  status: number;
  message: string;
  headers?: Headers;
  data?: T | null;
  error?: string;
}
