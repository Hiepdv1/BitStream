import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

@Injectable()
export class CypherService {
  private readonly DEFAULT_ALGORITHM = 'aes-256-cbc';
  private readonly secretKey: string;

  constructor(private readonly configs: ConfigService) {
    this.secretKey = this.configs.get<string>('STREAM_ENCRYPTION_KEY')!;
    if (!this.secretKey || this.secretKey.length !== 32) {
      throw new Error('STREAM_ENCRYPTION_KEY must be 32 characters long');
    }
  }

  public async encrypt(text: string, algo: string = this.DEFAULT_ALGORITHM) {
    try {
      const iv = randomBytes(16);
      const cipher = createCipheriv(algo, this.secretKey, iv);

      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      return {
        iv: iv.toString('hex'),
        content: encrypted,
        algorithm: algo,
      };
    } catch (error) {
      throw new BadRequestException(`Encryption failed: ${error.message}`);
    }
  }

  public async decrypt(
    content: string,
    iv: string,
    algo: string = this.DEFAULT_ALGORITHM,
  ) {
    try {
      const decipher = createDecipheriv(
        algo,
        this.secretKey,
        Buffer.from(iv, 'hex'),
      );

      let decrypted = decipher.update(content, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new BadRequestException(
        `Decryption failed: Invalid algorithm or corrupted data`,
      );
    }
  }
}
