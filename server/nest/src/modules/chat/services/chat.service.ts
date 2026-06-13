import { Injectable } from '@nestjs/common';
import {
  WsBadRequestException,
  WsInternalServerErrorException,
  WsUnauthorizedException,
} from 'src/common/exceptions/ws-exception';
import {
  DeleteMessagePayload,
  PinMessagePayload,
  SendMessagePayload,
} from 'src/common/kafka-payloads/chat/message.payload';
import { generateNanoId } from 'src/common/utils';
import { AuthPayload } from 'src/modules/auth/types/auth';
import { KafkaProducerService } from 'src/infrastructure/kafka/kafka.producer';
import { KafkaTopic } from 'src/infrastructure/kafka/kafka.topics';
import { ChatMesssageType } from 'src/generated/prisma/enums';
import { Opcode } from 'src/common/constants/protocol.constant';
import { ChatInternalService } from './chat-internal.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly chatInternalService: ChatInternalService,
    private readonly kafkaProducerService: KafkaProducerService,
  ) {}

  async handleJoinRoom(streamID: string, userID: string) {
    const streamSession =
      await this.chatInternalService.getStreamSession(streamID);

    if (streamSession.status === 'ended') {
      throw new WsBadRequestException('Stream ended');
    }

    await Promise.all([
      this.chatInternalService.addActiveStream(streamID),
      this.chatInternalService.recordView(streamID, userID),
    ]);
  }

  async handleSendMessage(
    streamID: string,
    message: string,
    auth: AuthPayload,
  ) {
    const streamSession =
      await this.chatInternalService.getStreamSession(streamID);

    if (streamSession.status === 'ended') {
      throw new WsBadRequestException('Stream ended');
    }

    const offsetMs = Date.now() - streamSession.startedAt;
    const payload: SendMessagePayload = {
      action: 'INSERT',
      id: generateNanoId(),
      opcode: Opcode.MSG_TEXT,
      streamID,
      message,
      userID: auth.sub,
      type: ChatMesssageType.TEXT,
      offsetMs,
      retryCount: 0,
      maxRetry: 3,
      eventId: generateNanoId(),
      occurredAt: new Date().toString(),
    };

    const kafkaError = await this.kafkaProducerService.publish(
      KafkaTopic.CHAT_MESSAGE,
      payload,
      streamID,
    );

    if (kafkaError) {
      throw new WsBadRequestException('Failed to send message');
    }

    await this.chatInternalService.cacheLiveMessage(streamID, {
      id: payload.id,
      message: payload.message,
      userID: payload.userID,
      offsetMs: payload.offsetMs,
      userName: auth.name,
      userAvatar: auth.avatar,
    });

    return payload;
  }

  async handleUpdateMessageStatus(
    streamID: string,
    messageID: string,
    userID: string,
    isPinned: boolean,
    opcode: Opcode.MSG_PIN | Opcode.MSG_UNPIN,
  ) {
    const streamSession =
      await this.chatInternalService.getStreamSession(streamID);

    if (streamSession.status === 'ended') {
      throw new WsBadRequestException('Stream ended');
    }

    if (streamSession.ownerId !== userID) {
      throw new WsUnauthorizedException('Unauthorized');
    }

    const payload: PinMessagePayload = {
      action: 'UPDATE',
      opcode,
      streamID,
      id: messageID,
      isPinned,
      userID,
      retryCount: 0,
      maxRetry: 3,
      eventId: generateNanoId(),
      occurredAt: new Date().toString(),
    };

    const [kafkaErr, history] = await Promise.all([
      this.kafkaProducerService.publish(
        KafkaTopic.CHAT_MESSAGE,
        payload,
        streamID,
      ),
      this.chatInternalService.getLiveHistory(streamID),
    ]);

    if (kafkaErr) {
      throw new WsInternalServerErrorException();
    }

    const msgItem = history.find((m) => m.id === messageID);

    if (!msgItem) {
      throw new WsInternalServerErrorException();
    }

    if (opcode === Opcode.MSG_PIN) {
      await this.chatInternalService.cachePinnedMessage(streamID, {
        id: payload.id,
        message: msgItem.message,
        userID: msgItem.userID,
        offsetMs: msgItem.offsetMs,
        userName: msgItem.userName,
        userAvatar: msgItem.userAvatar,
      });
    } else {
      await this.chatInternalService.removePinnedMessage(streamID);
    }

    return payload;
  }

  async handleDeleteMessage(
    streamID: string,
    messageID: string,
    userID: string,
  ) {
    const streamSession =
      await this.chatInternalService.getStreamSession(streamID);

    if (streamSession.status === 'ended') {
      throw new WsBadRequestException('Stream ended');
    }

    if (streamSession.ownerId !== userID) {
      throw new WsUnauthorizedException('Unauthorized');
    }

    const payload: DeleteMessagePayload = {
      action: 'DELETE',
      opcode: Opcode.MSG_DELETE,
      streamID,
      id: messageID,
      userID,
      retryCount: 0,
      maxRetry: 3,
      eventId: generateNanoId(),
      occurredAt: new Date().toString(),
    };

    const [kafkaErr] = await Promise.all([
      this.kafkaProducerService.publish(
        KafkaTopic.CHAT_MESSAGE,
        payload,
        streamID,
      ),
      this.chatInternalService.removeMessageFromCache(streamID, messageID),
    ]);

    if (kafkaErr) {
      throw new WsInternalServerErrorException('Failed to delete message');
    }

    return payload;
  }

  async handleStreamHeartbeat(streamID: string, userID: string) {
    const streamSession =
      await this.chatInternalService.getStreamSession(streamID);

    if (streamSession.status === 'ended') {
      throw new WsBadRequestException('Stream ended');
    }

    await this.chatInternalService.recordView(streamID, userID);
  }
}
