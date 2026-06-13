import { Module } from '@nestjs/common';
import { StreamService } from './services/stream.service';
import { StreamController } from './controllers/stream.controller';

import { ChatModule } from '../chat/chat.module';
import { SecurityModule } from 'src/infrastructure/security/security.module';

@Module({
  imports: [ChatModule, SecurityModule],
  controllers: [StreamController],
  providers: [StreamService],
  exports: [StreamService],
})
export class StreamModule {}
