import crypto from 'crypto';

export const generateRandomString = (bytes = 32) =>
  crypto.randomBytes(bytes).toString('hex');
