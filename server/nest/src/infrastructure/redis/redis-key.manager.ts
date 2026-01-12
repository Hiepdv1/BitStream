import { REDIS_PREFIX } from './redis.constant';
import { RedisKey } from './redis.types';

export class RedisKeyManager {
  static getAuthSessionKey(
    userId: string,
    sid: string,
    type: 'access' | 'refresh' | 'stream',
  ) {
    return this.buildKey(REDIS_PREFIX.AUTH_SESSION, userId, sid, type);
  }

  static getBlacklistKey(jti: string) {
    return this.buildKey(REDIS_PREFIX.BLACKLIST, jti);
  }

  static getSignatureKey(signature: string) {
    return this.buildKey(REDIS_PREFIX.SIGNATURE, signature);
  }

  private static buildKey(
    prefix: REDIS_PREFIX,
    ...parts: (string | number)[]
  ): RedisKey {
    const rawKey = [prefix, ...parts].join(':');

    return rawKey as RedisKey;
  }
}
