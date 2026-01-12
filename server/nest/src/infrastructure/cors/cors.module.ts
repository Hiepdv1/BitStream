import { Module } from '@nestjs/common';
import { CorsService } from './cors.service';

@Module({
  providers: [CorsService],
  exports: [CorsService],
})
export class CorsModule {}
