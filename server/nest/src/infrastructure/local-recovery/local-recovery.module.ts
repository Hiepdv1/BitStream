import { Module } from '@nestjs/common';
import { LocalRecoveryService } from './local-recovery.service';

@Module({
  imports: [],
  providers: [LocalRecoveryService],
  exports: [LocalRecoveryService],
})
export class LocalRecoveryModule {}
