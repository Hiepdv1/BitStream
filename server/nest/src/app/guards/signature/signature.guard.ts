/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { SignatureService } from './signature.service';
import { SIGNATURE_HEADERS } from './signature.constants';
import { Reflector } from '@nestjs/core';
import { SKIP_SIGNATURE_KEY } from 'src/common/decorators';

@Injectable()
export class SignatureGuard implements CanActivate {
  constructor(
    private readonly signatureService: SignatureService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const skip = this.reflector.getAllAndOverride<Boolean>(SKIP_SIGNATURE_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    if (skip) {
      return true;
    }

    const req = ctx.switchToHttp().getRequest<Request>();

    const keyId = req.headers[SIGNATURE_HEADERS.KEY_ID] as string;
    const ts = req.headers[SIGNATURE_HEADERS.TIMESTAMP] as string;
    const nonce = req.headers[SIGNATURE_HEADERS.NONCE] as string;
    const sig = req.headers[SIGNATURE_HEADERS.SIGNATURE] as string;

    if (!keyId || !ts || !nonce || !sig) {
      throw new UnauthorizedException('missing signature headers');
    }

    const timestamp = Number(ts);
    if (Number.isNaN(timestamp)) {
      throw new UnauthorizedException('invalid timestamp');
    }

    const body = req.body || {};
    const bodyRaw = typeof body === 'string' ? body : JSON.stringify(body);

    await this.signatureService.verify(
      { keyId, timestamp, nonce, signature: sig },
      req.method,
      req.originalUrl,
      Buffer.from(bodyRaw),
    );

    return true;
  }
}
