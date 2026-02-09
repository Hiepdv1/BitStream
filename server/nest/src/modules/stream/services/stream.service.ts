import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { StreamDto, StreamOnPublishDto } from '../dtos/stream.dto';
import { AccessTokenPayload } from 'src/modules/auth/types/auth';
import crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { KafkaProducerService } from 'src/infrastructure/kafka/kafka.producer';
import { KafkaTopic } from 'src/infrastructure/kafka/kafka.topics';
import { plainToClass } from 'class-transformer';
import { StreamStartedPayload } from 'src/common/kafka-payloads/stream';
import { generateRandomString, validateKafkaPayload } from 'src/common/utils';
import { LoggerService } from 'src/infrastructure/logger/logger.service';
import { Prisma, StreamVisibility } from 'src/generated/prisma/client';
import { ConfigService } from '@nestjs/config';
import { RedisService } from 'src/infrastructure/redis/redis.service';
import { RedisKeyManager } from 'src/infrastructure/redis/redis-key.manager';
import { MinioService } from 'src/infrastructure/minio/minio.service';

@Injectable()
export class StreamService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
    private readonly redisService: RedisService,
    private readonly kafkaProducerService: KafkaProducerService,
    private readonly minioService: MinioService,
  ) {}

  public async createStream(data: StreamDto, auth: AccessTokenPayload) {
    const rawKey = crypto.randomBytes(32).toString('hex');

    const keyHash = await bcrypt.hash(rawKey, 10);
    const stream = await this.prisma.stream.create({
      data: {
        ...data,
        userId: auth.sub,
        ingestKey: {
          create: {
            keyHash,
            expiresAt: null,
          },
        },
      },
      include: {
        ingestKey: true,
      },
    });

    return {
      streamID: stream.id,
      streamKey: `${stream.id}?token=${rawKey}`,
      rtmpUrl: `rtmp://localhost:1935/live`,
      dashUrl: `http://localhost:8080/api/stream/watch/${stream.id}/manifest.mpd`,
    };
  }

  public async onPublish(data: StreamOnPublishDto) {
    const streamKey = await this.GetRequiredStreamKeyByStreamId(data.streamId);

    const isMatch = await this.verifyStreamKey(streamKey, data.token);

    if (!isMatch) {
      throw new BadRequestException('Invalid stream key');
    }

    const rtmpHost = this.config.get('RTMP_HOST');
    const rtmpPort = this.config.get('RTMP_PORT');

    const payload = plainToClass(StreamStartedPayload, {
      streamId: data.streamId,
      rtmpUrl: `rtmp://${rtmpHost}:${rtmpPort}/live/${data.streamId}`,
      retryCount: 0,
      maxRetry: 3,
      eventId: generateRandomString(),
      occurredAt: new Date().toISOString(),
      action: 'START',
    } as StreamStartedPayload);

    const { data: value, errors } = await validateKafkaPayload(
      StreamStartedPayload,
      payload,
    );

    if (errors) {
      const error = errors[0];

      this.logger.error({
        message: 'Kafka Stream Payload Validation Failed',
        error: {
          name: error.field,
          message: error.errors.join(','),
        },
        service: 'Stream Service',
        context: 'onPublish',
        timestamp: new Date().toISOString(),
      });

      throw new InternalServerErrorException('Internal Server Error');
    }

    await this.prisma.$transaction([
      this.prisma.stream.update({
        where: { id: data.streamId },
        data: {
          isLive: true,
          startedAt: new Date(),
          endedAt: null,
        },
      }),
      this.prisma.streamMeta.upsert({
        where: { streamId: data.streamId },
        create: {
          streamId: data.streamId,
          segmentDuration: 2,
          timescale: 1000,
          videoRepId: '0',
          audioRepId: '1',
          basePath: `streams/${data.streamId}`,
        },
        update: {
          updatedAt: new Date(),
        },
      }),
    ]);

    await this.kafkaProducerService.publish(
      KafkaTopic.STREAM_ON_PUBLISH,
      value,
      data.streamId,
    );
  }

  public async onDone(data: StreamOnPublishDto) {
    const payload = plainToClass(StreamStartedPayload, {
      streamId: data.streamId,
      rtmpUrl: `rtmp://localhost:1935/live/${data.streamId}`,
      retryCount: 0,
      maxRetry: 3,
      eventId: generateRandomString(),
      occurredAt: new Date().toISOString(),
      action: 'STOP',
    } as StreamStartedPayload);

    const { data: value, errors } = await validateKafkaPayload(
      StreamStartedPayload,
      payload,
    );

    if (errors) {
      const error = errors[0];

      this.logger.error({
        message: 'Kafka Stream Payload Validation Failed',
        error: {
          name: error.field,
          message: error.errors.join(','),
        },
        service: 'Stream Service',
        context: 'onPublish',
        timestamp: new Date().toISOString(),
      });

      throw new InternalServerErrorException('Internal Server Error');
    }

    await Promise.all([
      this.prisma.stream.update({
        where: {
          id: data.streamId,
          isLive: true,
        },
        data: {
          isLive: false,
          endedAt: new Date(),
        },
      }),
      this.prisma.streamKey.update({
        where: {
          streamId: data.streamId,
        },
        data: {
          isActive: false,
          expiresAt: new Date(),
        },
      }),
    ]);

    await this.kafkaProducerService.publish(
      KafkaTopic.STREAM_ON_PUBLISH,
      value,
      data.streamId,
    );
  }

  public async getStreamInfo(streamId: string) {
    const stream = await this.prisma.stream.findUnique({
      where: { id: streamId },
      include: {
        meta: true,
      },
    });

    if (!stream || stream.visibility === StreamVisibility.PRIVATE) {
      throw new NotFoundException('Stream not found or private');
    }

    return stream;
  }

  // ------------------------------- PRIVATE METHODS -------------------------------

  private async GetRequiredStreamKeyByStreamId(streamId: string) {
    const streamKey = await this.prisma.streamKey.findUnique({
      where: {
        streamId,
      },
    });

    if (!streamKey) {
      throw new NotFoundException('Stream not found');
    }

    return streamKey;
  }

  private async verifyStreamKey(
    streamKey: Prisma.StreamKeyCreateManyInput,
    token: string,
  ) {
    const isMatch = bcrypt.compareSync(token, streamKey.keyHash);

    if (!isMatch) {
      throw new BadRequestException('Invalid stream key');
    }

    if (!streamKey.isActive) {
      throw new BadRequestException('Stream key is not active');
    }

    if (streamKey.expiresAt && streamKey.expiresAt < new Date()) {
      throw new BadRequestException('Stream key has expired');
    }

    return true;
  }
}
