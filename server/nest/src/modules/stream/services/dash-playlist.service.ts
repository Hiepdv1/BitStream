import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { MinioService } from 'src/infrastructure/minio/minio.service';

@Injectable()
export class DashPlaylistService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly minio: MinioService,
  ) {}

  public async getManifest(streamId: string): Promise<string> {
    const stream = await this.prisma.stream.findUnique({
      where: { id: streamId },
      include: { meta: true },
    });

    if (!stream) {
      throw new NotFoundException('Stream not found');
    }

    if (!stream.meta) {
      throw new NotFoundException('Stream metadata missing for replay');
    }

    let duration = stream.meta.totalDuration;
    if (duration <= 0 && stream.startedAt && stream.endedAt) {
      duration = (stream.endedAt.getTime() - stream.startedAt.getTime()) / 1000;
    }

    return this.generateStaticManifest(stream.id, stream.meta);
  }

  private generateStaticManifest(
    streamID: string,
    meta: Prisma.StreamMetaCreateManyInput,
  ): string {
    const timeScale = meta.timescale || 1000;
    const segDuration = meta.segmentDuration || 0;
    const segmentCount = meta.lastSegmentSeq || 0;

    const totalDurationSeconds = (segmentCount * segDuration) / timeScale;
    const mediaPresentationDuration = `PT${totalDurationSeconds.toFixed(3)}S`;

    const videoRepId = meta.videoRepId || '0';
    const audioRepId = meta.audioRepId || '1';
    const cdnBase = `${this.config.get('CDN_URL')}/${streamID}`;

    const repeat = segmentCount > 0 ? segmentCount - 1 : 0;

    return `<?xml version="1.0" encoding="utf-8"?>
<MPD xmlns="urn:mpeg:dash:schema:mpd:2011"
     profiles="urn:mpeg:dash:profile:isoff-on-demand:2011"
     type="static"
     mediaPresentationDuration="${mediaPresentationDuration}"
     minBufferTime="PT4S">
  <BaseURL>${cdnBase}/</BaseURL>
  <Period start="PT0S">
    <AdaptationSet contentType="video" segmentAlignment="true">
      <Representation id="${videoRepId}" mimeType="video/mp4" codecs="avc1.4d401f" bandwidth="2500000" width="1280" height="720">
        <SegmentTemplate
          timescale="${timeScale}"
          initialization="init-${videoRepId}.mp4"
          media="chunk-${videoRepId}-$Number$.m4s"
          startNumber="1">
          <SegmentTimeline>
            <S t="0" d="${segDuration}" r="${repeat}" />
          </SegmentTimeline>
        </SegmentTemplate>
      </Representation>
    </AdaptationSet>

    <AdaptationSet contentType="audio" segmentAlignment="true">
      <Representation id="${audioRepId}" mimeType="audio/mp4" codecs="mp4a.40.2" bandwidth="128000">
        <SegmentTemplate
          timescale="${timeScale}"
          initialization="init-${audioRepId}.mp4"
          media="chunk-${audioRepId}-$Number$.m4s"
          startNumber="1">
          <SegmentTimeline>
            <S t="0" d="${segDuration}" r="${repeat}" />
          </SegmentTimeline>
        </SegmentTemplate>
      </Representation>
    </AdaptationSet>
  </Period>
</MPD>`;
  }

  private formatISODuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.round(seconds % 60);

    let res = 'PT';
    if (hours > 0) res += `${hours}H`;
    if (minutes > 0) res += `${minutes}M`;
    res += `${secs}S`;
    return res;
  }

  async getStreamInfo(streamId: string) {
    const stream = await this.prisma.stream.findUnique({
      where: { id: streamId },
      include: { meta: true },
    });

    if (!stream) {
      throw new NotFoundException('Stream not found');
    }

    return {
      streamId: stream.id,
      title: stream.title,
      description: stream.description,
      isLive: stream.isLive,
      totalDuration: stream.meta?.totalDuration || 0,
      createdAt: stream.createdAt,
      updatedAt: stream.updatedAt,
    };
  }
}
