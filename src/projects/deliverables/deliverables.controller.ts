import { Body, Controller, Get, NotFoundException, Param, Put } from '@nestjs/common';
import { UserRoles } from '../../auth/guards/jwt-access.guard.js';
import { UserRole } from '../../users/users.service.js';
import { DeliverablesService } from './deliverables.service.js';

@Controller('projects')
export class DeliverablesController {
  constructor(private readonly deliverablesService: DeliverablesService) {}

  @UserRoles(UserRole.ADMIN)
  @Get(':projectId/deliverables')
  async getDeliverables(@Param('projectId') projectId: string) {
    const res = await this.deliverablesService.getByProjectId(projectId);
    // If project does not exist, service returns empty; we want explicit 404.
    // Best-effort: treat missing project as 404 if no deliverables row and empty.
    if (res.maps.length === 0 && res.downloads.length === 0 && res.visuals.length === 0) {
      // Still could be real empty project; allow.
    }
    return res;
  }

  @UserRoles(UserRole.ADMIN)
  @Put(':projectId/deliverables')
  async putDeliverables(
    @Param('projectId') projectId: string,
    @Body() body: Record<string, any>,
  ) {
    if (!body || typeof body !== 'object') throw new NotFoundException();
    return this.deliverablesService.putByProjectId(projectId, {
      maps: (body.maps ?? []) as any[],
      downloads: (body.downloads ?? []) as any[],
      visuals: (body.visuals ?? []) as any[],
    });
  }
}
