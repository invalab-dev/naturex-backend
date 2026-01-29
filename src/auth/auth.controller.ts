import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { type Response } from 'express';
import { AuthService } from './auth.service.js';
import { Public, UserRoles } from './guards/jwt-access.guard.js';
import { OrganizationsService } from '../organizations/organizations.service.js';
import { UserRole } from '../users/users.service.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly organizationsService: OrganizationsService,
  ) {}

  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post('signup')
  async signUp(@Body() body: Record<string, any>): Promise<any> {
    const organizationName = body.organizationName as string | undefined | null;
    let organizationId: string | undefined = undefined;
    if (organizationName) {
      organizationId = (
        await this.organizationsService.findOneByName(organizationName)
      )?.name;
    }

    const obj = {
      email: body.email as string,
      password: body.password as string,
      roles: body.roles as UserRole[] | undefined | null,
      name: body.name as string | undefined | null,
      phoneNumber: body.phoneNumber as string | undefined | null,
      bio: body.bio as string | undefined | null,
      organizationId: organizationId,
      language: body.language as string | undefined | null,
      timezone: body.timezone as string | undefined | null,
    };

    return this.authService.signUp(obj);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() loginDTO: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, user } = await this.authService.login(
      loginDTO.email,
      loginDTO.password,
    );

    res.cookie('access_token', access_token, {
      httpOnly: true,
      sameSite: 'lax', // 포트번호만 다르면 상관x; "none" 사용시 secure: true가 필수이다.
      secure: false,
      path: '/',
    });

    return user;
  }

  @UserRoles(UserRole.ADMIN, UserRole.USER)
  @Put('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', {
      // cookie 설정 시와 같은 값
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
    });

    res.json(null);
  }
}
