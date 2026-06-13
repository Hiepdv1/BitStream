import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import {
  ListStreamQueryDto,
  StreamDto,
  StreamOnPublishDto,
  StreamStatusQuery,
  UpdateStreamDto,
} from '../dtos/stream.dto';
import { AccessTokenPayload, AuthPayload } from 'src/modules/auth/types/auth';
import crypto from 'crypto';
import { KafkaProducerService } from 'src/infrastructure/kafka/kafka.producer';
import { KafkaTopic } from 'src/infrastructure/kafka/kafka.topics';
import { plainToClass } from 'class-transformer';
import { StreamStartedPayload } from 'src/common/kafka-payloads/stream';
import {
  generateNanoId,
  generateRandomString,
  validateKafkaPayload,
} from 'src/common/utils';
import { LoggerService } from 'src/infrastructure/logger/logger.service';
import {
  GiftAssetType,
  MediaStatus,
  Prisma,
  StreamEventType,
  StreamVisibility,
} from 'src/generated/prisma/client';
import { ConfigService } from '@nestjs/config';
import { ChatInternalService } from 'src/modules/chat/services/chat-internal.service';
import { CypherService } from 'src/infrastructure/security/cipher.service';
import { MinioService } from 'src/infrastructure/minio/minio.service';
import { extname } from 'path';
import { MetaHelper } from 'src/common/helpers/meta.helper';

