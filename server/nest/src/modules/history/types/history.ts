export type DeleteEntityDataHistory = {
  full_data_snapshot: any;
  deleted_at: string;
  deleted_by: string;
};

export type RestoreEntityDataHistory = {
  restored_from_history_id: string;
  restored_by: string;
  timestamp: string;
  reason: string;
};

export type UpdateEntityDataHistory = {
  full_data_snapshot: any;
  updated_at: string;
  updated_by: string;
};

export type RollbackEntityDataHistory = {
  full_data_snapshot: any;
  rolledback_at: string;
  rolledback_by: string;
  original_history_id: string;
  reason: string;
};
