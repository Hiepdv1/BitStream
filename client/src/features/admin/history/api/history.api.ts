import { httpRequest } from "@/lib/http/client/http-client";
import { HistoryRecord, HistoryStats } from "../types/history";

export interface GetHistoriesQuery {
  page?: number;
  limit?: number;
  search?: string;
  service?: string;
  action?: string;
  status?: string;
  sort?: string;
}

export const getHistories = async (query: GetHistoriesQuery) => {
  const res = await httpRequest<HistoryRecord[]>({
    method: "GET",
    url: "/histories",
    params: {
      ...query,
      service: query.service === "ALL" ? undefined : query.service,
      action: query.action === "ALL" ? undefined : query.action,
      status: query.status === "ALL" ? undefined : query.status,
    },
  });

  return res;
};

export const getHistoryStats = async () => {
  const res = await httpRequest<HistoryStats>({
    method: "GET",
    url: "/histories/stats",
  });

  return res.data;
};

export const restoreHistory = async ({
  id,
  reason,
}: {
  id: string;
  reason?: string;
}) => {
  const res = await httpRequest<HistoryRecord>({
    method: "POST",
    url: `/histories/${id}/restore`,
    data: reason ? { reason } : undefined,
  });

  return res.data;
};

export const rollbackHistory = async ({
  id,
  reason,
}: {
  id: string;
  reason?: string;
}) => {
  const res = await httpRequest<HistoryRecord>({
    method: "POST",
    url: `/histories/${id}/rollback`,
    data: reason ? { reason } : undefined,
  });

  return res.data;
};

export const deleteHistory = async ({
  id,
  reason,
}: {
  id: string;
  reason?: string;
}) => {
  const res = await httpRequest<void>({
    method: "DELETE",
    url: `/histories/${id}`,
    data: reason ? { reason } : undefined,
  });

  return res;
};
