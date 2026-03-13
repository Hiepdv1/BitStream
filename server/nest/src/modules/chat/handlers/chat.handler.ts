import { Injectable } from '@nestjs/common';
import { ChatService } from '../services/chat.service';
import { Socket } from 'socket.io';
import {
  WsBadRequestException,
  WsInternalServerErrorException,
  WsUnauthorizedException,
} from 'src/common/exceptions/ws-exception';
import { BinaryReader } from 'src/infrastructure/binary/reader/reader';
import { Server } from 'socket.io';
import { Opcode } from 'src/common/constants/protocol.constant';
import { BinaryWriter } from 'src/infrastructure/binary/write/write';

@Injectable()
export class ChatHandler {
  constructor(private readonly chatService: ChatService) {}

  async handleSendMessage(
    server: Server,
    client: Socket,
    reader: BinaryReader,
  ) {
    let streamID: string;
    let message: string;

    try {
      streamID = reader.readString8();
      message = reader.readString8();
    } catch {
      client.disconnect(true);
      return;
    }

    if (reader.remainingBytes > 0) {
      client.disconnect(true);
      return;
    }

    const auth = client.auth;

    if (streamID.length !== 25) {
      throw new WsBadRequestException('Invalid stream ID');
    }
    if (message.length === 0) {
      throw new WsBadRequestException('Message cannot be empty');
    }

    if (!auth) {
      throw new WsUnauthorizedException('Unauthorized');
    }
    if (!client.rooms.has(streamID)) {
      throw new WsBadRequestException('Not in room');
    }

    const payload = await this.chatService.handleSendMessage(
      streamID,
      message,
      auth,
    );

    let writer: BinaryWriter;
    try {
      writer = BinaryWriter.createPacket(Opcode.STREAM_MESSAGE);
      writer.writeString8(payload.userID);
      writer.writeString8(payload.message);
      writer.writeUint32BE(payload.offsetMs);
    } catch (err) {
      throw err;
    }

    server.to(payload.streamID).emit('b', writer.finish());
  }

  async handleJoinRoom(server: Server, client: Socket, reader: BinaryReader) {
    let streamID: string;

    try {
      streamID = reader.readString8();
    } catch {
      client.disconnect(true);
      return;
    }

    if (reader.remainingBytes > 0) {
      client.disconnect(true);
      return;
    }

    if (client.rooms.has(streamID)) {
      return true;
    }

    const auth = client.auth;

    if (streamID.length !== 25) {
      throw new WsBadRequestException('Invalid stream ID');
    }

    if (!auth) {
      throw new WsUnauthorizedException('Unauthorized');
    }

    await this.chatService.handleJoinRoom(streamID);

    client.join(streamID);

    return true;
  }
}
