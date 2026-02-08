import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Query } from '@nestjs/common';

import { ProjectsService, ProjectStatus, ProjectTheme } from './projects.service.js';
import { UserRole } from '../users/users.service.js';
import { UserRoles } from '../auth/guards/jwt-access.guard.js';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // Contract-02: list with optional filters
  @UserRoles(UserRole.ADMIN)
  @Get()
  async listProjects(
    @Query('orgId') orgId?: string,
    @Query('theme') theme?: ProjectTheme,
    @Query('stage') stage?: ProjectStatus,
    @Query('q') q?: string,
  ) {
    return this.projectsService.findMany({
      orgCode: orgId,
      theme,
      stage,
      q,
    });
  }

  // Contract-02: project by external code
  @UserRoles(UserRole.ADMIN)
  @Get(':projectId')
  async getProjectByCode(@Param('projectId') projectId: string) {
    const project = await this.projectsService.findOneByCode(projectId);
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  // Contract-02: create project (accept orgId slug)
  @UserRoles(UserRole.ADMIN)
  @Post()
  async createProject(@Body() body: Record<string, any>) {
    return this.projectsService.createOneContract02(
      {
        code: body.projectId as string,
        name: body.name as string,
        description: (body.description as string | undefined | null) ?? null,
        location: (body.location as string | undefined | null) ?? null,
        theme: body.theme as ProjectTheme,
        orgCode: body.orgId as string,
        managerId: (body.managerId as string | undefined | null) ?? null,
        resultConfig: (body.resultConfig as any) ?? null,
      },
      {
        status: 'pending',
        changedBy: null,
        description: (body.memo as string | undefined | null) ?? null,
      },
    );
  }

  // Contract-02: delete by external code
  @UserRoles(UserRole.ADMIN)
  @Delete(':projectId')
  async deleteProject(@Param('projectId') projectId: string) {
    await this.projectsService.deleteOneByCode(projectId);
    return null;
  }

  // Contract-02: stage change endpoint
  @UserRoles(UserRole.ADMIN)
  @Post(':projectId/delivery-stage')
  async changeDeliveryStage(
    @Param('projectId') projectId: string,
    @Body() body: Record<string, any>,
  ) {
    const stage = body.stage as ProjectStatus;
    const memo = (body.memo as string | undefined | null) ?? null;
    return this.projectsService.changeStatusByCode(projectId, stage, memo);
  }
}
