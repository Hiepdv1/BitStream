import { BadRequestException, Injectable } from '@nestjs/common';
import { ChatInternalService } from './chat-internal.service';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { MetaHelper } from 'src/common/helpers/meta.helper';

@Injectable()
export class ChatApiService {
  constructor(
    private readonly chatInternalService: ChatInternalService,
    private readonly prismaService: PrismaService,
  ) {}

  async getLiveHistory(streamID: string) {
    const streamSession =
      await this.chatInternalService.getStreamSession(streamID);

    if (streamSession.status === 'ended') {
      throw new BadRequestException('Stream is not live');
    }

    let hisotry = await this.chatInternalService.getLiveHistory(streamID);
    const pinnedMessage =
      await this.chatInternalService.getPinnedMessage(streamID);

    if (pinnedMessage) {
      hisotry = hisotry.map((item) => {
        if (item.id === pinnedMessage.id) {
          return pinnedMessage;
        }
        return item;
      });
    }

    return {
      messages: hisotry,
      pinned: pinnedMessage || null,
    };
  }

  async getVodHistory(
    streamID: string,
    from?: number,
    to?: number,
    limit: number = 30,
  ) {
    const stream = await this.prismaService.stream.findUnique({
      where: {
        id: streamID,
      },
      select: { id: true, isLive: true, endedAt: true },
    });

    if (!stream) {
      throw new BadRequestException('Stream not found');
    }

    if (stream.endedAt === null || stream.isLive === true) {
      throw new BadRequestException('Stream is not ended');
    }

    const [messages, total] = await Promise.all([
      this.prismaService.chatMessage.findMany({
        where: {
          streamId: streamID,
          offsetMs: {
            ...(from ? { gte: from } : {}),
            ...(to ? { lte: to } : {}),
          },
        },
        select: {
          id: true,
          content: true,
          userId: true,
          offsetMs: true,
          user: {
            select: {
              name: true,
              id: true,
              profileImages: {
                select: {
                  storageKey: true,
                },
              },
            },
          },
        },
        orderBy: {
          offsetMs: 'asc',
        },
        take: limit + 1,
      }),
      this.prismaService.chatMessage.count({
        where: {
          streamId: streamID,
          offsetMs: {
            gte: from,
            ...(to ? { lte: to } : {}),
          },
        },
      }),
    ]);

    const hasMore = messages.length > limit;
    if (hasMore) {
      messages.pop();
    }

    const lastMessage = messages[messages.length - 1];

    let nextOffsetMs = hasMore && lastMessage ? lastMessage.offsetMs + 1 : null;

    const meta = MetaHelper.offset(limit, total, nextOffsetMs, hasMore);

    return { messages, meta };
  }
}
