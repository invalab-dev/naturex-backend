import { Controller, Get, Req } from '@nestjs/common';
import { AppService } from './app.service.js';
import { Public, UserRoles } from './auth/guards/jwt-access.guard.js';
import { UserRole } from './users/users.service.js';
import { PostgresService } from './postgres.service.js';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly pgService: PostgresService,
  ) {}

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

  @Public()
  @Get()
  async testPostgres() {
    const res = await this.pgService.sql`
        SELECT theme, status, COUNT(*)::int AS count
        FROM projects JOIN project_status_logs 
        ON projects.current_status_log_id = project_status_logs.id 
        GROUP BY projects.theme, project_status_logs.status`;
    return res;
  }
}
