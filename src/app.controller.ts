import { Controller, Get, Query, Req } from '@nestjs/common';
import { AppService } from './app.service.js';
import { Public } from './auth/guards/jwt-access.guard.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get('hello')
  getHello(@Req() req: any): string {
    console.log(req.user);
    return this.appService.getHello();
  }
}
