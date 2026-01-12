export interface INextApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  statusCode: number;
}
