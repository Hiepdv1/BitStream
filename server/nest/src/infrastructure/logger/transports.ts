import { transports } from 'winston';

export const errorFileTransport = new transports.File({
  filename: 'logs/error.log',
  level: 'error',
});

export const combinedFileTransport = new transports.File({
  filename: 'logs/combined.log',
});
