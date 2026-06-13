import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { ProviderTokenGuard } from '../guards/provider-token.guard';
import type { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { CredentialsDto, SignUpDto } from '../dtos/auth.dto';
import { SkipAuth } from 'src/common/decorators/auth.decorator';
import { Ok } from 'src/common/response/response.helper';
import { AUTH_COOKIE_KEYS } from 'src/common/constants/auth.constants';
import type { AccessTokenPayload, AuthPayload } from '../types/auth';
import { ReqPayload } from 'src/common/decorators/auth-payload';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/sign-in/social')
  @SkipAuth()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 300000, limit: 3 } })
  @UseGuards(ProviderTokenGuard)
  public async socialSignIn(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const payload = req.auth;
    if (!payload) {
      throw new InternalServerErrorException('Auth context not found');
    }
    const { accessToken, refreshToken, provider } =
      await this.authService.socialSignIn(payload);

    this.setAuthCookies(res, { accessToken, refreshToken, provider });

    return Ok({
      accessTokenExpiresAt: accessToken.expiresAt,
      refreshTokenExpiresAt: refreshToken.expiresAt,
      message: 'User signed in successfully',
    });
    7;
  }

  @Post('/sign-in/credentials')
  @HttpCode(HttpStatus.OK)
  @SkipAuth()
  @Throttle({ default: { ttl: 300000, limit: 3 } })
  public async credentialsSignIn(
    @Res({ passthrough: true }) res: Response,
    @Body() body: CredentialsDto,
  ) {
    const { accessToken, refreshToken, provider } =
      await this.authService.authenticateWithCredentials(body);

    this.setAuthCookies(res, { accessToken, refreshToken, provider });

    return Ok({
      accessTokenExpiresAt: accessToken.expiresAt,
      refreshTokenExpiresAt: refreshToken.expiresAt,
      message: 'User signed in successfully',
    });
  }

  @Post('/sign-up')
  @HttpCode(HttpStatus.CREATED)
  @SkipAuth()
  @Throttle({ default: { ttl: 300000, limit: 3 } })
  public async signUp(
    @Body() body: SignUpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, provider } =
      await this.authService.signUp(body);

    this.setAuthCookies(res, { accessToken, refreshToken, provider });

    return Ok({
      accessTokenExpiresAt: accessToken.expiresAt,
      refreshTokenExpiresAt: refreshToken.expiresAt,
      message: 'User created successfully',
    });
  }

  @Post('/refresh')
  @HttpCode(HttpStatus.OK)
  @SkipAuth()
  @Throttle({ default: { ttl: 300000, limit: 3 } })
  public async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshCookie =
      req.cookies[AUTH_COOKIE_KEYS.REFRESH_TOKEN] || req.body?.refreshToken;

    if (!refreshCookie) throw new UnauthorizedException();

    const { accessToken, refreshToken, provider } =
      await this.authService.refreshToken(refreshCookie);

    this.setAuthCookies(res, { accessToken, refreshToken, provider });

    return Ok({
      accessTokenExpiresAt: accessToken.expiresAt,
      refreshTokenExpiresAt: refreshToken.expiresAt,
      message: 'access and refresh tokens refreshed successfully',
    });
  }

  @Get('/status')
  @HttpCode(HttpStatus.OK)
  public async status(@ReqPayload() auth: AuthPayload) {
    if (!auth) {
      throw new UnauthorizedException();
    }

    const data: AccessTokenPayload = {
      email: auth.email,
      isVerified: auth.isVerified,
      provider: auth.provider,
      role: auth.role,
      sid: auth.sid,
      sub: auth.sub,
      name: auth.name,
      avatar: auth.avatar,
    };

    return Ok(data);
  }

  @Post('/verify-email')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 300000, limit: 3 } })
  public async verifyEmail(
    @Body() body: { token: string },
    @ReqPayload() payload: AuthPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token } = body;
    if (!token) throw new UnauthorizedException();

    if (!payload) throw new UnauthorizedException();

    const { accessToken, refreshToken, provider } =
      await this.authService.verifyAccount(payload.email, payload, token);

    this.setAuthCookies(res, { accessToken, refreshToken, provider });

    return Ok({
      accessTokenExpiresAt: accessToken.expiresAt,
      refreshTokenExpiresAt: refreshToken.expiresAt,
    });
  }

  @Post('/resend-verification-email')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 300000, limit: 3 } })
  public async resendVerificationEmail(
    @ReqPayload() payload: AuthPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!payload) throw new UnauthorizedException();

    const { remainingSeconds } =
      await this.authService.resendVerificationEmail(payload);

    return Ok({
      message: 'Verification email resent successfully',
      remainingSeconds,
    });
  }

  @Post('/logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async logout(
    @ReqPayload() auth: AuthPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!auth) throw new UnauthorizedException();

    await this.authService.logout(auth);

    res.clearCookie(AUTH_COOKIE_KEYS.ACCESS_TOKEN);
    res.clearCookie(AUTH_COOKIE_KEYS.REFRESH_TOKEN);

    return;
  }

  // ------------------------------- PRIVATE METHODS -------------------------------
  private setAuthCookies(
    res: Response,
    tokens: {
      accessToken: {
        token: string;
        expiresAt: number;
      };
      refreshToken: {
        token: string;
        expiresAt: number;
      };
      provider: string;
    },
  ) {
    const secure = process.env.NODE_ENV === 'production';

    res.cookie(AUTH_COOKIE_KEYS.ACCESS_TOKEN, tokens.accessToken.token, {
      path: '/',
      httpOnly: true,
      secure,
      sameSite: 'lax',
      expires: new Date(tokens.accessToken.expiresAt * 1000),
    });

    res.cookie(AUTH_COOKIE_KEYS.REFRESH_TOKEN, tokens.refreshToken.token, {
      path: '/',
      httpOnly: true,
      secure,
      sameSite: 'lax',
      expires: new Date(tokens.refreshToken.expiresAt * 1000),
    });
  }
}
