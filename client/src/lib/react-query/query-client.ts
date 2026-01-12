import { QueryClient, DefaultOptions } from "@tanstack/react-query";

const queryConfig: DefaultOptions = {
  queries: {
    staleTime: 1000 * 60 * 5,
    retry: 1,
    refetchOnWindowFocus: false,
  },
};

export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
});
