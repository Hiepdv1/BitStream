import { ChatGateway } from '../gateway/chat.gateway';
import { Interval } from '@nestjs/schedule';
import { Injectable } from '@nestjs/common';
import { BinaryWriter } from 'src/infrastructure/binary/write/write';
import { Opcode } from 'src/common/constants/protocol.constant';
import { ChatInternalService } from '../services/chat-internal.service';

@Injectable()
export class StreamMetricsScheduler {
  private readonly sharedWriter = new BinaryWriter(256);

  constructor(
    private readonly chatInternalService: ChatInternalService,
    private readonly ChatGateway: ChatGateway,
  ) {}

  @Interval(10000)
  async handleBroadcastMetrics() {
    const activeStreams = await this.chatInternalService.getActiveStreams();

    if (!activeStreams || activeStreams.length === 0) return;

    const writer = BinaryWriter.createPacket(
      Opcode.STREAM_METRICS,
      this.sharedWriter,
    );

    for (const streamID of activeStreams) {
      const metrics = await this.chatInternalService.getLiveMetrics(streamID);
      writer.writeString8(streamID);
      writer.writeUint32BE(metrics.totalViews);
      writer.writeUint32BE(metrics.currentViewers);

      this.ChatGateway.server.to(streamID).emit('b', writer.finish());
    }
  }
}
