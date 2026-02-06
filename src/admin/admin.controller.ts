import { Controller, Get } from '@nestjs/common';
import { UserRoles } from '../auth/guards/jwt-access.guard.js';
import { UserRole } from '../users/users.service.js';
import { PostgresService } from '../postgres.service.js';

@Controller('admin')
export class AdminController {
  constructor(private readonly pg: PostgresService) {}

  @UserRoles(UserRole.ADMIN)
  @Get('stats/overview')
  async getOverview() {
    const sql = this.pg.sql;

    const [{ count: orgsCount }] = await sql`
      SELECT COUNT(*)::int AS count
      FROM organizations
    `;

    const [{ count: projectsCount }] = await sql`
      SELECT COUNT(*)::int AS count
      FROM projects
    `;

    // group by theme
    const byThemeRows = await sql`
      SELECT theme, COUNT(*)::int AS count
      FROM projects
      GROUP BY theme
    `;

    // group by current status (best-effort)
    const byStatusRows = await sql`
      SELECT COALESCE(psl.status, 'REGISTERED') AS status,
             COUNT(*)::int AS count
      FROM projects p
      LEFT JOIN project_status_logs psl
        ON psl.id = p.current_status_log_id
      GROUP BY COALESCE(psl.status, 'REGISTERED')
    `;

    const byTheme: Record<string, number> = {};
    for (const r of byThemeRows as any[]) byTheme[r.theme] = r.count;

    const byStatus: Record<string, number> = {};
    for (const r of byStatusRows as any[]) byStatus[r.status] = r.count;

    return {
      orgsCount,
      projectsCount,
      byTheme,
      byStatus,
    };
  }
}
