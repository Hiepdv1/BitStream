import { Module } from '@nestjs/common';
import { StreamService } from './services/stream.service';
import { StreamController } from './controllers/stream.controller';
import { DatabaseModule } from 'src/infrastructure/database/database.module';
import { KafkaModule } from 'src/infrastructure/kafka/kafka.module';
import { LoggerModule } from 'src/infrastructure/logger/logger.module';

@Module({
  imports: [DatabaseModule, KafkaModule, LoggerModule],
  controllers: [StreamController],
  providers: [StreamService],
  exports: [StreamService],
})
export class StreamModule {}
