export interface ApiFieldErrors {
  [field: string]: string[];
}

export interface ApiError {
  message: string;
  status: number;
  fieldErrors?: ApiFieldErrors;
  raw?: unknown;
}
