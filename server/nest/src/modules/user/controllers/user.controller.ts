import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Patch,
  Req,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { Ok } from 'src/common/response/response.helper';

import { ReqPayload } from 'src/common/decorators/auth-payload';
import type { AuthPayload } from 'src/modules/auth/types/auth';
import { AuthService } from 'src/modules/auth/services/auth.service';
import {
  ChangePasswordDto,
  SetupPasswordDto,
  UnlinkSocialAccountDto,
  UpdateAvatarDto,
  UpdateProfileDto,
} from '../dtos/user.dto';
import { ProviderTokenGuard } from 'src/modules/auth/guards/provider-token.guard';
import type { Request } from 'express';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ThumbnailUserPipe } from '../pipe/thumbnail-user.pipe';
// import { SkipThrottle } from '@nestjs/throttler';
// import { Throttle } from '@nestjs/throttler';

@Controller('/user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Get('/')
  // @Throttle({ default: { ttl: 6000, limit: 3 } })
  // @SkipThrottle()
  @HttpCode(200)
  public GetStreaming() {
    return Ok('Welcome streming services');
  }

  @Get('/me')
  @HttpCode(HttpStatus.OK)
  public async me(@ReqPayload() payload: AuthPayload) {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException();
    }
    const { profileImages, ...rest } = await this.userService.getUserById(
      payload.sub,
    );
    return Ok({
      ...rest,
      avatarUrl: profileImages?.[0]?.storageKey || '',
    });
  }

  @Patch('/me')
  @HttpCode(HttpStatus.OK)
  public async updateProfile(
    @ReqPayload() payload: AuthPayload,
    @Body() data: UpdateProfileDto,
  ) {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException();
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('No data provided');
    }

    const updatedUser = await this.userService.updateProfile(payload.sub, data);
    return Ok(updatedUser, 'Profile updated successfully');
  }

  @Post('/me/setup-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async setupPassword(
    @ReqPayload() auth: AuthPayload,
    @Body() data: SetupPasswordDto,
  ) {
    await this.authService.setupPassword(auth, data.password);
  }

  @Post('/me/link-account')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ProviderTokenGuard)
  public async linkAccount(
    @ReqPayload() auth: AuthPayload,
    @Req() req: Request,
  ) {
    const socialData = req.auth;

    if (!socialData) {
      throw new UnauthorizedException();
    }

    const acc = await this.authService.linkSocialAccount(auth, socialData);

    return Ok(acc, 'Account linked successfully');
  }

  @Post('/me/unlink-account')
  @HttpCode(HttpStatus.OK)
  public async unlinkAccount(
    @ReqPayload() auth: AuthPayload,
    @Body() { provider }: UnlinkSocialAccountDto,
  ) {
    const account = await this.authService.unlinkSocialAccount(auth, provider);
    return Ok(account, 'Account unlinked successfully');
  }

  @Post('/me/change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async changePassword(
    @ReqPayload() auth: AuthPayload,
    @Body() data: ChangePasswordDto,
  ) {
    await this.authService.updatePassword(auth, data);
    return;
  }

  @Get('/me/extensions')
  @HttpCode(HttpStatus.OK)
  public async getExtensions(@ReqPayload() payload: AuthPayload) {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException();
    }
    const extensions = await this.userService.getExtensions(payload.sub);
    return Ok(extensions);
  }

  @Patch('/me/avatar')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'thumbnail', maxCount: 1 }], {
      limits: {
        fileSize: 1 * 1024 * 1024,
        files: 1,
      },
    }),
  )
  public async updateAvatar(
    @ReqPayload() auth: AuthPayload,
    @UploadedFiles(ThumbnailUserPipe) data: UpdateAvatarDto,
  ) {
    const { storageKey, mimeType } = await this.userService.updateAvatar(
      auth,
      data.thumbnail,
    );

    return Ok(
      {
        avatarUrl: storageKey,
        mimeType,
      },
      'Avatar updated successfully',
    );
  }
}