@Injectable()
export class StreamService {
  private readonly MAX_TAGS = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
    private readonly kafkaProducerService: KafkaProducerService,
    private readonly chatInternalService: ChatInternalService,
    private readonly cipherService: CypherService,
    private readonly minioService: MinioService,
  ) {}

  public async createStream(data: StreamDto, auth: AccessTokenPayload) {
    const { extractedTags, thumbnail, ...rest } = data;
    const rawKey = crypto.randomBytes(32).toString('hex');

    const bucket = this.minioService.getStreamThumbnailBucket();
    let thumbnailFileName: string | null = null;

    const rawTags = data.extractedTags || [];
    const processedTags = rawTags
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0)
      .slice(0, this.MAX_TAGS);

    try {
      if (thumbnail) {
        const thumbnailID = generateNanoId(32);
        const thumbnailExt = extname(thumbnail.originalname);
        thumbnailFileName = `${thumbnailID}${thumbnailExt}`;

        await this.minioService.uploadFile(
          bucket,
          `${thumbnailFileName}`,
          thumbnail.buffer,
          thumbnail.size,
          { contentType: thumbnail.mimetype },
        );
      }

      const encryptedKey = await this.cipherService.encrypt(rawKey);
      const stream = await this.prisma.stream.create({
        data: {
          ...rest,
          tags: {
            connectOrCreate: processedTags.map((tag) => ({
              where: { name: tag },
              create: { name: tag },
            })),
          },
          userId: auth.sub,
          ingestKey: {
            create: {
              encryptedKey: encryptedKey.content,
              iv: encryptedKey.iv,
              algorithm: encryptedKey.algorithm,
              expiresAt: null,
            },
          },
          thumbnails: {
            create: {
              uploaderId: auth.sub,
              giftAssetType: GiftAssetType.IMAGE,
              status: MediaStatus.ACTIVE,
              storageKey: thumbnailFileName!,
              bucketName: bucket,
              originalName: thumbnail?.originalname || '',
              mimeType: thumbnail?.mimetype || '',
              size: thumbnail?.size || 0,
            },
          },
        },
      });

      return {
        streamID: stream.id,
        streamKey: `${stream.id}?token=${rawKey}`,
        rtmpUrl: `rtmp://localhost:1935/live`,
        dashUrl: `http://localhost:8080/api/live/streams/${stream.id}/manifest.mpd`,
      };
    } catch (error) {
      if (thumbnailFileName) {
        await this.minioService.deleteObject(bucket, thumbnailFileName);
      }
      this.logger.error({
        message: 'can not create stream',
        error: error.message,
        service: 'StreamService',
        context: 'createStream',
        timestamp: new Date().toISOString(),
      });
      throw new InternalServerErrorException(
        'can not create stream please try again!',
      );
    }
  }

  public async getListStream(query: ListStreamQueryDto, auth: AuthPayload) {
    const { page, limit, status, search } = query;

    const andConditions: Prisma.StreamWhereInput[] = [
      { userId: auth.sub, isDeleted: false },
    ];

    if (search) {
      andConditions.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          {
            tags: { some: { name: { contains: search, mode: 'insensitive' } } },
          },
        ],
      });
    }

    const statusFilters: Record<StreamStatusQuery, Prisma.StreamWhereInput> = {
      [StreamStatusQuery.ENDED]: {
        startedAt: { not: null },
        endedAt: { not: null },
      },
      [StreamStatusQuery.LIVE]: { startedAt: { not: null }, endedAt: null },
      [StreamStatusQuery.DRAFT]: { startedAt: null, endedAt: null },
      [StreamStatusQuery.ALL]: {},
    };

    if (status && statusFilters[status]) {
      andConditions.push(statusFilters[status]);
    }

    const where: Prisma.StreamWhereInput = { AND: andConditions };

    const [streams, total] = await this.prisma.$transaction([
      this.prisma.stream.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          startedAt: true,
          endedAt: true,
          createdAt: true,
          isLive: true,
          visibility: true,
          meta: {
            select: { totalDuration: true },
          },
          thumbnails: {
            where: { status: MediaStatus.ACTIVE },
            select: {
              storageKey: true,
            },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.stream.count({ where }),
    ]);

    return {
      data: streams,
      pagination: MetaHelper.page(page, limit, total),
    };
  }

  public async getStreamKey(streamId: string, auth: AuthPayload) {
    const streamKey = await this.prisma.streamKey.findUnique({
      where: {
        streamId,
        stream: {
          userId: auth.sub,
          isDeleted: false,
        },
      },
    });

    if (!streamKey) {
      throw new NotFoundException('Stream not found');
    }

    const rawKey = await this.cipherService.decrypt(
      streamKey.encryptedKey,
      streamKey.iv || '',
      streamKey.algorithm,
    );

    return {
      streamID: streamKey.streamId,
      streamKey: `${streamKey.streamId}?token=${rawKey}`,
      rtmpUrl: `rtmp://localhost:1935/live`,
      dashUrl: `http://localhost:8080/api/live/streams/${streamKey.streamId}/manifest.mpd`,
      expiresAt: streamKey.expiresAt,
    };
  }

  public async updateStream(
    streamID: string,
    data: UpdateStreamDto,
    auth: AuthPayload,
  ) {
    const stream = await this.prisma.stream.findUnique({
      where: { id: streamID, userId: auth.sub },
    });
    if (!stream || stream.isDeleted) {
      throw new NotFoundException('Stream not found');
    }

    if (stream.userId !== auth.sub) {
      throw new BadRequestException(
        'You are not authorized to update this stream',
      );
    }

    const { extractedTags, thumbnail, ...rest } = data;

    const bucket = this.minioService.getStreamThumbnailBucket();
    let thumbnailFileName: string | null = null;

    const rawTags = data.extractedTags || [];
    const processedTags = rawTags
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0)
      .slice(0, this.MAX_TAGS);

    if (thumbnail) {
      const thumbnailID = generateNanoId(32);
      const thumbnailExt = extname(thumbnail.originalname);
      thumbnailFileName = `${thumbnailID}${thumbnailExt}`;

      await this.minioService.uploadFile(
        bucket,
        `${thumbnailFileName}`,
        thumbnail.buffer,
        thumbnail.size,
        { contentType: thumbnail.mimetype },
      );
    }

    const thumbnailData = thumbnailFileName
      ? {
          thumbnails: {
            updateMany: {
              where: { status: MediaStatus.ACTIVE },
              data: { status: MediaStatus.SOFT_DELETED },
            },
            create: [
              {
                uploaderId: auth.sub,
                giftAssetType: GiftAssetType.IMAGE,
                status: MediaStatus.ACTIVE,
                storageKey: thumbnailFileName,
                bucketName: bucket,
                originalName: thumbnail?.originalname || '',
                mimeType: thumbnail?.mimetype || '',
                size: thumbnail?.size || 0,
              },
            ],
          },
        }
      : {};

    try {
      const updatedStream = await this.prisma.stream.update({
        where: { id: streamID },
        data: {
          ...rest,
          tags: {
            connectOrCreate: processedTags.map((tag) => ({
              where: { name: tag },
              create: { name: tag },
            })),
          },
          ...thumbnailData,
        },
      });

      return updatedStream;
    } catch {
      if (thumbnailFileName) {
        await this.minioService.deleteObject(bucket, thumbnailFileName);
      }
      throw new InternalServerErrorException('Failed to update stream');
    }
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

    await this.prisma.$transaction(async () => {
      await this.prisma.streamEvent.create({
        data: {
          streamId: data.streamId,
          type: StreamEventType.STREAM_CONNECT,
        },
      });

      const kafkaErr = await this.kafkaProducerService.publish(
        KafkaTopic.STREAM_ON_PUBLISH,
        value,
        data.streamId,
      );

      if (kafkaErr) {
        this.logger.error({
          message: 'Kafka Stream Payload Validation Failed',
          error: kafkaErr,
          service: 'Stream Service',
          data: JSON.stringify(value),
          context: 'onPublish',
          timestamp: new Date().toISOString(),
        });

        throw new InternalServerErrorException('Internal Server Error');
      }
    });

    await this.chatInternalService.addActiveStream(data.streamId);
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

    const [_, kafkaErr] = await Promise.all([
      this.prisma.$transaction([
        this.prisma.streamKey.update({
          where: {
            streamId: data.streamId,
          },
          data: {
            isActive: false,
            expiresAt: new Date(),
          },
        }),
        this.prisma.streamEvent.create({
          data: {
            streamId: data.streamId,
            type: StreamEventType.STREAM_STOP,
          },
        }),
      ]),
      this.kafkaProducerService.publish(
        KafkaTopic.STREAM_ON_PUBLISH,
        value,
        data.streamId,
      ),
    ]);

    if (kafkaErr) {
      this.logger.error({
        message: 'Kafka Stream Payload Validation Failed',
        error: kafkaErr,
        service: 'Stream Service',
        context: 'onPublish',
        data: JSON.stringify(value),
        timestamp: new Date().toISOString(),
      });
    }

    await this.chatInternalService.removeActiveStream(data.streamId);
  }

  public async getStream(streamId: string) {
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

  public async deleteStream(auth: AuthPayload, streamID: string) {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.media.updateMany({
          where: {
            streamId: streamID,
            status: MediaStatus.ACTIVE,
          },
          data: {
            status: MediaStatus.SOFT_DELETED,
            deletedAt: new Date(),
          },
        });

        await tx.stream.update({
          where: {
            id: streamID,
            userId: auth.sub,
            isLive: false,
            isDeleted: false,
          },
          data: {
            isDeleted: true,
            deletedAt: new Date(),
          },
        });
      });

      return 'Stream deleted successfully';
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        const checkStream = await this.prisma.stream.findUnique({
          where: { id: streamID, userId: auth.sub },
          select: { userId: true, isLive: true },
        });

        if (!checkStream) {
          throw new NotFoundException('Stream not found');
        }

        if (checkStream.isLive) {
          throw new BadRequestException(
            'Please turn off the stream before deleting',
          );
        }
      }

      throw error;
    }
  }

  public async getStreamInfo(streamId: string, auth?: AccessTokenPayload) {
    const stream = await this.prisma.stream.findUnique({
      where: { id: streamId },
      include: {
        meta: true,
        user: {
          select: {
            name: true,
            profileImages: {
              where: {
                status: MediaStatus.ACTIVE,
              },
              select: {
                storageKey: true,
              },
            },
          },
        },
        tags: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!stream) throw new NotFoundException('Stream not found');

    if (stream.visibility === StreamVisibility.PRIVATE) {
      if (!auth || stream.userId !== auth.sub) {
        throw new ForbiddenException('Forbidden');
      }
    }

    const { expiresMs, manifestUrl } = this.createSignedUrl(
      stream.id,
      stream.isLive,
    );

    return {
      streamId: stream.id,
      title: stream.title,
      description: stream.description,
      isLive: stream.isLive,
      totalDuration: stream.meta?.totalDuration || 0,
      sourceWidth: stream.meta?.sourceWidth || null,
      sourceHeight: stream.meta?.sourceHeight || null,
      ladders: stream.meta?.ladders || null,
      avatarUrl: stream.user.profileImages?.[0]?.storageKey,
      name: stream.user.name,
      tags: stream.tags.map((tag) => tag.name),
      createdAt: stream.createdAt,
      updatedAt: stream.updatedAt,
      manifestUrl,
      expiresMs,
    };
  }

  public async getStreamSession(streamID: string) {
    const stream = await this.prisma.stream.findUnique({
      where: {
        id: streamID,
      },
      select: {
        id: true,
        isLive: true,
        visibility: true,
        userId: true,
      },
    });

    if (!stream) {
      throw new BadRequestException('Stream not found');
    }

    if (stream.visibility === StreamVisibility.PRIVATE) {
      throw new ForbiddenException('Forbidden');
    }

    const manifestUrl = this.createSignedUrl(stream.id, stream.isLive);

    return manifestUrl;
  }

  public async followStream(auth: AuthPayload, streamId: string) {
    return 'Followed stream successfully';
  }

  // ------------------------------- PRIVATE METHODS -------------------------------

  private createSignedUrl(streamID: string, isLive: boolean) {
    const uri = isLive
      ? `/live/streams/${streamID}/manifest.mpd`
      : `/vod/streams/${streamID}/vod.mpd`;

    const expires = Math.floor(Date.now() / 1000) + 3600;

    const inputString = `${expires}${uri} ${this.config.get<string>('NGINX_SECRET')}`;

    const hash = crypto
      .createHash('md5')
      .update(inputString)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    return {
      manifestUrl: `${this.config.get<string>('CDN_DOMAIN')}${uri}?st=${hash}&e=${expires}`,
      expiresMs: expires * 1000,
    };
  }

  private async GetRequiredStreamKeyByStreamId(streamId: string) {
    const streamKey = await this.prisma.streamKey.findUnique({
      where: {
        streamId,
        stream: {
          isDeleted: false,
        },
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
    if (!streamKey.iv) {
      throw new BadRequestException('Invalid stream key');
    }

    const decrypted = await this.cipherService.decrypt(
      streamKey.encryptedKey,
      streamKey.iv,
    );

    const isMatch = decrypted === token;

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
