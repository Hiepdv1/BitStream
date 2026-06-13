import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthPayload } from 'src/modules/auth/types/auth';
import { GetHistoriesDto } from '../dtos/history.dto';
import {
  HistoryAction,
  HistoryStatus,
  Prisma,
} from 'src/generated/prisma/client';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { MetaHelper } from 'src/common/helpers/meta.helper';
import { HistoryService as HistoryServiceType } from 'src/common/constants/history-service.constant';
import {
  DeleteEntityDataHistory,
  RestoreEntityDataHistory,
  RollbackEntityDataHistory,
  UpdateEntityDataHistory,
} from '../types/history';

@Injectable()
export class HistoryService {
  constructor(private readonly prismaService: PrismaService) {}

  public async getHistories(auth: AuthPayload, queries: GetHistoriesDto) {
    const { page, limit, search, service, action, status, sort } = queries;

    const SORT_MAPPING: Record<string, Prisma.HistoryOrderByWithRelationInput> =
      {
        NEWEST: { created_at: 'desc' },
        OLDEST: { created_at: 'asc' },
      };

    const where: Prisma.HistoryWhereInput = {
      ...(service !== 'ALL' && { service }),
      ...(action !== 'ALL' && { action: action as HistoryAction }),
      ...(status !== 'ALL' && { status: status as HistoryStatus }),
      ...(search && {
        OR: [
          { entity_name: { contains: search, mode: 'insensitive' } },
          { entity_id: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prismaService.history.findMany({
        where,
        orderBy: SORT_MAPPING[sort] || SORT_MAPPING.NEWEST,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prismaService.history.count({ where }),
    ]);

    return {
      data,
      meta: MetaHelper.page(page, limit, total),
    };
  }

  public async getHistoryStats() {
    const stats = await this.prismaService.history.groupBy({
      by: ['status', 'is_entity_deleted'],
      _count: { _all: true },
    });

    const result = {
      totalHistories: 0,
      totalPending: 0,
      totalFailed: 0,
      totalDeleted: 0,
    };

    stats.forEach((stat) => {
      result.totalHistories += stat._count._all;

      if (stat.status === HistoryStatus.PENDING) {
        result.totalPending += stat._count._all;
      }
      if (stat.status === HistoryStatus.FAILED) {
        result.totalFailed += stat._count._all;
      }
      if (stat.is_entity_deleted) {
        result.totalDeleted += stat._count._all;
      }
    });

    return result;
  }

  public async restoreHistory(
    auth: AuthPayload,
    historyId: string,
    reason: string,
  ) {
    return await this.prismaService.$transaction(async (tx) => {
      const deleteHistory = await tx.history.findUnique({
        where: { id: historyId },
      });

      if (!deleteHistory || deleteHistory.action !== HistoryAction.DELETE) {
        throw new BadRequestException('Invalid restore point');
      }

      const snapshot = (
        JSON.parse(deleteHistory.data as string) as DeleteEntityDataHistory
      ).full_data_snapshot;

      if (!snapshot)
        throw new BadRequestException('No data snapshot to restore');

      await this.restoreEntityData(tx, deleteHistory.service, snapshot);

      await tx.history.updateMany({
        where: {
          OR: [
            {
              id: historyId,
            },
            {
              entity_id: deleteHistory.entity_id,
              is_entity_deleted: true,
            },
          ],
        },
        data: { is_entity_deleted: false },
      });

      const restoreSnapshot: RestoreEntityDataHistory = {
        restored_from_history_id: historyId,
        restored_by: auth.sub,
        reason,
        timestamp: new Date().toString(),
      };

      const restoreLog = await tx.history.create({
        data: {
          service: deleteHistory.service,
          entity_id: deleteHistory.entity_id,
          entity_name: deleteHistory.entity_name,
          type: `${deleteHistory.service}_RESTORE`,
          action: HistoryAction.RESTORE,
          status: HistoryStatus.SUCCESS,
          is_entity_deleted: false,
          data: JSON.stringify(restoreSnapshot),
        },
      });

      return restoreLog;
    });
  }

  public async rollbackHistory(
    auth: AuthPayload,
    historyID: string,
    reason: string,
  ) {
    const historyLog = await this.prismaService.history.findUnique({
      where: {
        id: historyID,
      },
    });

    if (!historyLog) throw new NotFoundException('History not found');
    if (historyLog.action !== HistoryAction.UPDATE)
      throw new BadRequestException('Invalid history action');
    if (historyLog.is_entity_deleted)
      throw new BadRequestException('Entity is deleted');

    const snapshot = (
      JSON.parse(historyLog.data as string) as UpdateEntityDataHistory
    ).full_data_snapshot;

    if (!snapshot) throw new BadRequestException('No data snapshot to restore');

    return await this.prismaService.$transaction(async (tx) => {
      const [currentEntityData] = await Promise.all([
        this.getCurrentEntityData(tx, historyLog.service, historyLog.entity_id),
        this.rollbackEntityData(
          tx,
          historyLog.service,
          snapshot,
          historyLog.entity_id,
        ),
      ]);

      if (!currentEntityData) throw new NotFoundException('Entity not found');

      const rollbackLogSnapshot: RollbackEntityDataHistory = {
        full_data_snapshot: currentEntityData,
        rolledback_at: new Date().toString(),
        rolledback_by: auth.sub,
        original_history_id: historyID,
        reason,
      };

      return await tx.history.create({
        data: {
          action: HistoryAction.ROLLBACK,
          service: historyLog.service,
          entity_id: historyLog.entity_id,
          entity_name: historyLog.entity_name,
          type: `${historyLog.service}_ROLLBACK`,
          status: HistoryStatus.SUCCESS,
          data: JSON.stringify(rollbackLogSnapshot),
          is_entity_deleted: false,
        },
      });
    });
  }

  private readonly getCurrentEntityData = async (
    tx: any,
    service: string,
    entityId: string,
  ) => {
    const client = tx as PrismaService;

    switch (service) {
      case HistoryServiceType.GIFT:
        return await client.gift.findUnique({
          where: { id: entityId },
          omit: {
            id: true,
          },
        });

      case HistoryServiceType.USER:
        return await client.user.findUnique({
          where: { id: entityId },
          omit: {
            id: true,
          },
        });

      case HistoryServiceType.STREAM:
        return await client.stream.findUnique({
          where: { id: entityId },
          omit: {
            id: true,
          },
        });

      default:
        throw new BadRequestException(
          `Current entity data logic for service ${service} is not implemented`,
        );
    }
  };

  private async rollbackEntityData(
    tx: any,
    service: string,
    snapshot: any,
    entityId: string,
  ) {
    const client = tx as PrismaService;

    switch (service) {
      case HistoryServiceType.GIFT:
        const existingGift = await client.gift.findUnique({
          where: { id: entityId },
          select: { id: true },
        });

        if (!existingGift) {
          throw new NotFoundException('Gift not found to rollback');
        }
        return await client.gift.update({
          where: { id: entityId },
          data: snapshot,
        });

      case HistoryServiceType.USER:
        return await client.user.update({
          where: { id: entityId },
          data: snapshot,
        });

      case HistoryServiceType.STREAM:
        return await client.stream.update({
          where: { id: entityId },
          data: snapshot,
        });

      default:
        throw new BadRequestException(
          `Rollback logic for service ${service} is not implemented`,
        );
    }
  }

  private async restoreEntityData(tx: any, service: string, snapshot: any) {
    const client = tx as PrismaService;

    switch (service) {
      case HistoryServiceType.GIFT:
        const existingGift = await client.gift.findUnique({
          where: { id: snapshot.id },
          select: { id: true },
        });

        if (existingGift) {
          throw new ConflictException('The gift already exists in the system.');
        }
        return await client.gift.create({ data: snapshot });

      case HistoryServiceType.USER:
        return await client.user.create({ data: snapshot });

      case HistoryServiceType.STREAM:
        return await client.stream.create({ data: snapshot });

      default:
        throw new BadRequestException(
          `Restore logic for service ${service} is not implemented`,
        );
    }
  }
}
