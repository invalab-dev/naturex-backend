import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';

import { ConsentsService, Consent } from './consents.service.js';
import { UserRoles } from '../auth/guards/jwt-access.guard.js';
import { UserRole } from '../users/users.service.js';
import { type RequestWithUser } from '../users/users.controller.js';

@Controller('consents')
export class ConsentsController {
  constructor(private readonly consentsService: ConsentsService) {}

  @UserRoles(UserRole.ADMIN)
  @Get()
  async listAll(): Promise<Consent[]> {
    return await this.consentsService.findAll();
  }

  @UserRoles(UserRole.ADMIN, UserRole.USER)
  @Get('me')
  async getMe(@Req() req: RequestWithUser): Promise<Consent> {
    const consent = await this.consentsService.findOneByUserId(req.user.id);
    if (!consent) throw new NotFoundException('Consent not found');
    return consent;
  }

  @UserRoles(UserRole.ADMIN, UserRole.USER)
  @Patch('me')
  async upsertMe(
    @Req() req: RequestWithUser,
    @Body() body: Record<string, any>,
  ): Promise<Consent> {
    const obj = {
      userId: req.user.id,
      notificationEmail: body.notificationEmail as boolean | undefined | null,
      notificationSns: body.notificationSns as boolean | undefined | null,
      marketingEmail: body.marketingEmail as boolean | undefined | null,
      marketingSns: body.marketingSns as boolean | undefined | null,
    };

    return this.consentsService.upsertOne(obj);
  }

  @UserRoles(UserRole.ADMIN)
  @Get(':userId')
  async getByUserId(@Param('userId') userId: string): Promise<Consent> {
    const consent = await this.consentsService.findOneByUserId(userId);
    if (!consent) throw new NotFoundException('Consent not found');
    return consent;
  }

  @UserRoles(UserRole.ADMIN, UserRole.USER)
  @Patch(':userId')
  async upsertByUserId(
    @Param('userId') userId: string,
    @Body() body: Record<string, any>,
  ): Promise<Consent> {
    const obj = {
      userId: userId,
      notificationEmail: body.notificationEmail as boolean | undefined | null,
      notificationSns: body.notificationSns as boolean | undefined | null,
      marketingEmail: body.marketingEmail as boolean | undefined | null,
      marketingSns: body.marketingSns as boolean | undefined | null,
    };

    return this.consentsService.upsertOne(obj);
  }
}
