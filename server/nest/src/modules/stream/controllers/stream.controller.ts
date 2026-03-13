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
import type { Request, Response } from 'express';

@Controller('/stream')
export class StreamController {
  constructor(
    private readonly streamService: StreamService,
    private readonly dashPlaylistService: DashPlaylistService,
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

  @Get('/:streamId')
  @SkipAuth()
  @SkipSignature()
  public async getStreamInfo(
    @Param('streamId') streamId: string,
    @Req() req: Request,
  ) {
    const auth = req.payload;

    const info = await this.dashPlaylistService.getStreamInfo(streamId, auth);

    return Ok(info);
  }
}
