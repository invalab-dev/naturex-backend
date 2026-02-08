import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { OrganizationsService, Organization } from './organizations.service.js';
import { UserRoles } from '../auth/guards/jwt-access.guard.js';
import { UserRole } from '../users/users.service.js';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @UserRoles(UserRole.ADMIN)
  @Get()
  async listOrganizations(): Promise<Organization[]> {
    return this.organizationsService.findMany();
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
      code: (body.orgId ?? body.code) as string,
      name: body.name as string,
      industry: (body.industry as string | undefined | null) ?? '',
      contact: (body.contact as string | undefined | null) ?? '',
      type: (body.type as Organization['type']) ?? 'COMPANY',
      size: (body.size as Organization['size']) ?? 'SMALL',
      website: (body.website as string | undefined | null) ?? null,
      status: (body.status as Organization['status'] | undefined | null) ?? 'onboarding',
    };

    return await this.organizationsService.createOne(obj);
  }

  @UserRoles(UserRole.ADMIN)
  @Patch()
  async updateOrganization(
    @Body() body: Record<string, any>,
  ): Promise<Organization> {
    const existed = await this.organizationsService.findOneById(
      body.id as string,
    );
    if (!existed) throw new NotFoundException('Organization not found');

    const obj = {
      id: body.id as string,
      name: body.name as string | undefined | null,
      type: body.type as Organization['type'] | undefined | null,
      size: body.size as Organization['size'] | undefined | null,
      industry: body.industry as string | undefined | null,
      contact: body.contact as string | undefined | null,
      website: body.website as string | undefined | null,
      status: body.status as Organization['status'] | undefined | null,
    };

    return await this.organizationsService.updateOneById(obj);
  }

  // Contract-02 slug-based endpoints (code)
  @UserRoles(UserRole.ADMIN)
  @Patch(':orgCode')
  async updateOrganizationByCode(
    @Param('orgCode') orgCode: string,
    @Body() body: Record<string, any>,
  ): Promise<Organization> {
    const existed = await this.organizationsService.findOneByCode(orgCode);
    if (!existed) throw new NotFoundException('Organization not found');

    const obj = {
      id: existed.id,
      name: body.name as string | undefined | null,
      type: body.type as Organization['type'] | undefined | null,
      size: body.size as Organization['size'] | undefined | null,
      industry: body.industry as string | undefined | null,
      contact: body.contact as string | undefined | null,
      website: body.website as string | undefined | null,
      status: body.status as Organization['status'] | undefined | null,
    };

    return await this.organizationsService.updateOneById(obj);
  }

  @UserRoles(UserRole.ADMIN)
  @Delete(':orgCode')
  async deleteOrganizationByCode(@Param('orgCode') orgCode: string) {
    const existed = await this.organizationsService.findOneByCode(orgCode);
    if (!existed) throw new NotFoundException('Organization not found');
    await this.organizationsService.deleteOne(existed.id);
    return null;
  }

  @UserRoles(UserRole.ADMIN)
  @Delete()
  async deleteOrganization(@Body() body: Record<string, any>) {
    await this.organizationsService.deleteOne(body.id as string);
  }
}
