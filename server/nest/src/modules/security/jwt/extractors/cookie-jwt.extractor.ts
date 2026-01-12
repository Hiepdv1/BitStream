import { Request } from 'express';

export const cookieJwtExtractor = (req: Request): string | null => {
  if (!req || !req.cookies) return null;

  return req.cookies['access_token'] ?? null;
};
