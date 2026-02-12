import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseBoolPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { OrganizationsService, Organization } from './organizations.service.js';
import { UserRoles } from '../auth/guards/jwt-access.guard.js';
import { UserRole } from '../users/users.service.js';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @UserRoles(UserRole.ADMIN)
  @Get()
  async getOrganizations(
    @Query('organizationId')
    organizationId: string | string[] | null | undefined,
    @Query('exclude', new ParseBoolPipe({ optional: true }))
    exclude: boolean = false,
  ): Promise<Organization[]> {
    return this.organizationsService.find(organizationId, exclude);
  }

  @UserRoles(UserRole.ADMIN)
  @Get('count')
  async getOrganizationsCount(): Promise<number> {
    return await this.organizationsService.count();
  }

  @UserRoles(UserRole.ADMIN, UserRole.USER)
  @Get(':organizationId')
  async getOrganizationById(
    @Param('organizationId') organizationId: string,
  ): Promise<Organization> {
    const org = await this.organizationsService.findOneById(organizationId);
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  @UserRoles(UserRole.ADMIN)
  @Post()
  async createOrganization(
    @Body() body: Record<string, any>,
  ): Promise<Organization> {
    const obj = {
      name: body.name as string,
      type: body.type as Organization['type'],
      size: body.size as Organization['size'],
      contact: body.contact as string | undefined | null,
      website: body.website as string | undefined | null,
      status: body.status as Organization['status'] | undefined | null,
    };

    return await this.organizationsService.createOne(obj);
  }

  @UserRoles(UserRole.ADMIN)
  @Patch(':organizationId')
  async updateOrganization(
    @Param('organizationId') organizationId: string,
    @Body() body: Record<string, any>,
  ): Promise<Organization> {
    const existed = await this.organizationsService.findOneById(organizationId);
    if (!existed) throw new NotFoundException('Organization not found');

    const obj = {
      id: organizationId,
      name: body.name as string | undefined | null,
      type: body.type as Organization['type'] | undefined | null,
      size: body.size as Organization['size'] | undefined | null,
      contact: body.contact as string | undefined | null,
      website: body.website as string | undefined | null,
      status: body.status as Organization['status'] | undefined | null,
    };

    return await this.organizationsService.updateOne(obj);
  }

  @UserRoles(UserRole.ADMIN)
  @Delete(':organizationId')
  async deleteOrganization(@Param('organizationId') organizationId: string) {
    await this.organizationsService.deleteOne(organizationId);
  }
}
