import { REDIS_PREFIX } from './redis.constant';
import { RedisKey } from './redis.types';

export class RedisKeyManager {
  static getAuthSessionKey(
    userId: string,
    sid: string,
    type: 'access' | 'refresh',
  ) {
    return this.buildKey(REDIS_PREFIX.AUTH_SESSION, userId, sid, type);
  }

  static getBlacklistKey(jti: string) {
    return this.buildKey(REDIS_PREFIX.BLACKLIST, jti);
  }

  static getSignatureKey(signature: string) {
    return this.buildKey(REDIS_PREFIX.SIGNATURE, signature);
  }

  static getStreamSessionKey(streamId: string) {
    return this.buildKey(REDIS_PREFIX.STREAM_SESSION, streamId);
  }

  static getActiveStreamsKey() {
    return this.buildKey(REDIS_PREFIX.STREAM_SESSION, 'ACTIVE_LIST');
  }

  static getResendVerificationEmailKey(id: string) {
    return this.buildKey(REDIS_PREFIX.RESEND_VERIFICATION_EMAIL, id);
  }

  static getStreamUniqueViewsKey(streamID: string) {
    return this.buildKey(REDIS_PREFIX.STREAM_SESSION, streamID, 'UNIQUE_VIEWS');
  }

  static getStreamCCUKey(streamID: string) {
    return this.buildKey(REDIS_PREFIX.STREAM_SESSION, streamID, 'CCU');
  }

  static getChatHistoryKey(streamID: string) {
    return this.buildKey(REDIS_PREFIX.CHAT_HISTORY, streamID);
  }

  static getChatPinMessageKey(streamID: string) {
    return this.buildKey(REDIS_PREFIX.CHAT_PIN_MESSAGE, streamID);
  }

  private static buildKey(
    prefix: REDIS_PREFIX,
    ...parts: (string | number)[]
  ): RedisKey {
    const rawKey = [prefix, ...parts].join(':');

    return rawKey as RedisKey;
  }
}
