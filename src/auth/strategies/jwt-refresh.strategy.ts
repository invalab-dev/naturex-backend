import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { isObject } from 'class-validator';
import { timingSafeEqual } from 'crypto';
import { AuthSessionsService } from '../auth-sessions.service.js';
import { hashTokenToHex } from '../../utils.js';

type RefreshPayload = {
  sub: string;
  sid: string;
  typ: 'refresh';
  jti?: string;
};

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly sessionsService: AuthSessionsService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request): any => req.cookies?.['refresh_token'],
      ]),
      secretOrKey: process.env.JWT_REFRESH_SECRET!,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: unknown) {
    if (
      !isObject(payload) ||
      !Object.hasOwn(payload, 'sub') ||
      !Object.hasOwn(payload, 'sid') ||
      !Object.hasOwn(payload, 'typ')
    ) {
      throw new ForbiddenException();
    }

    const { sub, sid, typ } = payload as RefreshPayload;
    if (typ !== 'refresh') {
      throw new ForbiddenException();
    }

    const raw = req.cookies?.['refresh_token'];
    if (!raw || typeof raw !== 'string') {
      throw new UnauthorizedException();
    }
    const hashHex = hashTokenToHex(raw);
    const session = await this.sessionsService.findActiveByIdAndUserId(
      String(sid),
      String(sub),
    );
    if (!session) {
      throw new UnauthorizedException();
    }

    const a = Buffer.from(session.refreshTokenHash, 'hex');
    const b = Buffer.from(hashHex, 'hex');
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new UnauthorizedException();
    }

    return { userId: String(sub), sessionId: String(sid) };
  }
}
