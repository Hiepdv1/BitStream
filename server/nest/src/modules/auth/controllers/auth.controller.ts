import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Query,
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
import { SkipSignature } from 'src/common/decorators';
import { AccessTokenPayload } from '../types/auth';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/sign-in/social')
  @SkipAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({ default: { ttl: 300000, limit: 3 } })
  @UseGuards(ProviderTokenGuard)
  public async socialSignIn(@Req() req: Request) {
    const auth = req.auth;
    if (!auth) {
      throw new InternalServerErrorException('Auth context not found');
    }
    await this.authService.socialSignIn(auth);

    return;
  }

  @Post('/sign-in/credentials')
  @HttpCode(HttpStatus.OK)
  @SkipAuth()
  @SkipSignature() // TODO: remove this decorator
  // @Throttle({ default: { ttl: 300000, limit: 3 } })
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
    const refresh_token_header = req.cookies[AUTH_COOKIE_KEYS.REFRESH_TOKEN];

    if (!refresh_token_header) throw new UnauthorizedException();

    const { accessToken, refreshToken, provider } =
      await this.authService.refreshToken(refresh_token_header);

    this.setAuthCookies(res, { accessToken, refreshToken, provider });

    return Ok({
      accessTokenExpiresAt: accessToken.expiresAt,
      refreshTokenExpiresAt: refreshToken.expiresAt,
      message: 'access and refresh tokens refreshed successfully',
    });
  }

  @Get('/status')
  @SkipSignature()
  @HttpCode(HttpStatus.OK)
  public async status(@Req() req: Request) {
    const auth = req.payload;
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
    };

    return Ok(data);
  }

  @Post('/verify-email')
  @HttpCode(HttpStatus.OK)
  public async verifyEmail(
    @Body() body: { token: string },
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token } = body;
    if (!token) throw new UnauthorizedException();

    const payload = req.payload;
    if (!payload) throw new UnauthorizedException();

    const { accessToken, refreshToken, provider } =
      await this.authService.verifyAccount(payload.email, payload, token);

    this.setAuthCookies(res, { accessToken, refreshToken, provider });

    return Ok({
      accessTokenExpiresAt: accessToken.expiresAt,
      refreshTokenExpiresAt: refreshToken.expiresAt,
    });
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
    res.cookie(AUTH_COOKIE_KEYS.ACCESS_TOKEN, tokens.accessToken.token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(tokens.accessToken.expiresAt * 1000),
    });

    res.cookie(AUTH_COOKIE_KEYS.REFRESH_TOKEN, tokens.refreshToken.token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(tokens.refreshToken.expiresAt * 1000),
    });

    res.cookie(
      AUTH_COOKIE_KEYS.AUTH_SESSION_EXP,
      tokens.accessToken.expiresAt,
      {
        path: '/',
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: new Date(tokens.refreshToken.expiresAt * 1000),
      },
    );

    res.cookie(AUTH_COOKIE_KEYS.AUTH_PROVIDER, tokens.provider, {
      path: '/',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(tokens.refreshToken.expiresAt * 1000),
    });
  }
}
