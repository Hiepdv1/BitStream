import { PaginationMeta } from "../normalize/types";

export interface BaseResponse<T = any> {
  message: string;
  data: T;
  success: boolean;
  Meta: PaginationMeta;
}
