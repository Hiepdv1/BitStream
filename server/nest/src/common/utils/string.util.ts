import crypto from 'crypto';
import { nanoid } from 'nanoid';

export const generateRandomString = (bytes = 32) =>
  crypto.randomBytes(bytes).toString('hex');

export const generateNanoId = (size = 21) => nanoid(size);
