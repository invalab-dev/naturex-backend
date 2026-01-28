import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { type Response } from 'express';
import { AuthService } from './auth.service.js';
import { Public } from './guards/jwt-access.guard.js';
import { OrganizationsService } from '../organizations/organizations.service.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly organizationsService: OrganizationsService,
  ) {}

  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post('signup')
  async signUp(@Body() signUpDTO: Record<string, any>): Promise<any> {
    const organizationName = signUpDTO.organizationName as
      | string
      | undefined
      | null;
    let organizationId: string | undefined = undefined;
    if (organizationName) {
      organizationId = (
        await this.organizationsService.findOneByName(organizationName)
      )?.name;
    }

    const obj = {
      email: signUpDTO.email as string,
      password: signUpDTO.password as string,
      roles: signUpDTO.roles as ('ADMIN' | 'USER')[] | undefined | null,
      name: signUpDTO.name as string | undefined | null,
      phoneNumber: signUpDTO.phoneNumber as string | undefined | null,
      bio: signUpDTO.bio as string | undefined | null,
      organizationId: organizationId,
      language: signUpDTO.language as string | undefined | null,
      timezone: signUpDTO.timezone as string | undefined | null,
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
    const { access_token } = await this.authService.login(
      loginDTO.email,
      loginDTO.password,
    );

    res.cookie('access_token', access_token, {
      httpOnly: true,
      sameSite: 'lax', // 포트번호만 다르면 상관x; "none" 사용시 secure: true가 필수이다.
      secure: false,
    });

    return { ok: true };
  }
}
