export interface RedisSetOptions {
  ttlSeconds?: number;
}

export type RedisKey = string & { readonly __brand: 'RedisKey' };
