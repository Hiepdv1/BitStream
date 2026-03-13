import { Injectable } from '@nestjs/common';
import { RecoveryEntry } from './interfaces/recovery-entry.interface';
import { LoggerService } from '../logger/logger.service';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LocalRecoveryService {
  private readonly baseDir: string;

  constructor(
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
  ) {
    const root = process.cwd();

    this.baseDir =
      this.config.get<string>('RECOVERY_DIR') || `${root}/recovery`;
  }

  async save<T>(entry: RecoveryEntry<T>) {
    try {
      await fs.promises.mkdir(this.baseDir, { recursive: true });

      const filePath = path.join(this.baseDir, `${entry.type}.jsonl`);

      const json = JSON.stringify(entry);

      await fs.promises.appendFile(filePath, json + '\n', {
        encoding: 'utf-8',
      });
    } catch (err) {
      this.logger.error({
        message: 'CRITICAL: failed to write recovery file',
        service: 'local-recovery',
        error: err,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
