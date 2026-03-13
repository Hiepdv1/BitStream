import { Module } from '@nestjs/common';
import { StreamService } from './services/stream.service';
import { StreamController } from './controllers/stream.controller';

import { DashPlaylistService } from './services/dash-playlist.service';

@Module({
  imports: [],
  controllers: [StreamController],
  providers: [StreamService, DashPlaylistService],
  exports: [StreamService],
})
export class StreamModule {}
