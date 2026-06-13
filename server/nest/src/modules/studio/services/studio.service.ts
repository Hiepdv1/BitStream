import { Injectable } from '@nestjs/common';
import { Role } from 'src/common/enums/role.enum';
import { Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { AuthPayload } from 'src/modules/auth/types/auth';

@Injectable()
export class StudioService {
  constructor(private readonly prismaService: PrismaService) {}

  public async getStudioInfo(userID: string) {
    const userInfo = await this.prismaService.user.findUnique({
      where: {
        id: userID,
      },
    });

    if (!userInfo) throw new Error('User not found');

    const [live, clips] = await Promise.all([
      this.prismaService.stream.findFirst({
        where: {
          userId: userInfo.id,
          isLive: true,
        },
      }),
      this.prismaService.stream.findMany({
        where: {
          userId: userInfo.id,
          isLive: false,
          NOT: {
            endedAt: null,
          },
        },
        orderBy: {
          endedAt: 'desc',
        },
        take: 12,
      }),
    ]);

    return {
      user: userInfo,
      live,
      clips,
    };
  }

  public async createStudio(auth: AuthPayload) {
    try {
      return await this.prismaService.user.update({
        where: {
          id: auth.sub,
          role: Role.Viewer,
        },
        data: {
          role: Role.Streamer,
        },
        select: {
          id: true,
          role: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('User not found');
        }
      }

      throw error;
    }
  }
}
