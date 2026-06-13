export enum HistoryAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  RESTORE = "RESTORE",
}

export enum HistoryStatus {
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  PENDING = "PENDING",
}

export interface HistoryRecord {
  id: string;
  type: string;
  action: HistoryAction;
  entity_id: string;
  entity_name: string;
  service: string;
  is_entity_deleted: boolean;
  data: any;
  status: HistoryStatus;
  created_at: string;
  deleted_at: string | null;
}

export interface HistoryFilterState {
  search: string;
  service: string;
  action: string;
  status: string;
  sort: "NEWEST" | "OLDEST";
}

export interface HistoryStats {
  totalHistories: number;
  totalPending: number;
  totalFailed: number;
  totalDeleted: number;
}
