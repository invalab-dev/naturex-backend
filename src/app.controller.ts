import { Controller, Get, Req } from '@nestjs/common';
import { AppService } from './app.service.js';
import { Public, UserRoles } from './auth/guards/jwt-access.guard.js';
import { UserRole } from './users/users.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get('hello')
  getHello(@Req() req: any): string {
    console.log(req.user);
    return this.appService.getHello();
  }

  @UserRoles(UserRole.USER)
  @Get('userHello')
  getUserHello(@Req() req: any): string {
    return 'Hello User';
  }
}
