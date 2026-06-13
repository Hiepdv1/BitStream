import { httpRequest } from "@/lib/http/client/http-client";
import { ProfileExtensions, ResponseUploadAvatar } from "../types/profile";

export const getProfileExtensions = async () => {
  const res = await httpRequest<ProfileExtensions>({
    url: "/user/me/extensions",
    method: "GET",
  });
  return res.data;
};

export const setupPassword = async (password: string) => {
  const res = await httpRequest<void>({
    url: "/user/me/setup-password",
    method: "POST",
    data: {
      password,
    },
  });
  return res.data;
};

export const unlinkSocialAccount = async (provider: string) => {
  const res = await httpRequest<void>({
    url: "/user/me/unlink-account",
    method: "POST",
    data: {
      provider,
    },
  });
  return res.data;
};

export const changePassword = async (data: Record<string, string>) => {
  const res = await httpRequest<void>({
    url: "/user/me/change-password",
    method: "POST",
    data,
  });
  return res.data;
};

export const updateProfile = async (data: { name?: string; bio?: string }) => {
  const res = await httpRequest<void>({
    url: "/user/me",
    method: "PATCH",
    data,
  });
  return res.data;
};

export const uploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append("thumbnail", file);

  const res = await httpRequest<ResponseUploadAvatar>({
    url: "/user/me/avatar",
    method: "PATCH",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};
