import {
  QueryClient,
  defaultShouldDehydrateQuery,
} from "@tanstack/react-query";
import { cache } from "react";

export const getQueryClient = cache(() => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
      },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
    },
  });
});
