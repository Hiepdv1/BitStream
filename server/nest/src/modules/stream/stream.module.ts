import { Module } from '@nestjs/common';
import { StreamService } from './services/stream.service';
import { StreamController } from './controllers/stream.controller';
import { DatabaseModule } from 'src/infrastructure/database/database.module';
import { KafkaModule } from 'src/infrastructure/kafka/kafka.module';
import { LoggerModule } from 'src/infrastructure/logger/logger.module';
import { RedisModule } from 'src/infrastructure/redis/redis.module';
import { DashPlaylistService } from './services/dash-playlist.service';

@Module({
  imports: [DatabaseModule, KafkaModule, LoggerModule, RedisModule],
  controllers: [StreamController],
  providers: [StreamService, DashPlaylistService],
  exports: [StreamService],
})
export class StreamModule {}
