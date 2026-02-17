import { Controller, Post, Body, Get, UseGuards, Req, Res, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service.js';
import type { Request, Response } from 'express';
import { GoogleCallbackDto } from './dtos/google-callback.dto.js';
import { ConfigService } from '@nestjs/config';

const COOKIE_NAME = 'access_token';
const MAX_AGE_MS = 60 * 60 * 1000; // 1 hour

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

    const isProduction = this.configService.get('NODE_ENV') === 'production';

    res.cookie(COOKIE_NAME, jwt, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: MAX_AGE_MS,
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
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(COOKIE_NAME, { path: '/' });
    return { success: true };
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getMe(@Req() req: Request) {
    return { user: req.user };
  }
}
