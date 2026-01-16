export function buildQuery(params?: Record<string, any>): string {
  if (!params) return "";

  const query = new URLSearchParams(
    Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => [key, String(value)])
  ).toString();

  return query ? `?${query}` : "";
}
