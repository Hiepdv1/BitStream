import { AuthGuard } from '@nestjs/passport';
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthPayload } from 'src/modules/auth/types/auth';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt-auth') {
  handleRequest(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ) {
    if (err || !user) {
      throw err || new UnauthorizedException('Session invalid');
    }

    const req = context.switchToHttp().getRequest<Request>();

    req.payload = user as AuthPayload;

    return null as any;
  }
}
