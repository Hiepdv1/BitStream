import {
  BadRequestException,
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
import { stream } from 'winston';

@Injectable()
export class StreamService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly kafkaProducerService: KafkaProducerService,
    private readonly logger: LoggerService,
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
      hlsUrl: `https://localhost:80/hls/${stream.id}/index.m3u8`,
    };
  }

  public async verifyStreamKey(data: StreamOnPublishDto) {
    const streamKey = await this.GetRequiredStreamKeyByStreamId(data.streamId);

    const isMatch = await bcrypt.compare(data.token, streamKey.keyHash);

    if (!isMatch) {
      throw new BadRequestException('Invalid stream key');
    }

    if (!streamKey.isActive) {
      throw new BadRequestException('Stream key is not active');
    }

    if (streamKey.expiresAt && streamKey.expiresAt < new Date()) {
      throw new BadRequestException('Stream key has expired');
    }

    const payload = plainToClass(StreamStartedPayload, {
      streamId: data.streamId,
      rtmpUrl: `rtmp://localhost:1935/live/${data.streamId}`,
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

    await this.prisma.stream.update({
      where: {
        id: data.streamId,
        isLive: false,
      },
      data: {
        isLive: true,
      },
    });

    await this.kafkaProducerService.publish(
      KafkaTopic.STREAM_ON_PUBLISH,
      value,
      data.streamId,
    );

    return true;
  }

  public async GetRequiredStreamKeyByStreamId(streamId: string) {
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

  // ------------------------------- PRIVATE METHODS -------------------------------
}
