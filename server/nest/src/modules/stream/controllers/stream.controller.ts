import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { SkipAuth, SkipSignature } from 'src/common/decorators';
import { Ok } from 'src/common/response/response.helper';
import { StreamDto, StreamOnPublishDto } from '../dtos/stream.dto';
import { StreamService } from '../services/stream.service';
import { DashPlaylistService } from '../services/dash-playlist.service';
// import { SegmentService } from '../services/segment.service';
import type { Request, Response } from 'express';

@Controller('/stream')
export class StreamController {
  constructor(
    private readonly streamService: StreamService,
    private readonly dashPlaylistService: DashPlaylistService,
    // private readonly segmentService: SegmentService,
  ) {}

  @Post()
  @SkipSignature()
  public async createStream(@Body() streamDto: StreamDto, @Req() req: Request) {
    const auth = req.payload;
    if (!auth) {
      throw new InternalServerErrorException('Auth context not found');
    }
    const newStream = await this.streamService.createStream(streamDto, auth);
    return Ok(newStream);
  }

  @Post('on_publish')
  @HttpCode(HttpStatus.OK)
  @SkipSignature()
  @SkipAuth()
  public async onPublish(@Body() body: StreamOnPublishDto) {
    await this.streamService.onPublish(body);
    return 'OK';
  }

  @Post('on_done')
  @HttpCode(HttpStatus.OK)
  @SkipSignature()
  @SkipAuth()
  public async onPublishDone(@Body() body: StreamOnPublishDto) {
    await this.streamService.onDone(body);
    return 'OK';
  }

  @Get('/watch/:streamId/manifest.mpd')
  @SkipAuth()
  @SkipSignature()
  @Header('Content-Type', 'application/dash+xml')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @Header('Pragma', 'no-cache')
  @Header('Expires', '0')
  @Header('Access-Control-Allow-Origin', '*')
  @Header('Access-Control-Expose-Headers', 'Content-Length, Content-Type')
  public async watch(
    @Param('streamId') streamId: string,
    @Res() res: Response,
  ) {
    const manifest = await this.dashPlaylistService.getManifest(streamId);
    res.send(manifest);
  }

  // @Get('/watch/:streamId/:filename')
  // @SkipAuth()
  // @SkipSignature()
  // @Header('Access-Control-Allow-Origin', '*')
  // @Header(
  //   'Access-Control-Expose-Headers',
  //   'Content-Length, Content-Type, Content-Range',
  // )
  // public async getSegment(
  //   @Param('streamId') streamId: string,
  //   @Param('filename') filename: string,
  //   @Res({ passthrough: true }) res: Response,
  // ): Promise<StreamableFile> {
  //   const { file, contentType, cacheControl } =
  //     await this.segmentService.getSegment(streamId, filename);

  //   res.set({
  //     'Content-Type': contentType,
  //     'Cache-Control': cacheControl,
  //     'Accept-Ranges': 'bytes',
  //   });

  //   return file;
  // }

  @Get('/:streamId/info')
  @SkipAuth()
  @SkipSignature()
  public async getStreamInfo(@Param('streamId') streamId: string) {
    const info = await this.dashPlaylistService.getStreamInfo(streamId);
    return Ok(info);
  }
}
