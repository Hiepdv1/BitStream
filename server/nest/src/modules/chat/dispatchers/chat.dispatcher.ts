import { Injectable } from '@nestjs/common';
import { Opcode } from 'src/common/constants/protocol.constant';
import { Socket } from 'socket.io';
import { ChatHandler } from '../handlers/chat.handler';
import { WsNotFoundException } from 'src/common/exceptions/ws-exception';
import { BinaryReader } from 'src/infrastructure/binary/reader/reader';
import { Server } from 'socket.io';

@Injectable()
export class ChatDispatcher {
  constructor(private readonly chatHandler: ChatHandler) {}

  async dispatch(
    server: Server,
    client: Socket,
    opcode: Opcode,
    reader: BinaryReader,
  ) {
    switch (opcode) {
      case Opcode.MSG_TEXT:
        return await this.chatHandler.handleSendMessage(server, client, reader);
      case Opcode.JOIN_ROOM:
        return await this.chatHandler.handleJoinRoom(server, client, reader);
      default:
        throw new WsNotFoundException('Opcode not handled in ChatModule');
    }
  }
}
