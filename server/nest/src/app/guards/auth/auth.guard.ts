import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { ProviderType } from 'src/generated/prisma/enums';
import { TokenProviderFactory } from 'src/modules/security/token-providers/token-provider.factory';
import { JwtAuthGuard } from 'src/modules/security/jwt/guards/jwt.guard';
import { Reflector } from '@nestjs/core';

@Injectable()
export class GlobalAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly factory: TokenProviderFactory,
    private readonly jwtGuard: JwtAuthGuard,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const skipAuth = this.reflector.getAllAndOverride<boolean>('skip-auth', [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    if (skipAuth) return true;

    const req = ctx.switchToHttp().getRequest<Request>();

    const provider =
      (req.headers['x-provider'] as string) || req.cookies?.auth_provider;

    const token =
      req.headers.authorization?.replace('Bearer ', '') ||
      req.cookies?.access_token;

    if (!provider || !token) {
      throw new UnauthorizedException();
    }

    if (provider === ProviderType.CREDENTIALS) {
      return (await this.jwtGuard.canActivate(ctx)) as boolean;
    }

    const authProvider = this.factory.get(provider as ProviderType);
    const payload = await authProvider.verify(token);

    req.auth = payload;

    return true;
  }
}
