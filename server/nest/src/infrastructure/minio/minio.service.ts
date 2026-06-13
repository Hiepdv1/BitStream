import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { ItemBucketMetadata } from 'minio';
import {
  ObjectInfo,
  UploadedObjectInfo,
} from 'node_modules/minio/dist/esm/internal/type.mjs';
import { Readable } from 'stream';
import { BucketType, DeleteObjectOptions } from './types/minio';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class MinioService implements OnModuleInit {
  private client: Minio.Client;
  private readonly buckets: Record<BucketType, string>;

  private readonly defaultBucket: string;

  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.buckets = {
      [BucketType.GIFT]: this.config.get('MINIO_GIFT_BUCKET', 'gift'),
      [BucketType.LIVE]: this.config.get('MINIO_LIVE_BUCKET', 'hls-streams'),
      [BucketType.STREAM_THUMBNAIL]: this.config.get(
        'MINIO_STREAM_THUMBNAIL_BUCKET',
        'stream-thumbnail',
      ),
      [BucketType.AVATAR]: this.config.get('MINIO_AVATAR_BUCKET', 'avatar'),
    };
    this.defaultBucket = this.buckets[BucketType.LIVE];
  }

  async onModuleInit() {
    this.client = new Minio.Client({
      endPoint: this.config.get('MINIO_ENDPOINT', 'localhost'),
      port: Number(this.config.get('MINIO_PORT', 9000)),
      useSSL: this.config.get('MINIO_USE_SSL') === 'true',
      accessKey: this.config.get('MINIO_ACCESS_KEY'),
      secretKey: this.config.get('MINIO_SECRET_KEY'),
    });

    await this.initBuckets();
  }

  private async initBuckets() {
    const buckets = Object.values(this.buckets);

    for (const bucket of buckets) {
      try {
        const exists = await this.client.bucketExists(bucket);
        if (!exists) {
          await this.client.makeBucket(bucket);
          this.logger.info({
            message: `Successfully created bucket: ${bucket}`,
            service: 'minio',
            timestamp: new Date().toISOString(),
          });

          await this.setPublicBucketPolicy(bucket);
        }
      } catch (error) {
        this.logger.error({
          message: `Error initializing bucket ${bucket}:`,
          service: 'minio',
          timestamp: new Date().toISOString(),
          error,
        });
      }
    }
  }

  private async setPublicBucketPolicy(bucketName: string) {
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetBucketLocation', 's3:ListBucket'],
          Resource: [`arn:aws:s3:::${bucketName}`],
        },
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${bucketName}/*`],
        },
      ],
    };

    await this.client.setBucketPolicy(bucketName, JSON.stringify(policy));
    this.logger.info({
      message: `Public Policy applied to bucket: ${bucketName}`,
      service: 'minio',
      timestamp: new Date().toISOString(),
    });
  }

  async getFileStream(
    objectName: string,
    bucket = this.defaultBucket,
  ): Promise<Readable> {
    return this.client.getObject(bucket, objectName);
  }

  async getTextFile(
    objectName: string,
    bucket = this.defaultBucket,
  ): Promise<string> {
    const stream = await this.getFileStream(objectName, bucket);

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (c) => chunks.push(c));
      stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      stream.on('error', reject);
    });
  }

  async getObject(bucket: string, objectPath: string): Promise<Readable> {
    return this.client.getObject(bucket, objectPath);
  }

  async statObject(
    bucket: string,
    objectPath: string,
  ): Promise<Minio.BucketItemStat> {
    return this.client.statObject(bucket, objectPath);
  }

  async uploadFile(
    bucket: string,
    objectPath: string,
    stream: Readable | Buffer | string,
    size?: number,
    metadata?: ItemBucketMetadata,
  ): Promise<UploadedObjectInfo> {
    return this.client.putObject(bucket, objectPath, stream, size, metadata);
  }

  async objectExists(bucket: string, objectPath: string): Promise<boolean> {
    try {
      await this.statObject(bucket, objectPath);
      return true;
    } catch (error) {
      if (error.code === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  async deleteObject(
    bucket: string,
    objectPath: string,
    options: DeleteObjectOptions = { ignoreNotFound: true },
  ): Promise<void> {
    try {
      await this.client.removeObject(bucket, objectPath);
    } catch (error) {
      if (
        options.ignoreNotFound &&
        (error.code === 'NoSuchKey' || error.code === 'NotFound')
      ) {
        return;
      }

      throw error;
    }
  }

  async listObjects(
    bucket: string,
    prefix: string,
    recursive = true,
  ): Promise<ObjectInfo[]> {
    return new Promise((resolve, reject) => {
      const objects: ObjectInfo[] = [];
      const stream = this.client.listObjects(bucket, prefix, recursive);

      stream.on('data', (obj) => objects.push(obj));
      stream.on('end', () => resolve(objects));
      stream.on('error', reject);
    });
  }

  getDefaultBucket(): string {
    return this.defaultBucket;
  }

  getGiftBucket(): string {
    return this.buckets.gift;
  }

  getLiveBucket(): string {
    return this.buckets.live;
  }

  getStreamThumbnailBucket(): string {
    return this.buckets['stream-thumbnail'];
  }

  getAvatarBucket(): string {
    return this.buckets.avatar;
  }
}
