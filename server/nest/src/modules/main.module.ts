import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { StreamModule } from './stream/stream.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [UserModule, StreamModule, AuthModule],
})
export class MainModule {}
