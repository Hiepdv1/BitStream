import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenProviderFactory } from '../../security/token-providers/token-provider.factory';
import type { Request } from 'express';

@Injectable()
export class ProviderTokenGuard implements CanActivate {
  constructor(private readonly factory: TokenProviderFactory) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    const provider = req.headers['x-provider'] as string;
    const authHeader = req.headers['authorization'] as string;
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : authHeader;

    if (!provider) {
      throw new UnauthorizedException('Missing provider');
    }

    if (!token) {
      throw new UnauthorizedException('Missing token');
    }

    const verifier = this.factory.get(provider);
    const data = await verifier.verify(token);

    req.auth = data;

    return true;
  }
}
