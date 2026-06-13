import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { StreamModule } from './stream/stream.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { GiftModule } from './gift/gift.module';
import { HistoryModule } from './history/history.module';
import { StudioModule } from './studio/studio.module';

@Module({
  imports: [
    UserModule,
    StreamModule,
    AuthModule,
    ChatModule,
    GiftModule,
    HistoryModule,
    StudioModule,

    SchedulerModule,
  ],
})
export class MainModule {}
