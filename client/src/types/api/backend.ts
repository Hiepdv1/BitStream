export interface IBackendResponse<T = any> {
  success: boolean;
  message: string;
  statusCode: number;
  data: T | null;
  error?: string | Array<{ message: string; field?: string }>;
}
