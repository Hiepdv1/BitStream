import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { StreamVisibility } from 'src/generated/prisma/enums';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { LoggerService } from 'src/infrastructure/logger/logger.service';
import { MinioService } from 'src/infrastructure/minio/minio.service';
import { AccessTokenPayload } from 'src/modules/auth/types/auth';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DashPlaylistService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly minio: MinioService,
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
  ) {}

  async getStreamInfo(streamId: string, auth?: AccessTokenPayload) {
    const stream = await this.prisma.stream.findUnique({
      where: { id: streamId },
      include: { meta: true },
    });

    if (!stream) throw new NotFoundException('Stream not found');

    if (stream.visibility === StreamVisibility.PRIVATE) {
      if (!auth || stream.userId !== auth.sub) {
        throw new ForbiddenException('Forbidden');
      }
    }

    const uri = stream.isLive
      ? `/live/streams/${streamId}/manifest.mpd`
      : `/vod/streams/${streamId}/vod.mpd`;

    const expires = Math.floor(Date.now() / 1000) + 3600;

    const inputString = `${expires}${uri} ${this.configService.get<string>('NGINX_SECRET')}`;

    const hash = crypto
      .createHash('md5')
      .update(inputString)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    return {
      streamId: stream.id,
      title: stream.title,
      description: stream.description,
      isLive: stream.isLive,
      totalDuration: stream.meta?.totalDuration || 0,
      sourceWidth: stream.meta?.sourceWidth || null,
      sourceHeight: stream.meta?.sourceHeight || null,
      ladders: stream.meta?.ladders || null,
      createdAt: stream.createdAt,
      updatedAt: stream.updatedAt,
      manifestUrl: `${this.configService.get<string>('CDN_DOMAIN')}${uri}?st=${hash}&e=${expires}`,
    };
  }
}
