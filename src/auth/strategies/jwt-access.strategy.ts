import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from '../../users/users.service.js';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request): any => req.cookies?.['access_token'], // HttpOnly 쿠키에서 읽기
        ExtractJwt.fromAuthHeaderAsBearerToken(), // (옵션) Bearer 호환
      ]),
      secretOrKey: process.env.JWT_SECRET!,
    });
  }
  async validate(payload: unknown) {
    if (typeof payload.sub === 'string') {
      const user = await this.usersService.findOneById(payload.sub);
      if (!user) throw new UnauthorizedException('User does not exist');
      return user;
    } else {
      throw new ForbiddenException();
    }
  }
}
