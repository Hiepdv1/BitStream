import { Module } from '@nestjs/common';
import { StreamService } from './services/stream.service';
import { StreamController } from './controllers/stream.controller';
import { DatabaseModule } from 'src/infrastructure/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [StreamController],
  providers: [StreamService],
  exports: [StreamService],
})
export class StreamModule {}
