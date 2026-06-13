import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { SkipAuth } from 'src/common/decorators';
import {
  ActiveGiftDto,
  CreateGiftDto,
  CreateGiftFileDto,
  GetGiftsDto,
  UpdateGiftDisplaySettingsDto,
} from '../dto/create-gift';
import { Ok, paginatedResponse } from 'src/common/response/response.helper';
import { GiftFileValidatorPipe } from '../pipe/gift-validation.pipe';
import { ReqPayload } from 'src/common/decorators/auth-payload';
import { GiftService } from '../services/gift.service';
import type { AuthPayload } from 'src/modules/auth/types/auth';
import { GiftUpdateFileValidatorPipe } from '../pipe/gift-update-validation';
import { UpdateGiftDto, UpdateGiftFileDto } from '../dto';

@Controller('/gifts')
export class GiftController {
  constructor(private readonly giftService: GiftService) {}

  @Get('/')
  @SkipAuth()
  async getGifts(@Query() query: GetGiftsDto) {
    const result = await this.giftService.getGifts(query);
    return paginatedResponse(result.data, result.meta);
  }

  @Get('/stats')
  async getGiftStats(@ReqPayload() auth: AuthPayload) {
    if (!auth) throw new UnauthorizedException();

    const result = await this.giftService.getGiftStats(auth);
    return Ok(result);
  }

  @Post('/create')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'effect', maxCount: 1 },
        { name: 'sound', maxCount: 1 },
      ],
      {
        limits: {
          fileSize: 5 * 1024 * 1024,
          files: 3,
        },
      },
    ),
  )
  async createGift(
    @ReqPayload() auth: AuthPayload,
    @Body() body: CreateGiftDto,
    @UploadedFiles(GiftFileValidatorPipe)
    files: CreateGiftFileDto,
  ) {
    if (!auth) throw new UnauthorizedException();

    const result = await this.giftService.createGift(
      {
        name: body.name,
        price: body.price,
        duration: body.duration,
        tier: body.tier,
        shake_level: body.shake_level,
        is_active: body.is_active,
        image: files.image,
        effect: files.effect,
        sound: files.sound,
      },
      auth,
    );

    return Ok(result);
  }

  @Patch('/active')
  async updateGiftActive(
    @ReqPayload() auth: AuthPayload,
    @Body() body: ActiveGiftDto,
  ) {
    if (!auth) throw new UnauthorizedException();

    const result = await this.giftService.updateGiftActive(body, auth);

    return Ok(result);
  }

  @Get('/:giftID')
  @SkipAuth()
  async getDetailGift(@Param('giftID') giftID: string) {
    if (!giftID || giftID.length < 20 || giftID.length > 36) {
      throw new BadRequestException('Invalid Gift ID length');
    }

    const result = await this.giftService.getDetailGift(giftID);

    return Ok(result);
  }

  @Patch('/:giftID/display-settings')
  async updateGiftDisplaySettings(
    @ReqPayload() auth: AuthPayload,
    @Param('giftID') giftID: string,
    @Body() body: UpdateGiftDisplaySettingsDto,
  ) {
    if (!giftID || giftID.length < 20 || giftID.length > 36) {
      throw new BadRequestException('Invalid Gift ID length');
    }

    if (!auth) throw new UnauthorizedException();

    const result = await this.giftService.updateGiftDisplaySettings(auth, {
      ...body,
      giftID,
    });

    return Ok(result);
  }

  @Patch('/:giftID/update')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'effect', maxCount: 1 },
        { name: 'sound', maxCount: 1 },
      ],
      {
        limits: {
          fileSize: 5 * 1024 * 1024,
          files: 3,
        },
      },
    ),
  )
  async updateGift(
    @ReqPayload() auth: AuthPayload,
    @Param('giftID') giftID: string,
    @Body() body: UpdateGiftDto,
    @UploadedFiles(GiftUpdateFileValidatorPipe)
    files: UpdateGiftFileDto,
  ) {
    const isBodyEmpty = Object.keys(body).length === 0;
    const isFilesEmpty = Object.keys(files).length === 0;

    if (isBodyEmpty && isFilesEmpty) {
      throw new BadRequestException('No data provided');
    }

    if (!auth) throw new UnauthorizedException();

    const gift = await this.giftService.updateGift(auth, {
      ...body,
      giftID,
      image: files.image,
      effect: files.effect,
      sound: files.sound,
    });

    return Ok(gift);
  }

  @Delete('/:giftID')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteGift(
    @ReqPayload() auth: AuthPayload,
    @Param('giftID') giftID: string,
  ) {
    if (!giftID || giftID.length < 20 || giftID.length > 36) {
      throw new BadRequestException('Invalid Gift ID length');
    }

    if (!auth) throw new UnauthorizedException();

    await this.giftService.deleteGift(auth, giftID);

    return;
  }
}
