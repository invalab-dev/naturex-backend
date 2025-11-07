import { Controller, Get, Req } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("hello")
  getHello(@Req() req: any): string {
    console.log(req.user);
    return this.appService.getHello();
  }
}
