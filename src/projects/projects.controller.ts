import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';

import {
  Project,
  ProjectsService,
  ProjectStatus,
  ProjectTheme,
  ProjectStatusLog,
} from './projects.service.js';
import { UserRole } from '../users/users.service.js';
import { UserRoles } from '../auth/guards/jwt-access.guard.js';
import type { RequestWithUser } from '../users/users.controller.js';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // @UserRoles(UserRole.USER)
  // @Get('organization/belonging')
  // async getProjectsOfBelongingOrganization(@Req() req: ResWithUser) {
  //   const user = req.user;
  //
  //   if (!user.organizationId) {
  //     return [];
  //   }
  //
  //   return this.projectsService.findManyByOrganizationId(user.organizationId);
  // }

  @UserRoles(UserRole.ADMIN, UserRole.USER)
  @Get(':id')
  async getProjectById(@Param('id') id: string): Promise<Project> {
    const project = await this.projectsService.findOneById(id);
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  @UserRoles(UserRole.ADMIN, UserRole.USER)
  @Get(':id/status-logs')
  async getProjectStatusLogs(@Param('id') id: string): Promise<ProjectStatusLog[]> {
    return this.projectsService.findStatusLogs(id);
  }

  @UserRoles(UserRole.ADMIN, UserRole.USER)
  @Get('organization/:organizationId')
  async getProjectsByOrganization(
    @Param('organizationId') organizationId: string,
  ): Promise<Project[]> {
    return this.projectsService.findManyByOrganizationId(organizationId);
  }

  @UserRoles(UserRole.ADMIN)
  @Post()
  async createProject(
    @Req() req: RequestWithUser,
    @Body() body: Record<string, any>,
  ) {
    const obj = {
      name: body.name as string,
      description: body.description as string | undefined | null,
      location: body.location as string | undefined | null,
      theme: body.theme as ProjectTheme,
      organizationId: body.organizationId as string | undefined | null,
      managerId: body.managerId as string | undefined | null,
    };
    const statusLog = {
      status: body.status as ProjectStatus,
      changedBy: body.changedBy as string,
      description: (body.statusDescription ?? body.description) as string,
    };

    return await this.projectsService.createOne(obj, statusLog);
  }

  @UserRoles(UserRole.ADMIN)
  @Patch()
  async updateProject(
    @Req() req: RequestWithUser,
    @Body() body: Record<string, any>,
  ): Promise<Project> {
    const existed = await this.projectsService.findOneById(body.id as string);
    if (!existed) throw new NotFoundException('Project not found');

    const obj = {
      id: body.id as string,
      name: body.name as string | undefined | null,
      description: body.description as string | undefined | null,
      location: body.location as string | undefined | null,
      organizationId: body.organizationId as string | undefined | null,
      managerId: body.managerId as string | undefined | null,
    };
    const statusLog = body.status
      ? {
          status: body.status as ProjectStatus,
          changedBy: body.changedBy as string,
          description: (body.statusDescription ?? body.description) as
            | string
            | undefined
            | null,
        }
      : null;
    return await this.projectsService.updateOne(obj, statusLog);
  }

  @UserRoles(UserRole.ADMIN)
  @Delete()
  async deleteProject(@Body() body: Record<string, any>) {
    await this.projectsService.deleteOne(body.id as string);
  }
}
