import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req.cookies?.['access_token'],     // HttpOnly 쿠키에서 읽기
        ExtractJwt.fromAuthHeaderAsBearerToken(),            // (옵션) Bearer 호환
      ]),
      secretOrKey: process.env.JWT_SECRET!,
    });
  }
  async validate(payload: any) {
    return { id: payload.sub, username: payload.username, userRoles: payload.userRoles };
  }
}