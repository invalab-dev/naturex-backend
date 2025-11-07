import { ExecutionContext, Injectable, SetMetadata, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

export const Public = () => SetMetadata("isPublic", true)

@Injectable()
export class JwtAccessGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) { super(); }
  canActivate(ctx: ExecutionContext) {

    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      ctx.getHandler(), ctx.getClass(),
    ]);

    return isPublic ? true : super.canActivate(ctx);
  }

  handleRequest(err: any, user: any, info: any) {
    // super.canActivate(ctx)(=strategy) 호출 후, 한번 호출됨.
    if (err || !user) {
      console.log('JWT error/info =>', err, info);
      throw err || new UnauthorizedException();
    }
    return user;
  }
}