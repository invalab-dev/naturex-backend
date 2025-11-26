import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import {isBoolean} from "class-validator";
import {firstValueFrom, Observable} from "rxjs";

export const Public = () => SetMetadata("isPublic", true)
export const enum UserRole {
  ADMIN = 'ADMIN',
}
export const UserRoles = (...roles: UserRole[]) => SetMetadata("userRoles", roles);

@Injectable()
export class JwtAccessGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) { super(); }

  async canActivate(ctx: ExecutionContext) {

    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      ctx.getHandler(), ctx.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const can =  super.canActivate(ctx);
    if(isBoolean(can) && !can) {
      return false;
    } else if(can instanceof Promise && !(await can)) {
      return false;
    } else if(can instanceof Observable && !(await firstValueFrom(can))) {
      return false;
    }

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>("userRoles", [
       ctx.getHandler(), ctx.getClass(),
    ]);
    if(!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = ctx.switchToHttp().getRequest();
    const userRoles: UserRole[] | undefined = request.user.userRoles;
    
    if(!userRoles || userRoles!.length === 0) {
      throw new ForbiddenException("역할 정보가 없습니다.");
    }

    const hasRole = requiredRoles.some((requiredRole) => userRoles.includes(requiredRole));
    if(!hasRole) {
      throw new ForbiddenException("수행 가능한 역할이 아닙니다.");
    }

    return true;
  }

  handleRequest(err: any, user: any, info: any) {
    // strategy 호출 후, 한번 호출됨.
    if (err || !user) {
      console.log('JWT error/info =>', err, info);
      throw err || new UnauthorizedException();
    }
    return user;
  }
}