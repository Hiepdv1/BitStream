import { SetMetadata } from '@nestjs/common';

export const SKIP_AUTH_KEY = 'skip-auth';
export const ROLES_KEY = 'roles';

export const SkipAuth = () => SetMetadata(SKIP_AUTH_KEY, true);
export const Roles = (...roles: number[]) => SetMetadata(ROLES_KEY, roles);
