import { Inject, Injectable } from '@nestjs/common';
import { RedisKey, RedisSetOptions } from './redis.types';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from './redis.constant';

@Injectable()
export class RedisService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
    @Inject(REDIS_CLIENT) public readonly client: Redis,
  ) {}

  async setNX(
    key: string,
    value: string,
    ttlSeconds: number,
  ): Promise<boolean> {
    const result = await this.client.set(key, value, 'EX', ttlSeconds, 'NX');

    return result === 'OK';
  }

  async get<T>(key: RedisKey): Promise<T | null> {
    const value = await this.cache.get<T>(key);
    return value ?? null;
  }

  async set<T>(
    key: RedisKey,
    value: T,
    options?: RedisSetOptions,
  ): Promise<void> {
    const ttl = options?.ttlSeconds ? options.ttlSeconds * 1000 : undefined;

    if (ttl && ttl > 0) {
      await this.cache.set(key, value, ttl);
    } else {
      await this.cache.set(key, value);
    }
  }

  async getOrSet<T>(
    key: RedisKey,
    factory: () => Promise<T>,
    options?: RedisSetOptions,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const value = await factory();
    await this.set(key, value, options);
    return value;
  }

  async exists(key: RedisKey): Promise<boolean> {
    const value = await this.cache.get(key);
    return value !== undefined && value !== null;
  }

  async del(key: RedisKey): Promise<void> {
    await this.cache.del(key);
  }
}
