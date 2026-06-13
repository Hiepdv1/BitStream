import { httpRequest } from "@/lib/http/client/http-client";

export const createStudio = async () => {
  const res = await httpRequest<createStudioResponse>({
    url: "/studio/create",
    method: "POST",
  });

  return res.data;
};
