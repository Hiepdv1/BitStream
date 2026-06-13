import { Module } from '@nestjs/common';
import { CypherService } from './cipher.service';

@Module({
  providers: [CypherService],
  exports: [CypherService],
})
export class SecurityModule {}
