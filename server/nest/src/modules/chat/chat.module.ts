import { Module } from '@nestjs/common';
import { ChatGateway } from './gateway/chat.gateway';
import { WsExceptionFilter } from 'src/app/filters/ws-exception.filter';

import { JwtSecurityModule } from '../security/jwt/jwt.module';

import { ChatDispatcher } from './dispatchers/chat.dispatcher';
import { ChatHandler } from './handlers/chat.handler';
import { ChatService } from './services/chat.service';

@Module({
  imports: [JwtSecurityModule],
  providers: [
    ChatGateway,
    WsExceptionFilter,
    ChatDispatcher,
    ChatHandler,
    ChatService,
  ],
  exports: [ChatGateway],
})
export class ChatModule {}
