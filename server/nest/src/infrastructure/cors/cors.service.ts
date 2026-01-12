import { ForbiddenException, Injectable } from '@nestjs/common';
import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CorsService {
  constructor(private readonly config: ConfigService) {}

  createOptions(): CorsOptions {
    const origins = this.config.get<string>('CORS_ORIGINS')?.split(',') ?? [];

    return {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        if (origins.includes(origin)) {
          return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'), false);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Signature',
        'X-Timestamp',
        'X-Nonce',
        'X-Key-Id',
        'X-Provider',
      ],
    };
  }
}
