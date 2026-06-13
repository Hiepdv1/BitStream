import { Injectable, NotFoundException } from '@nestjs/common';
import { MediaStatus, Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { UpdateProfileDto } from '../dtos/user.dto';
import { AuthPayload } from 'src/modules/auth/types/auth';
import { MinioService } from 'src/infrastructure/minio/minio.service';
import { generateNanoId } from 'src/common/utils';
import { extname } from 'path';
import { LoggerService } from 'src/infrastructure/logger/logger.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly minioService: MinioService,
    private readonly logger: LoggerService,
  ) {}

  public async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        profileImages: {
          where: {
            status: MediaStatus.ACTIVE,
          },
          select: {
            storageKey: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  public async getExtensions(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        accounts: {
          omit: {
            password: true,
          },
        },
      },
    });

    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  public async updateProfile(id: string, data: UpdateProfileDto) {
    try {
      return await this.prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          name: true,
          bio: true,
          email: true,
          role: true,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      throw error;
    }
  }

  public async updateAvatar(auth: AuthPayload, thumbnail: Express.Multer.File) {
    const bucket = this.minioService.getAvatarBucket();
    const imageID = generateNanoId(32);
    const imageExt = extname(thumbnail.originalname);
    const imageFileName = `${imageID}${imageExt}`;

    try {
      await this.minioService.uploadFile(
        bucket,
        imageFileName,
        thumbnail.buffer,
        thumbnail.size,
        { contentType: thumbnail.mimetype },
      );

      const newAvatar = await this.prisma.$transaction(async (tx) => {
        await tx.media.updateMany({
          where: {
            ownerUserId: auth.sub,
            status: MediaStatus.ACTIVE,
            bucketName: bucket,
          },
          data: {
            status: MediaStatus.SOFT_DELETED,
            deletedAt: new Date(),
          },
        });

        return await tx.media.create({
          data: {
            bucketName: bucket,
            originalName: thumbnail.originalname,
            storageKey: imageFileName,
            size: thumbnail.size,
            status: MediaStatus.ACTIVE,
            uploaderId: auth.sub,
            mimeType: thumbnail.mimetype,
            ownerUserId: auth.sub,
          },
        });
      });

      return newAvatar;
    } catch (error) {
      await this.minioService.deleteObject(bucket, imageFileName);

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new NotFoundException(`User with ID ${auth.sub} not found`);
      }

      throw error;
    }
  }
}
