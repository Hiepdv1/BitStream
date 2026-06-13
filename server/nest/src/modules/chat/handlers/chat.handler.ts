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
      writer.writeString8(payload.id);
      writer.writeString8(payload.userID);
      writer.writeString8(auth.name);
      writer.writeString8(auth.avatar || '');
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

    if (!auth) {
      throw new WsUnauthorizedException('Unauthorized');
    }

    if (streamID.length !== 25) {
      throw new WsBadRequestException('Invalid stream ID');
    }

    await this.chatService.handleJoinRoom(streamID, auth.sub);

    client.join(streamID);
    client.currentRoom = streamID;
  }

  async handleMessageStatus(
    server: Server,
    client: Socket,
    reader: BinaryReader,
    opcode: Opcode.MSG_PIN | Opcode.MSG_UNPIN,
  ) {
    let streamID: string;
    let messageID: string;
    let isPinned: boolean;

    try {
      streamID = reader.readString8();
      messageID = reader.readString8();
      isPinned = reader.readBool();
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
    if (messageID.length !== 21) {
      throw new WsBadRequestException('Invalid message ID');
    }

    if (!auth) {
      throw new WsUnauthorizedException('Unauthorized');
    }
    if (!client.rooms.has(streamID)) {
      throw new WsBadRequestException('Not in room');
    }

    const payload = await this.chatService.handleUpdateMessageStatus(
      streamID,
      messageID,
      auth.sub,
      isPinned,
      opcode,
    );

    let writer: BinaryWriter;
    try {
      writer = BinaryWriter.createPacket(opcode);
      writer.writeString8(payload.streamID);
      writer.writeString8(payload.id);
      writer.writeBool(payload.isPinned);
    } catch (err) {
      throw err;
    }

    server.to(streamID).emit('b', writer.finish());
  }

  async handleDeleteMessage(
    server: Server,
    client: Socket,
    reader: BinaryReader,
  ) {
    let streamID: string;
    let messageID: string;

    try {
      streamID = reader.readString8();
      messageID = reader.readString8();
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
    if (messageID.length !== 21) {
      throw new WsBadRequestException('Invalid message ID');
    }

    if (!auth) {
      throw new WsUnauthorizedException('Unauthorized');
    }
    if (!client.rooms.has(streamID)) {
      throw new WsBadRequestException('Not in room');
    }

    const payload = await this.chatService.handleDeleteMessage(
      streamID,
      messageID,
      auth.sub,
    );

    let writer: BinaryWriter;

    try {
      writer = BinaryWriter.createPacket(Opcode.MSG_DELETE);
      writer.writeString8(payload.streamID);
      writer.writeString8(payload.id);
    } catch (err) {
      throw err;
    }

    server.to(streamID).emit('b', writer.finish());
  }

  async handleStreamHeartbeat(
    server: Server,
    client: Socket,
    reader: BinaryReader,
  ) {
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

    const auth = client.auth;

    if (streamID.length !== 25) {
      throw new WsBadRequestException('Invalid stream ID');
    }

    if (!auth) {
      throw new WsUnauthorizedException('Unauthorized');
    }

    await this.chatService.handleStreamHeartbeat(streamID, auth.sub);
  }
}
