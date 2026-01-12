import { format } from 'winston';

export const jsonLogFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),
  format.json(),
);
