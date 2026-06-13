import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import {
  ActiveGiftDto,
  CreateGiftServiceDto,
  GetGiftsDto,
} from '../dto/create-gift';
import { AuthPayload } from 'src/modules/auth/types/auth';
import { MinioService } from 'src/infrastructure/minio/minio.service';
import { generateNanoId } from 'src/common/utils';
import { GiftPolicyService } from './gift-policy.service';
import { ConfigService } from '@nestjs/config';
import { extname } from 'path';
import { MetaHelper } from 'src/common/helpers/meta.helper';
import {
  GiftAssetType,
  GiftTier,
  HistoryAction,
  HistoryStatus,
  MediaStatus,
  Prisma,
} from 'src/generated/prisma/client';
import { GiftDisplaySettings, UpdateGift } from '../types/gift';
import { GIFT_HISTORY_TYPES } from '../constants/gift.constants';
import { LoggerService } from 'src/infrastructure/logger/logger.service';
import { HistoryService } from 'src/common/constants/history-service.constant';
import {
  DeleteEntityDataHistory,
  UpdateEntityDataHistory,
} from 'src/modules/history/types/history';

@Injectable()
export class GiftService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly minioService: MinioService,
    private readonly giftPolicyService: GiftPolicyService,
    private readonly logger: LoggerService,
  ) {}

  public async createGift(data: CreateGiftServiceDto, auth: AuthPayload) {
    await this.giftPolicyService.canManageGifts(auth.sub);

    const bucket = this.minioService.getGiftBucket();
    const imageID = generateNanoId(32);
    const effectID = data.effect ? generateNanoId(32) : null;
    const soundID = data.sound ? generateNanoId(32) : null;

    const imageExt = extname(data.image.originalname);
    const effectExt = data.effect ? extname(data.effect.originalname) : null;
    const soundExt = data.sound ? extname(data.sound.originalname) : null;
    const imageFileName = `${imageID}${imageExt}`;
    const effectFileName = effectExt ? `${effectID}${effectExt}` : null;
    const soundFileName = soundExt ? `${soundID}${soundExt}` : null;

    const uploadTasks = [
      this.minioService.uploadFile(
        bucket,
        `images/${imageFileName}`,
        data.image.buffer,
        data.image.size,
        { contentType: data.image.mimetype },
      ),
    ];
    if (effectID && data.effect)
      uploadTasks.push(
        this.minioService.uploadFile(
          bucket,
          `effects/${effectFileName}`,
          data.effect.buffer,
          data.effect.size,
          { contentType: data.effect.mimetype },
        ),
      );
    if (soundID && data.sound)
      uploadTasks.push(
        this.minioService.uploadFile(
          bucket,
          `sounds/${soundFileName}`,
          data.sound.buffer,
          data.sound.size,
          { contentType: data.sound.mimetype },
        ),
      );

    try {
      await Promise.all(uploadTasks);

      const { image, effect, sound, ...restData } = data;

      return await this.prismaService.gift.create({
        data: {
          ...restData,
          medias: {
            createMany: {
              data: [
                {
                  giftAssetType: GiftAssetType.IMAGE,
                  storageKey: imageFileName,
                  mimeType: data.image.mimetype,
                  size: data.image.size,
                  bucketName: bucket,
                  originalName: data.image.originalname,
                  uploaderId: auth.sub,
                  status: MediaStatus.ACTIVE,
                },
                ...(effectFileName && data.effect
                  ? [
                      {
                        giftAssetType: GiftAssetType.EFFECT,
                        storageKey: effectFileName,
                        mimeType: data.effect.mimetype,
                        size: data.effect.size,
                        bucketName: bucket,
                        originalName: data.effect.originalname,
                        uploaderId: auth.sub,
                        status: MediaStatus.ACTIVE,
                      },
                    ]
                  : []),
                ...(soundFileName && data.sound
                  ? [
                      {
                        giftAssetType: GiftAssetType.SOUND,
                        storageKey: soundFileName,
                        mimeType: data.sound.mimetype,
                        size: data.sound.size,
                        bucketName: bucket,
                        originalName: data.sound.originalname,
                        uploaderId: auth.sub,
                        status: MediaStatus.ACTIVE,
                      },
                    ]
                  : []),
              ],
            },
          },
        },
      });
    } catch (error) {
      const cleanupTasks = [
        this.minioService.deleteObject(bucket, `images/${imageFileName}`),
      ];
      if (effectID)
        cleanupTasks.push(
          this.minioService.deleteObject(bucket, `effects/${effectFileName}`),
        );
      if (soundID)
        cleanupTasks.push(
          this.minioService.deleteObject(bucket, `sounds/${soundFileName}`),
        );

      Promise.all(cleanupTasks).catch((e) =>
        console.error('Cleanup failed', e),
      );

      throw new InternalServerErrorException(
        'can not create gift please try again!',
      );
    }
  }

  public async getGifts(query: GetGiftsDto) {
    const {
      page = 1,
      limit = 10,
      search,
      tier,
      shakeLevel,
      status,
      sort = 'NEWEST',
    } = query;

    const SORT_MAPPING: Record<string, Prisma.GiftOrderByWithRelationInput> = {
      NEWEST: { createdAt: 'desc' },
      OLDEST: { createdAt: 'asc' },
      PRICE_HIGH: { price: 'desc' },
      PRICE_LOW: { price: 'asc' },
    };

    const where: Prisma.GiftWhereInput = {
      ...(status !== 'ALL' && { is_active: status === 'ACTIVE' }),
      ...(tier !== 'ALL' && { tier }),
      ...(shakeLevel !== 'ALL' && { shake_level: shakeLevel }),

      ...(search && {
        name: {
          contains: search,
          mode: 'insensitive',
        },
      }),
    };

    const [gifts, total] = await Promise.all([
      this.prismaService.gift.findMany({
        where,
        orderBy: SORT_MAPPING[sort] || SORT_MAPPING.NEWEST,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prismaService.gift.count({ where }),
    ]);

    return {
      data: gifts,
      meta: MetaHelper.page(page, limit, total),
    };
  }

  public async getGiftStats(auth: AuthPayload) {
    await this.giftPolicyService.canManageGifts(auth.sub);

    const [totalGifts, activeGifts, inactiveGifts, totalRevenue] =
      await Promise.all([
        this.prismaService.gift.count(),
        this.prismaService.gift.count({ where: { is_active: true } }),
        this.prismaService.gift.count({ where: { is_active: false } }),
        this.prismaService.giftTransaction.aggregate({
          _count: { _all: true },
          _sum: { price_at_buy: true },
        }),
      ]);

    return {
      totalGifts,
      activeGifts,
      inactiveGifts,
      totalRevenue: totalRevenue._sum.price_at_buy || 0,
      totalTransactions: totalRevenue._count._all,
    };
  }

  public async updateGiftActive(data: ActiveGiftDto, auth: AuthPayload) {
    await this.giftPolicyService.canManageGifts(auth.sub);

    try {
      return await this.prismaService.gift.update({
        where: {
          id: data.id,
          NOT: { is_active: data.is_active },
        },
        data: { is_active: data.is_active },
        select: {
          id: true,
          is_active: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        const gift = await this.prismaService.gift.findUnique({
          where: { id: data.id },
          select: {
            id: true,
            is_active: true,
            updatedAt: true,
          },
        });
        if (!gift) throw new NotFoundException('Gift not found');

        return gift;
      }
      throw error;
    }
  }

  public async updateGiftDisplaySettings(
    auth: AuthPayload,
    data: GiftDisplaySettings,
  ) {
    await this.giftPolicyService.canManageGifts(auth.sub);

    const gift = await this.prismaService.gift.findUnique({
      where: { id: data.giftID },
      select: { id: true, tier: true },
    });

    if (!gift) throw new NotFoundException('Gift not found');

    if (data.is_stream_mode === true && gift.tier === GiftTier.BASIC) {
      throw new BadRequestException(
        'Stream Mode (Popup) is only available for Rare gifts or higher.',
      );
    }

    return await this.prismaService.gift.update({
      where: { id: data.giftID },
      data: {
        is_chatMode: data.is_chat_mode,
        is_streamMode: data.is_stream_mode,
      },
      select: {
        id: true,
        name: true,
        is_chatMode: true,
        is_streamMode: true,
        updatedAt: true,
      },
    });
  }

  public async getDetailGift(giftID: string) {
    const gift = await this.prismaService.gift.findUnique({
      where: { id: giftID },
    });

    if (!gift) throw new NotFoundException('Gift not found');

    return gift;
  }

  public async updateGift(auth: AuthPayload, data: UpdateGift) {
    await this.giftPolicyService.canManageGifts(auth.sub);

    const gift = await this.prismaService.gift.findUnique({
      where: { id: data.giftID },
    });

    if (!gift) throw new NotFoundException('Gift not found');

    const currentTier = data.tier ?? gift.tier;
    const currentStreamMode = data.is_streamMode ?? gift.is_streamMode;

    if (currentStreamMode && currentTier === GiftTier.BASIC) {
      data.is_streamMode = false;
    }

    const bucket = this.minioService.getGiftBucket();
    const imageID = data.image ? generateNanoId(32) : null;
    const effectID = data.effect ? generateNanoId(32) : null;
    const soundID = data.sound ? generateNanoId(32) : null;

    const imageExt = data.image ? extname(data.image.originalname) : null;
    const effectExt = data.effect ? extname(data.effect.originalname) : null;
    const soundExt = data.sound ? extname(data.sound.originalname) : null;
    const imageFileName = data.image ? `${imageID}${imageExt}` : null;
    const effectFileName = data.effect ? `${effectID}${effectExt}` : null;
    const soundFileName = data.sound ? `${soundID}${soundExt}` : null;

    const uploadTasks: Promise<any>[] = [];
    if (imageID && data.image)
      uploadTasks.push(
        this.minioService.uploadFile(
          bucket,
          `images/${imageFileName}`,
          data.image.buffer,
          data.image.size,
          { contentType: data.image.mimetype },
        ),
      );
    if (effectID && data.effect)
      uploadTasks.push(
        this.minioService.uploadFile(
          bucket,
          `effects/${effectFileName}`,
          data.effect.buffer,
          data.effect.size,
          { contentType: data.effect.mimetype },
        ),
      );
    if (soundID && data.sound)
      uploadTasks.push(
        this.minioService.uploadFile(
          bucket,
          `sounds/${soundFileName}`,
          data.sound.buffer,
          data.sound.size,
          { contentType: data.sound.mimetype },
        ),
      );

    try {
      await Promise.all(uploadTasks);

      const { image, effect, sound, giftID, ...restData } = data;

      const filteredData = Object.fromEntries(
        Object.entries(restData).filter(([_, value]) => value !== undefined),
      );

      const filteredOldData = {};

      Object.keys(filteredData).forEach((key) => {
        filteredOldData[key] = gift[key];
      });

      if (imageFileName && data.image) {
        await this.prismaService.media.create({
          data: {
            storageKey: imageFileName,
            bucketName: bucket,
            originalName: data.image.originalname,
            mimeType: data.image.mimetype,
            size: data.image.size,
            status: MediaStatus.ACTIVE,
            uploaderId: auth.sub,
            giftId: giftID,
            giftAssetType: GiftAssetType.IMAGE,
          },
        });
      }
      if (effectFileName && data.effect) {
        await this.prismaService.media.create({
          data: {
            storageKey: effectFileName,
            bucketName: bucket,
            originalName: data.effect.originalname,
            mimeType: data.effect.mimetype,
            size: data.effect.size,
            status: MediaStatus.ACTIVE,
            uploaderId: auth.sub,
            giftId: giftID,
            giftAssetType: GiftAssetType.EFFECT,
          },
        });
      }
      if (soundFileName && data.sound) {
        this.prismaService.media.create({
          data: {
            storageKey: soundFileName,
            bucketName: bucket,
            originalName: data.sound.originalname,
            mimeType: data.sound.mimetype,
            size: data.sound.size,
            status: MediaStatus.ACTIVE,
            uploaderId: auth.sub,
            giftId: giftID,
            giftAssetType: GiftAssetType.SOUND,
          },
        });
      }

      const giftUpdated = await this.prismaService.gift.update({
        where: { id: giftID },
        data: {
          ...filteredData,
        },
        include: {
          medias: {
            where: {
              status: MediaStatus.ACTIVE,
            },
            select: {
              storageKey: true,
              giftAssetType: true,
              mimeType: true,
            },
          },
        },
      });

      return giftUpdated;
    } catch (error) {
      const cleanupTasks: Promise<void>[] = [];
      if (imageID)
        cleanupTasks.push(
          this.minioService.deleteObject(bucket, `images/${imageFileName}`),
        );
      if (effectID)
        cleanupTasks.push(
          this.minioService.deleteObject(bucket, `effects/${effectFileName}`),
        );
      if (soundID)
        cleanupTasks.push(
          this.minioService.deleteObject(bucket, `sounds/${soundFileName}`),
        );

      Promise.all(cleanupTasks).catch((e) => {
        this.logger.error({
          message: `Cleanup failed for gift ${data.giftID}`,
          error: e,
          service: 'GiftService',
          context: 'updateGift',
          timestamp: new Date().toISOString(),
        });
      });

      throw new InternalServerErrorException(
        'can not update gift please try again!',
      );
    }
  }

  public async deleteGift(auth: AuthPayload, giftID: string) {
    await this.giftPolicyService.canManageGifts(auth.sub);

    const gift = await this.prismaService.gift.findUnique({
      where: {
        id: giftID,
      },
    });

    if (!gift) throw new NotFoundException('Gift not found');

    const deleteSnapshot: DeleteEntityDataHistory = {
      full_data_snapshot: gift,
      deleted_at: new Date().toISOString(),
      deleted_by: auth.sub,
    };

    return await this.prismaService.$transaction([
      this.prismaService.history.updateMany({
        where: {
          entity_id: giftID,
        },
        data: {
          is_entity_deleted: true,
        },
      }),
      this.prismaService.gift.delete({
        where: {
          id: giftID,
        },
      }),
      this.prismaService.history.create({
        data: {
          action: HistoryAction.DELETE,
          service: HistoryService.GIFT,
          entity_id: gift.id,
          entity_name: gift.name,
          type: GIFT_HISTORY_TYPES.DELETE,
          data: JSON.stringify(deleteSnapshot),
          is_entity_deleted: true,
        },
      }),
    ]);
  }
}
