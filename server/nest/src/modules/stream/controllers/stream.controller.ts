import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SkipAuth, SkipSignature } from 'src/common/decorators';
import { Ok } from 'src/common/response/response.helper';
import { StreamDto, StreamOnPublishDto } from '../dtos/stream.dto';
import { StreamService } from '../services/stream.service';
import type { Request } from 'express';

@Controller('/stream')
export class StreamController {
  constructor(private readonly streamService: StreamService) {}

  @Post()
  @SkipSignature() // TODO: remove this decorator
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
  public async onPublish(
    @Body() body: StreamOnPublishDto,
    @Req() req: Request,
  ) {
    await this.streamService.verifyStreamKey(body);
    return 'OK';
  }
}
