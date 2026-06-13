import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { RedisService } from 'src/infrastructure/redis/redis.service';
import { RedisKeyManager } from 'src/infrastructure/redis/redis-key.manager';
import { CacheLiveMessage, StreamSession } from '../types/chat';

@Injectable()
export class ChatInternalService {
  private readonly MAX_LIVE_HISTORY = 30;

  constructor(
    private readonly redisService: RedisService,
    private readonly prismaService: PrismaService,
  ) {}

  public async getStreamSession(streamID: string): Promise<StreamSession> {
    const key = RedisKeyManager.getStreamSessionKey(streamID);

    return await this.redisService.getOrSet<StreamSession>(
      key,
      async () => {
        const stream = await this.prismaService.stream.findUnique({
          where: { id: streamID },
          select: {
            isLive: true,
            startedAt: true,
            endedAt: true,
            userId: true,
          },
        });

        if (!stream || !stream.isLive || !stream.startedAt || stream.endedAt) {
          return { startedAt: 0, status: 'ended' };
        }

        return {
          startedAt: stream.startedAt.getTime(),
          ownerId: stream.userId,
          status: 'live',
        };
      },
      { ttlSeconds: 3600 },
    );
  }

  async cacheLiveMessage(streamID: string, messageData: CacheLiveMessage) {
    const key = RedisKeyManager.getChatHistoryKey(streamID);

    await this.redisService.client
      .pipeline()
      .zadd(key, Date.now(), JSON.stringify(messageData))
      .zremrangebyrank(key, 0, -(this.MAX_LIVE_HISTORY + 1))
      // .expire(key, 1800)
      .exec();
  }

  async getLiveHistory(streamID: string): Promise<CacheLiveMessage[]> {
    const key = RedisKeyManager.getChatHistoryKey(streamID);
    const data = await this.redisService.client.zrange(key, 0, -1);
    return data.map((item) => JSON.parse(item));
  }

  async removeMessageFromCache(streamID: string, messageID: string) {
    const historyKey = RedisKeyManager.getChatHistoryKey(streamID);
    const pinKey = RedisKeyManager.getChatPinMessageKey(streamID);

    const [historyRaw, pinRaw] = await Promise.all([
      this.redisService.client.zrange(historyKey, 0, -1),
      this.redisService.client.get(pinKey),
    ]);

    const pipeline = this.redisService.client.pipeline();

    const toDelete = historyRaw.find(
      (item) => JSON.parse(item).id === messageID,
    );
    if (toDelete) {
      pipeline.zrem(historyKey, toDelete);
    }

    if (pinRaw) {
      const pinned = JSON.parse(pinRaw);
      if (pinned.id === messageID) {
        pipeline.del(pinKey);
      }
    }

    await pipeline.exec();
  }

  async cachePinnedMessage(streamID: string, messageData: CacheLiveMessage) {
    const key = RedisKeyManager.getChatPinMessageKey(streamID);

    await this.redisService.set(key, JSON.stringify(messageData));
  }

  async removePinnedMessage(streamID: string) {
    const key = RedisKeyManager.getChatPinMessageKey(streamID);
    await this.redisService.client.del(key);
  }

  async getPinnedMessage(streamID: string): Promise<CacheLiveMessage | null> {
    const key = RedisKeyManager.getChatPinMessageKey(streamID);
    const data = await this.redisService.get<string>(key);
    return data ? JSON.parse(data) : null;
  }

  async cleanupStreamCache(streamID: string) {
    const historyKey = RedisKeyManager.getChatHistoryKey(streamID);
    const pinKey = RedisKeyManager.getChatPinMessageKey(streamID);
    const ccuKey = RedisKeyManager.getStreamCCUKey(streamID);
    const uniqueKey = RedisKeyManager.getStreamUniqueViewsKey(streamID);
    const sessionKey = RedisKeyManager.getStreamSessionKey(streamID);
    const activeStreamsKey = RedisKeyManager.getActiveStreamsKey();

    await this.redisService.client
      .pipeline()
      .del(historyKey, pinKey, ccuKey, uniqueKey, sessionKey)
      .srem(activeStreamsKey, streamID)
      .exec();
  }

  async recordView(streamID: string, userID: string): Promise<void> {
    const uniqueKey = RedisKeyManager.getStreamUniqueViewsKey(streamID);
    const ccuKey = RedisKeyManager.getStreamCCUKey(streamID);
    const now = Date.now();

    await this.redisService.client
      .pipeline()
      .sadd(uniqueKey, userID)
      .zadd(ccuKey, now, userID)
      .exec();
  }

  async getLiveMetrics(streamID: string, timeoutSeconds = 30) {
    const uniqueKey = RedisKeyManager.getStreamUniqueViewsKey(streamID);
    const ccuKey = RedisKeyManager.getStreamCCUKey(streamID);

    const now = Date.now();
    const threshold = now - timeoutSeconds * 1000;

    const results = await this.redisService.client
      .pipeline()
      .scard(uniqueKey)
      .zremrangebyscore(ccuKey, 0, threshold)
      .zcard(ccuKey)
      .exec();

    return {
      totalViews: results?.[0]?.[1] as number,
      currentViewers: results?.[2]?.[1] as number,
    };
  }

  async removeViewer(streamID: string, userID: string): Promise<void> {
    const ccuKey = RedisKeyManager.getStreamCCUKey(streamID);

    await this.redisService.client.zrem(ccuKey, userID);
  }

  async addActiveStream(streamID: string) {
    const key = RedisKeyManager.getActiveStreamsKey();
    await this.redisService.client.sadd(key, streamID);
  }

  async removeActiveStream(streamID: string) {
    const key = RedisKeyManager.getActiveStreamsKey();
    await this.redisService.client.srem(key, streamID);
  }

  async getActiveStreams() {
    const key = RedisKeyManager.getActiveStreamsKey();
    return await this.redisService.client.smembers(key);
  }
}
