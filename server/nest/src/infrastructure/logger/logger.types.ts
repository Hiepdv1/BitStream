export type LogLevel = 'error' | 'warn' | 'info';

export interface SystemLog {
  level: LogLevel;
  message: string;
  timestamp: string;
  service: string;
  traceId?: string;
  context?: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
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
