import { Module } from '@nestjs/common';
import { ChatGateway } from './gateway/chat.gateway';
import { WsExceptionFilter } from 'src/app/filters/ws-exception.filter';

import { JwtSecurityModule } from '../security/jwt/jwt.module';

import { ChatDispatcher } from './dispatchers/chat.dispatcher';
import { ChatHandler } from './handlers/chat.handler';
import { ChatService } from './services/chat.service';
import { StreamMetricsScheduler } from './scheduler/StreamMetrics.scheduler';
import { ChatController } from './controllers/chat.controller';
import { ChatApiService } from './services/chat-api.service';
import { ChatInternalService } from './services/chat-internal.service';

@Module({
  imports: [JwtSecurityModule],
  controllers: [ChatController],
  providers: [
    ChatGateway,
    WsExceptionFilter,
    ChatDispatcher,
    ChatHandler,
    ChatService,
    StreamMetricsScheduler,
    ChatController,
    ChatApiService,
    ChatInternalService,
  ],
  exports: [ChatGateway, ChatInternalService],
})
export class ChatModule {}
