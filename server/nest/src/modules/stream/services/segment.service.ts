import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { MinioService } from 'src/infrastructure/minio/minio.service';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { Readable } from 'stream';

@Injectable()
export class SegmentService {
  constructor(
    private readonly minio: MinioService,
    private readonly prisma: PrismaService,
  ) {}

  async getSegment(
    streamId: string,
    filename: string,
  ): Promise<{
    file: StreamableFile;
    contentType: string;
    cacheControl: string;
  }> {
    const stream = await this.prisma.stream.findUnique({
      where: { id: streamId },
      select: { id: true, isLive: true },
    });

    if (!stream) {
      throw new NotFoundException('Stream not found');
    }

    const objectPath = `streams/${streamId}/${filename}`;
    const bucket = this.minio.getDefaultBucket();

    try {
      const fileStream = await this.minio.getObject(bucket, objectPath);

      const buffer = await this.streamToBuffer(fileStream);

      const streamableFile = new StreamableFile(buffer);

      const contentType = this.getContentType(filename);
      const cacheControl = this.getCacheControl(filename, stream.isLive);

      return {
        file: streamableFile,
        contentType,
        cacheControl,
      };
    } catch (error) {
      console.error(`Failed to fetch segment from MinIO:`, {
        streamId,
        filename,
        objectPath,
        bucket,
        error: error.message,
      });

      throw new NotFoundException(`Segment not found: ${filename}`);
    }
  }

  private async streamToBuffer(stream: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }

  private getContentType(filename: string): string {
    if (filename.endsWith('.mpd')) {
      return 'application/dash+xml';
    }
    if (filename.endsWith('.m4s')) {
      return 'video/iso.segment';
    }
    if (filename.endsWith('.mp4')) {
      return 'video/mp4';
    }
    return 'application/octet-stream';
  }

  private getCacheControl(filename: string, isLive: boolean): string {
    if (filename.startsWith('init-')) {
      return 'public, max-age=3600, immutable';
    }

    if (isLive) {
      return 'public, max-age=10';
    } else {
      return 'public, max-age=31536000, immutable';
    }
  }

  async segmentExists(streamId: string, filename: string): Promise<boolean> {
    const objectPath = `streams/${streamId}/${filename}`;
    const bucket = this.minio.getDefaultBucket();

    try {
      await this.minio.statObject(bucket, objectPath);
      return true;
    } catch {
      return false;
    }
  }

  async listSegments(streamId: string): Promise<string[]> {
    const prefix = `streams/${streamId}/`;
    const bucket = this.minio.getDefaultBucket();

    try {
      const objects = await this.minio.listObjects(bucket, prefix, true);

      return objects
        .map((obj) => obj.name)
        .filter((name): name is string => Boolean(name));
    } catch (error) {
      console.error('Failed to list segments:', error);
      return [];
    }
  }
}
