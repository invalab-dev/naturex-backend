import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole, UsersService } from '../users/users.service.js';
import { AuthSessionsService } from './auth-sessions.service.js';
import { randomUUID } from 'crypto';
import { hashToken2Hex } from '../utils.js';
import * as process from 'node:process';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authSessionsService: AuthSessionsService,
    private readonly usersService: UsersService,
  ) {}

  private async signAccessToken(user: User, sessionId: string) {
    const payload = {
      sub: String(user.id),
      userRoles: user.roles,
      sid: sessionId,
      typ: 'access' as const,
    };
    return this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: Number(process.env.JWT_ACCESS_EXPIRATION),
    });
  }

  private async signRefreshToken(user: User, sessionId: string) {
    const payload = {
      sub: String(user.id),
      sid: sessionId,
      typ: 'refresh' as const,
      jti: randomUUID(),
    };
    return this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: Number(process.env.JWT_REFRESH_EXPIRATION),
    });
  }

  async signUp(
    userDTO: Pick<User, 'email' | 'password'> & {
      roles?: UserRole[] | undefined | null;
      name?: string | undefined | null;
      phoneNumber?: string | undefined | null;
      bio?: string | undefined | null;
      organizationId?: string | undefined | null;
      language?: string | undefined | null;
      timezone?: string | undefined | null;
    },
  ): Promise<{
    access_token: string;
    refresh_token: string;
    user: Omit<User, 'password'>;
  }> {
    const user = await this.usersService.createOne(userDTO);

    const sessionId = randomUUID();
    const refreshToken = await this.signRefreshToken(user, sessionId);
    const refreshHash = hashToken2Hex(refreshToken);

    await this.authSessionsService.createOne({
      id: sessionId,
      userId: String(user.id),
      refreshTokenHash: refreshHash,
      expiresAt: new Date(
        Date.now() + Number(process.env.JWT_REFRESH_EXPIRATION),
      ),
      userAgent: null,
      ip: null,
    });

    const accessToken = await this.signAccessToken(user, sessionId);
    const { password: _, ...insensitiveUser } = user;

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: insensitiveUser,
    };
  }

  async login(
    email: string,
    password: string,
    meta?: { userAgent?: string | null; ip?: string | null } | null,
  ): Promise<{
    access_token: string;
    refresh_token: string;
    user: Omit<User, 'password'>;
  }> {
    const user = await this.usersService.findOneByEmail(email);

    if (!user || user?.password !== password) {
      throw new UnauthorizedException();
    }

    const sessionId = randomUUID();
    const refreshToken = await this.signRefreshToken(user, sessionId);
    const refreshHash = hashToken2Hex(refreshToken);

    await this.authSessionsService.createOne({
      id: sessionId,
      userId: String(user.id),
      refreshTokenHash: refreshHash,
      expiresAt: new Date(
        Date.now() + Number(process.env.JWT_REFRESH_EXPIRATION),
      ),
      userAgent: meta?.userAgent ?? null,
      ip: meta?.ip ?? null,
    });

    const accessToken = await this.signAccessToken(user, sessionId);

    const { password: _, ...insensitiveUser } = user;
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: insensitiveUser,
    };
  }

  async refresh(
    userId: string,
    sessionId: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.usersService.findOneById(userId);
    if (!user) throw new UnauthorizedException();

    const session = await this.authSessionsService.findActiveByIdAndUserId(sessionId, userId);
    if (!session) throw new UnauthorizedException();

    const newRefreshToken = await this.signRefreshToken(user, sessionId);
    const newRefreshHash = hashToken2Hex(newRefreshToken);

    const rotated = await this.authSessionsService.rotateRefreshToken({
      id: sessionId,
      refreshTokenHash: newRefreshHash,
      expiresAt: new Date(
        Date.now() + Number(process.env.JWT_REFRESH_EXPIRATION),
      ),
    });
    if (!rotated) throw new UnauthorizedException();

    const newAccessToken = await this.signAccessToken(user, sessionId);

    return { access_token: newAccessToken, refresh_token: newRefreshToken };
  }

  async logout(sessionId: string) {
    await this.authSessionsService.revoke(sessionId);
  }
}
