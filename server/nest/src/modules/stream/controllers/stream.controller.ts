import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { SkipAuth } from 'src/common/decorators';
import { Ok, paginatedResponse } from 'src/common/response/response.helper';
import {
  ListStreamQueryDto,
  StreamDto,
  UpdateStreamDto,
  StreamOnPublishDto,
  ThumbnailStream,
} from '../dtos/stream.dto';
import { StreamService } from '../services/stream.service';
import { ReqPayload } from 'src/common/decorators/auth-payload';
import type { AuthPayload } from 'src/modules/auth/types/auth';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ThumbnailStreamPipe } from '../pipe/create-stream.pipe';

@Controller('/stream')
export class StreamController {
  constructor(private readonly streamService: StreamService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'thumbnail', maxCount: 1 }], {
      limits: {
        fileSize: 3 * 1024 * 1024,
        files: 1,
      },
    }),
  )
  public async createStream(
    @Body() streamDto: StreamDto,
    @ReqPayload() auth: AuthPayload,
    @UploadedFiles(ThumbnailStreamPipe) data: ThumbnailStream,
  ) {
    if (!auth) {
      throw new InternalServerErrorException('Auth context not found');
    }
    const newStream = await this.streamService.createStream(
      { ...streamDto, thumbnail: data.thumbnail },
      auth,
    );
    return Ok(newStream);
  }

  @Get('/list')
  public async getListStream(
    @ReqPayload() auth: AuthPayload,
    @Query() query: ListStreamQueryDto,
  ) {
    const { data, pagination } = await this.streamService.getListStream(
      query,
      auth,
    );

    return paginatedResponse(
      data.map(({ thumbnails, ...rest }) => ({
        ...rest,
        thumbnail_url: thumbnails?.[0]?.storageKey,
      })),
      pagination,
    );
  }

  @Get('/:streamID/key')
  public async getStreamKey(
    @Param('streamID') streamID: string,
    @ReqPayload() auth: AuthPayload,
  ) {
    const streamKey = await this.streamService.getStreamKey(streamID, auth);
    return Ok(streamKey);
  }

  @Put('/:streamID/edit')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'thumbnail', maxCount: 1 }], {
      limits: {
        fileSize: 1 * 1024 * 1024,
        files: 1,
      },
    }),
  )
  public async editStream(
    @Param('streamID') streamID: string,
    @ReqPayload() auth: AuthPayload,
    @Body() streamDto: UpdateStreamDto,
    @UploadedFiles(ThumbnailStreamPipe) data: ThumbnailStream,
  ) {
    const payload = {
      ...streamDto,
      thumbnail: data.thumbnail,
    };

    if (Object.keys(payload).length === 0) {
      throw new BadRequestException('Payload is empty');
    }

    const updated = await this.streamService.updateStream(
      streamID,
      payload,
      auth,
    );

    return Ok(updated);
  }

  @Delete('/:streamId')
  @HttpCode(HttpStatus.OK)
  public async deleteStream(
    @Param('streamId') streamId: string,
    @ReqPayload() auth: AuthPayload,
  ) {
    const message = await this.streamService.deleteStream(auth, streamId);
    return Ok(null, message);
  }

  @Post('on_publish')
  @HttpCode(HttpStatus.OK)
  @SkipAuth()
  public async onPublish(@Body() body: StreamOnPublishDto) {
    await this.streamService.onPublish(body);
    return 'OK';
  }

  @Post('on_done')
  @HttpCode(HttpStatus.OK)
  @SkipAuth()
  public async onPublishDone(@Body() body: StreamOnPublishDto) {
    await this.streamService.onDone(body);
    return 'OK';
  }

  @Get('/:streamID/session')
  @HttpCode(HttpStatus.OK)
  @SkipAuth()
  public async getStreamSession(@Param('streamID') streamID: string) {
    const session = await this.streamService.getStreamSession(streamID);
    return Ok(session);
  }

  @Get('/:streamId')
  @SkipAuth()
  public async getStreamInfo(
    @Param('streamId') streamId: string,
    @ReqPayload() auth: AuthPayload,
  ) {
    const info = await this.streamService.getStreamInfo(streamId, auth);

    return Ok(info);
  }

  @Post('/:streamId/follow')
  @HttpCode(HttpStatus.OK)
  public async followStream(
    @Param('streamId') streamId: string,
    @ReqPayload() auth: AuthPayload,
  ) {
    const message = await this.streamService.followStream(auth, streamId);
    return Ok(null, message);
  }
}
