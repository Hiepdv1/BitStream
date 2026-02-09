import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { ItemBucketMetadata } from 'minio';
import {
  ObjectInfo,
  UploadedObjectInfo,
} from 'node_modules/minio/dist/esm/internal/type.mjs';
import { Readable } from 'stream';

@Injectable()
export class MinioService implements OnModuleInit {
  private client: Minio.Client;
  private readonly defaultBucket: string;

  constructor(private readonly config: ConfigService) {
    this.defaultBucket = this.config.get('MINIO_BUCKET_NAME', 'hls-streams');
  }

  onModuleInit() {
    this.client = new Minio.Client({
      endPoint: this.config.get('MINIO_ENDPOINT', 'localhost'),
      port: Number(this.config.get('MINIO_PORT', 9000)),
      useSSL: this.config.get('MINIO_USE_SSL') === 'true',
      accessKey: this.config.get('MINIO_ACCESS_KEY'),
      secretKey: this.config.get('MINIO_SECRET_KEY'),
    });
  }

  /**
   * Get file as readable stream
   */
  async getFileStream(
    objectName: string,
    bucket = this.defaultBucket,
  ): Promise<Readable> {
    return this.client.getObject(bucket, objectName);
  }

  /**
   * Get text file content as string
   */
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

  /**
   * Get object (alias for getFileStream for compatibility)
   * Used by SegmentService
   */
  async getObject(bucket: string, objectPath: string): Promise<Readable> {
    return this.client.getObject(bucket, objectPath);
  }

  /**
   * Get object metadata/stats
   * Used to check if segment exists
   */
  async statObject(
    bucket: string,
    objectPath: string,
  ): Promise<Minio.BucketItemStat> {
    return this.client.statObject(bucket, objectPath);
  }

  /**
   * Upload file to MinIO
   */
  async uploadFile(
    bucket: string,
    objectPath: string,
    stream: Readable | Buffer | string,
    size?: number,
    metadata?: ItemBucketMetadata,
  ): Promise<UploadedObjectInfo> {
    return this.client.putObject(bucket, objectPath, stream, size, metadata);
  }

  /**
   * Check if object exists
   */
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

  /**
   * Delete object from MinIO
   */
  async deleteObject(bucket: string, objectPath: string): Promise<void> {
    return this.client.removeObject(bucket, objectPath);
  }

  /**
   * List objects with prefix
   */
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

  /**
   * Get default bucket name
   */
  getDefaultBucket(): string {
    return this.defaultBucket;
  }
}
