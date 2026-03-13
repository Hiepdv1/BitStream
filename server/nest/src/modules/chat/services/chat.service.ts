import { Injectable } from '@nestjs/common';
import {
  WsBadRequestException,
  WsNotFoundException,
} from 'src/common/exceptions/ws-exception';
import { SendMessagePayload } from 'src/common/kafka-payloads/chat/send-message.payload';
import { generateNanoId } from 'src/common/utils';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { RedisKeyManager } from 'src/infrastructure/redis/redis-key.manager';
import { RedisService } from 'src/infrastructure/redis/redis.service';
import { AccessTokenPayload } from 'src/modules/auth/types/auth';
import { StreamSession } from '../types/chat';
import { KafkaProducerService } from 'src/infrastructure/kafka/kafka.producer';
import { KafkaTopic } from 'src/infrastructure/kafka/kafka.topics';
import { ChatMesssageType } from 'src/generated/prisma/enums';
import { Opcode } from 'src/common/constants/protocol.constant';

@Injectable()
export class ChatService {
  constructor(
    private readonly redisService: RedisService,
    private readonly prismaService: PrismaService,
    private readonly kafkaProducerService: KafkaProducerService,
  ) {}

  async handleJoinRoom(streamID: string) {
    const key = RedisKeyManager.getStreamSessionKey(streamID);
    const streamSession = await this.redisService.get<StreamSession>(key);
    if (streamSession && streamSession.status === 'ended') {
      throw new WsBadRequestException('Stream ended');
    }

    const stream = await this.prismaService.stream.findUnique({
      where: {
        id: streamID,
      },
    });

    if (!stream) throw new WsNotFoundException('Stream not found');
    if (
      !stream.isLive ||
      stream.startedAt === null ||
      stream.endedAt !== null
    ) {
      throw new WsBadRequestException('Stream not live');
    }

    await this.redisService.set<StreamSession>(
      key,
      {
        startedAt: stream.startedAt.getTime(),
        status: 'live',
      },
      {
        ttlSeconds: 3600,
      },
    );
  }

  async handleSendMessage(
    streamID: string,
    message: string,
    auth: AccessTokenPayload,
  ) {
    const key = RedisKeyManager.getStreamSessionKey(streamID);
    const streamSession = await this.redisService.get<StreamSession>(key);

    if (streamSession && streamSession.status === 'ended') {
      throw new WsBadRequestException('Stream ended');
    }

    if (streamSession && streamSession.status === 'live') {
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
        occurredAt: new Date().toISOString(),
      };

      await this.kafkaProducerService.publish(
        KafkaTopic.CHAT_MESSAGE,
        payload,
        streamID,
      );

      return payload;
    }

    const stream = await this.prismaService.stream.findUnique({
      where: {
        id: streamID,
      },
    });

    if (!stream) throw new WsNotFoundException('Stream not found');
    if (
      !stream.isLive ||
      stream.startedAt === null ||
      stream.endedAt !== null
    ) {
      throw new WsBadRequestException('Stream not live');
    }

    const offsetMs = Date.now() - stream.startedAt.getTime();

    const payload: SendMessagePayload = {
      action: 'INSERT',
      id: generateNanoId(),
      opcode: Opcode.MSG_TEXT,
      streamID,
      message,
      userID: auth.sub,
      offsetMs,
      retryCount: 0,
      maxRetry: 3,
      eventId: generateNanoId(),
      type: ChatMesssageType.TEXT,
      occurredAt: new Date().toISOString(),
    };

    await Promise.all([
      this.redisService.set<StreamSession>(
        key,
        {
          startedAt: stream.startedAt.getTime(),
          status: 'live',
        },
        {
          ttlSeconds: 3600,
        },
      ),
      this.kafkaProducerService.publish(
        KafkaTopic.CHAT_MESSAGE,
        payload,
        streamID,
      ),
    ]);

    return payload;
  }
}
