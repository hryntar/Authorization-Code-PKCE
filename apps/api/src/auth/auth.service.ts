import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '@time-tracking-app/database';

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly oauthClient: OAuth2Client;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService
  ) {
    this.oauthClient = new OAuth2Client(
      this.configService.get('GOOGLE_CLIENT_ID'),
      this.configService.get('GOOGLE_CLIENT_SECRET'),
      this.configService.get('GOOGLE_REDIRECT_URI', 'http://localhost:5173/auth/callback')
    );
  }

  async exchangeCodeForTokens(
    code: string,
    codeVerifier?: string
  ): Promise<{ user: GoogleUserInfo; tokens: GoogleTokenResponse }> {
    try {
      const tokenRequestBody: Record<string, string> = {
        code,
        client_id: this.configService.get('GOOGLE_CLIENT_ID')!,
        client_secret: this.configService.get('GOOGLE_CLIENT_SECRET')!,
        redirect_uri: this.configService.get(
          'GOOGLE_REDIRECT_URI',
          'http://localhost:5173/auth/callback'
        ),
        grant_type: 'authorization_code',
      };

      if (codeVerifier) {
        tokenRequestBody.code_verifier = codeVerifier;
      }

      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(tokenRequestBody),
      });

      if (!tokenResponse.ok) {
        const errorBody = await tokenResponse.text();
        this.logger.error(`Token exchange failed: ${tokenResponse.status} — ${errorBody}`);
        throw new UnauthorizedException(`Google token exchange failed: ${errorBody}`);
      }

      const tokens = (await tokenResponse.json()) as GoogleTokenResponse;
      this.logger.log('Tokens received from Google', tokens);

      const ticket = await this.oauthClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: this.configService.get('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Invalid ID token');
      }

      const user: GoogleUserInfo = {
        sub: payload.sub!,
        email: payload.email!,
        email_verified: payload.email_verified!,
        name: payload.name!,
        picture: payload.picture!,
        given_name: payload.given_name!,
        family_name: payload.family_name!,
      };

      this.logger.log(`ID token verified for ${user.email}`);
      return { user, tokens };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      this.logger.error(`Token exchange error: ${(error as Error).message}`);
      throw new UnauthorizedException('Failed to exchange authorization code');
    }
  }

  async findOrCreateUser(googleUser: GoogleUserInfo) {
    let user = await this.prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    if (user) {
      this.logger.log(`Existing user: ${user.email}`);
    } else {
      user = await this.prisma.user.create({
        data: {
          email: googleUser.email,
          realName: googleUser.name,
          username: googleUser.email.split('@')[0],
          status: 'ACTIVE',
          workFormat: 'FULL_TIME',
        },
      });
      this.logger.log(`New user created: ${user.email}`);
    }

    return user;
  }

  issueJwtToken(userId: string, email: string) {
    const payload = { sub: userId, email };
    const token = this.jwtService.sign(payload);
    this.logger.log(`JWT issued for ${email}`);
    return token;
  }

  async validateJwtPayload(payload: { sub: string; email: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
