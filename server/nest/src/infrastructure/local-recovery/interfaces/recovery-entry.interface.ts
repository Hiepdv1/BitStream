export interface RecoveryEntry<T = any> {
  type: string;
  source: string;
  timestamp: number;
  data: T;
  reason?: string;
}
