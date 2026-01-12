import { Module } from '@nestjs/common';
import { ProviderTokenGuard } from './guards/provider-token.guard';
import { PrismaModule } from 'src/infrastructure/database/prisma/prisma.module';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { SecurityModule } from '../security/security.module';
import { RedisModule } from 'src/infrastructure/redis/redis.module';
import { KafkaModule } from 'src/infrastructure/kafka/kafka.module';
import { LoggerModule } from 'src/infrastructure/logger/logger.module';

@Module({
  imports: [
    PrismaModule,
    SecurityModule,
    RedisModule,
    KafkaModule,
    LoggerModule,
  ],
  controllers: [AuthController],
  providers: [ProviderTokenGuard, AuthService],
  exports: [AuthService],
})
export class AuthModule {}
