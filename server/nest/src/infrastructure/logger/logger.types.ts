export type LogLevel = 'error' | 'warn' | 'info';

export interface SystemLog {
  level: LogLevel;
  message: string;
  timestamp: string;
  service: string;
  traceId?: string;
  data?: string;
  context?: string;
  error?: any;
  request?: {
    method: string;
    path: string;
    ip?: string;
    userAgent?: string;
  };
  performance?: {
    duration: number;
    threshold: number;
  };
}
