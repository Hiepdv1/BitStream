import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Role } from 'src/common/enums/role.enum';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';

@Injectable()
export class GiftPolicyService {
  constructor(private readonly prismaService: PrismaService) {}

  public async canManageGifts(userID: string): Promise<void> {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userID,
      },
      select: {
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('user not found');
    }

    if ((user.role & Role.Admin) === 0) {
      throw new ForbiddenException("you don't have permission to this action");
    }
  }
}
