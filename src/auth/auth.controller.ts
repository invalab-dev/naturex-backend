import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { Public, UserRoles } from './guards/jwt-access.guard.js';
import { OrganizationsService } from '../organizations/organizations.service.js';
import { UserRole } from '../users/users.service.js';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard.js';
import type { RequestWithUser } from '../users/users.controller.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly organizationsService: OrganizationsService,
  ) {}

  @UserRoles(UserRole.ADMIN, UserRole.USER)
  @Get('me')
  getMe(@Req() req: RequestWithUser) {
    return req.user;
  }

  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post('signup')
  async signUp(
    @Body() body: Record<string, any>,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
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

    const { access_token, refresh_token } = await this.authService.signUp(obj);

    res.cookie('access_token', access_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
      maxAge: Number(process.env.JWT_ACCESS_EXPIRATION),
    });

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/auth/refresh',
      maxAge: Number(process.env.JWT_ACCESS_EXPIRATION),
    });

    return null;
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() loginDTO: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const { access_token, refresh_token } = await this.authService.login(
      loginDTO.email,
      loginDTO.password,
      { userAgent: req.get('user-agent'), ip: req.ip },
    );

    res.cookie('access_token', access_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
      maxAge: Number(process.env.JWT_ACCESS_EXPIRATION),
    });

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/auth/refresh',
      maxAge: Number(process.env.JWT_ACCESS_EXPIRATION),
    });

    return null;
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { userId, sessionId } = req.user as {
      userId: string;
      sessionId: string;
    };

    const { access_token, refresh_token } = await this.authService.refresh(
      userId,
      sessionId,
    );

    res.cookie('access_token', access_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
      maxAge: Number(process.env.JWT_ACCESS_EXPIRATION),
    });

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/auth/refresh',
      maxAge: Number(process.env.JWT_ACCESS_EXPIRATION),
    });

    return null;
  }

  @UserRoles(UserRole.ADMIN, UserRole.USER)
  @Put('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const sessionId = (
      req.user as { sessionId?: string | undefined } | undefined
    )?.sessionId;

    if (sessionId) {
      await this.authService.logout(sessionId);
    }

    res.clearCookie('access_token', {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
    });

    res.clearCookie('refresh_token', {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/auth/refresh',
    });

    return null;
  }
}
