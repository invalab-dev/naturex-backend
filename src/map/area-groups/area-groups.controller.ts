import {
  Controller, Get, Param, Query, Delete, Put, Body, UseGuards, Req
} from '@nestjs/common';
import { AreaGroupsService } from './area-groups.service.js';
import { UpsertAreaGroupsDto } from './dto/upsert-area-groups.dto.js';


@Controller('projects/:id/map/area_groups')
export class AreaGroupsController {
  constructor(private readonly areaGroupsService: AreaGroupsService) {}

  // 특정 프로젝트 AreaGroup[] Upsert (배치)
  @Put('upsert')
  async upsertAreaGroups(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpsertAreaGroupsDto,
  ) {
    const userId = req.user.id as string;
    return this.areaGroupsService.upsertAreaGroups(userId, id, dto);
  }

  // 특정 프로젝트 AreaGroup[] 조회
  @Get()
  async getAreaGroups(@Req() req, @Param('id') id: string) {
    const userId = req.user.id as string;
    return this.areaGroupsService.getAreaGroups(userId, id);
  }
}