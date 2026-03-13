import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { StreamModule } from './stream/stream.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [UserModule, StreamModule, AuthModule, ChatModule],
})
export class MainModule {}
