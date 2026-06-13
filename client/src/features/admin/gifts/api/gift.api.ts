import { httpRequest } from "@/lib/http/client/http-client";
import {
  ActiveGiftDto,
  GetGiftQuery,
  Gift,
  GiftActive,
  GiftStats,
  UpdateGiftSettingsDto,
} from "../types/gift";

import type { AxiosProgressEvent } from "axios";

export interface CreateGiftParams {
  data: FormData;
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
  signal?: AbortSignal;
}

export interface UpdateGiftParams extends CreateGiftParams {
  giftID: string;
}

export const createGift = async ({
  data,
  onUploadProgress,
  signal,
}: CreateGiftParams) => {
  const res = await httpRequest<Gift>({
    method: "POST",
    url: "/gifts/create",
    data,
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress,
    signal,
  });

  return res.data;
};

export const getGifts = async (query: GetGiftQuery) => {
  const res = await httpRequest<Gift[]>({
    method: "GET",
    url: "/gifts/",
    params: query,
  });

  return res;
};

export const getGiftDetail = async (id: string) => {
  const res = await httpRequest<Gift>({
    method: "GET",
    url: `/gifts/${id}`,
  });
  return res.data;
};

export const getGiftStats = async () => {
  const res = await httpRequest<GiftStats>({
    method: "GET",
    url: "/gifts/stats",
  });

  return res.data;
};

export const updateGift = async ({
  giftID,
  data,
  onUploadProgress,
  signal,
}: UpdateGiftParams) => {
  const res = await httpRequest<Gift>({
    method: "PATCH",
    url: `/gifts/${giftID}/update`,
    data,
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress,
    signal,
  });
  return res.data;
};

export const deleteGift = async (id: string) => {
  const res = await httpRequest<void>({
    method: "DELETE",
    url: `/gifts/${id}`,
  });
  return res.data;
};

export const updateGiftActive = async (data: ActiveGiftDto) => {
  const res = await httpRequest<GiftActive>({
    method: "PATCH",
    url: "/gifts/active",
    data,
  });
  return res.data;
};

export const updateGiftSettings = async ({
  giftID,
  ...data
}: UpdateGiftSettingsDto) => {
  const res = await httpRequest<Gift>({
    method: "PATCH",
    url: `/gifts/${giftID}/display-settings`,
    data,
  });
  return res.data;
};
