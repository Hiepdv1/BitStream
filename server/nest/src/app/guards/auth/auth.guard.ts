import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/security/jwt/guards/jwt.guard';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, SKIP_AUTH_KEY } from 'src/common/decorators';
import { AuthPayload } from 'src/modules/auth/types/auth';

@Injectable()
export class GlobalAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtGuard: JwtAuthGuard,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const skipAuth = this.reflector.getAllAndOverride<boolean>(SKIP_AUTH_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    if (skipAuth) return true;

    const canAccess = await this.jwtGuard.canActivate(ctx);
    if (!canAccess) return false;

    const requiredRolesMask = this.reflector.getAllAndOverride<
      number[] | number
    >(ROLES_KEY, [ctx.getHandler(), ctx.getClass()]);

    if (!requiredRolesMask) return true;

    const requiredMask = Array.isArray(requiredRolesMask)
      ? requiredRolesMask.reduce((acc, role) => acc | role, 0)
      : requiredRolesMask;

    const req = ctx.switchToHttp().getRequest();
    const user = req.payload as AuthPayload;

    const hasPermission = (user.role & requiredMask) !== 0;

    if (!user || !hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    return true;
  }
}
