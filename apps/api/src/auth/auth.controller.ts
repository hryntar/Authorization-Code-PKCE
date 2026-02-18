import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Res,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service.js';
import type { Request, Response } from 'express';
import { GoogleCallbackDto } from './dtos/google-callback.dto.js';
import { ConfigService } from '@nestjs/config';

const COOKIE_NAME = 'access_token';
const REFRESH_COOKIE_NAME = 'refresh_token';
const ACCESS_MAX_AGE_MS = 60 * 60 * 1000; // 1 minute for testing, can be increased to something like 15 minutes in production
const REFRESH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {}

  @Post('google/callback')
  async googleCallback(@Body() body: GoogleCallbackDto, @Res({ passthrough: true }) res: Response) {
    this.logger.log(`POST /auth/google/callback (PKCE: ${!!body.codeVerifier})`);

    const { user: googleUser } = await this.authService.exchangeCodeForTokens(
      body.code,
      body.codeVerifier
    );

    const dbUser = await this.authService.findOrCreateUser(googleUser);
    const jwt = this.authService.issueJwtToken(dbUser.id, dbUser.email!);
    const refreshToken = await this.authService.createRefreshToken(dbUser.id);

    const isProduction = this.configService.get('NODE_ENV') === 'production';

    res.cookie(COOKIE_NAME, jwt, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: ACCESS_MAX_AGE_MS,
    });

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: REFRESH_MAX_AGE_MS,
    });

    this.logger.log(`OAuth complete for ${dbUser.email}`);

    return {
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.realName,
        picture: googleUser.picture,
      },
    };
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (refreshToken) {
      await this.authService.revokeRefreshToken(refreshToken);
    }

    res.clearCookie(COOKIE_NAME, { path: '/' });
    res.clearCookie(REFRESH_COOKIE_NAME, { path: '/' });
    return { success: true };
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const rawToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!rawToken) {
      throw new UnauthorizedException('No refresh token');
    }

    const { accessToken, refreshToken } = await this.authService.rotateRefreshToken(rawToken);
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    res.cookie(COOKIE_NAME, accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: ACCESS_MAX_AGE_MS,
    });

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: REFRESH_MAX_AGE_MS,
    });

    return { success: true };
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getMe(@Req() req: Request) {
    return { user: req.user };
  }
}
