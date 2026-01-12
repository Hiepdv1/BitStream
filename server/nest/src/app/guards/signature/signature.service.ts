import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { createHmac, createHash, timingSafeEqual } from 'crypto';
import { RedisService } from 'src/infrastructure/redis/redis.service';
import { SignaturePayload, KeyEntry } from './signature.types';
import { DEFAULT_ALLOWED_SKEW_SEC } from './signature.constants';
import { ConfigService } from '@nestjs/config';
import { REDIS_PREFIX } from 'src/infrastructure/redis/redis.constant';
import { RedisKeyManager } from 'src/infrastructure/redis/redis-key.manager';

@Injectable()
export class SignatureService {
  private readonly allowedSkewSec = DEFAULT_ALLOWED_SKEW_SEC;
  private readonly keyStore: Map<string, KeyEntry>;
  private readonly currId: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly redis: RedisService,
  ) {
    this.keyStore = new Map();
    this.NewEnvKeyStore();

    this.currId =
      this.configService.get<string>('SIGNATURE_CURRENT_KEY_ID') ||
      [...this.keyStore.keys()][0];
  }

  private NewEnvKeyStore() {
    const keysStr = this.configService.get<string>('SIGNATURE_KEYS') || '';
    if (keysStr === '') {
      throw new InternalServerErrorException('SIGNATURE_KEYS env empty');
    }

    const pairs = keysStr.split(',');
    pairs.forEach((p) => {
      const pTrim = p.trim();
      if (pTrim !== '') {
        const pairs = pTrim.split(':');
        if (pairs.length !== 2) {
          throw new InternalServerErrorException(`invalid key pair: ${pTrim}`);
        }
        const id = pairs[0].trim();
        const b64 = pairs[1].trim();
        const raw = Buffer.from(b64, 'base64');

        this.keyStore.set(id, { secret: raw });
      }
    });
  }

  async verify(
    payload: SignaturePayload,
    method: string,
    uri: string,
    body: Buffer,
  ): Promise<void> {
    this.verifyTimestamp(payload.timestamp);
    await this.verifyReplay(payload.signature);
    const expected = this.sign(payload, method, uri, body);
    this.secureCompare(expected, payload.signature);
    await this.storeSignature(payload.signature);
  }

  private verifyTimestamp(ts: number) {
    const now = Math.floor(Date.now() / 1000);
    if (ts < now - this.allowedSkewSec || ts > now + this.allowedSkewSec) {
      throw new UnauthorizedException('timestamp out of range');
    }
  }

  private async verifyReplay(signature: string) {
    const sigHash = this.hashSignature(signature);
    const key = RedisKeyManager.getSignatureKey(sigHash);
    const exists = await this.redis.exists(key);
    if (exists) {
      throw new UnauthorizedException('signature already used');
    }
  }

  private sign(
    payload: SignaturePayload,
    method: string,
    uri: string,
    body: Buffer,
  ): string {
    const entry = this.keyStore.get(payload.keyId);
    if (!entry) {
      throw new UnauthorizedException('unknown key id');
    }

    const bodyHash = createHash('sha256').update(body).digest('hex');
    const canonical = [
      method,
      uri,
      payload.timestamp.toString(),
      payload.nonce,
      bodyHash,
    ].join('\n');

    return createHmac('sha256', entry.secret)
      .update(canonical)
      .digest('base64');
  }

  private secureCompare(expected: string, actual: string) {
    const a = Buffer.from(expected);
    const b = Buffer.from(actual);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new UnauthorizedException('invalid signature');
    }
  }

  private async storeSignature(signature: string) {
    try {
      const sigHash = this.hashSignature(signature);
      const key = RedisKeyManager.getSignatureKey(sigHash);
      await this.redis.set<string>(key, '1', {
        ttlSeconds: this.allowedSkewSec,
      });
    } catch {
      throw new InternalServerErrorException('failed storing signature');
    }
  }

  private hashSignature(sig: string): string {
    return createHash('sha256').update(sig).digest('hex');
  }
}
