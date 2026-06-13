export const buildQuery = (params: Record<string, any>) => {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      search.append(key, value);
    }
  });

  const query = search.toString();

  return query ? `?${query}` : "";
};
