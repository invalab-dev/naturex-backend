import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { GetProjectsQuery } from './dto/get-projects.query';
import { UpsertMetaDto } from './dto/upsert-meta.dto';
import { CreateProjectDto } from './dto/create-project.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // 프로젝트 생성하기
  @Post()
  async createProject(@Req() req, @Body() dto: CreateProjectDto) {
    const userId = req.user.id as string;
    return this.projectsService.createProject(userId, dto);
  }

  // 모든 프로젝트 (withMeta=true면 메타 포함)
  @Get()
  async getProjects(@Req() req, @Query() query: GetProjectsQuery) {
    const userId = req.user.id as string;
    return this.projectsService.getProjects(userId, query.withMeta);
  }

  // 특정 프로젝트 (withMeta)
  @Get(':id')
  async getMyProjectById(
    @Req() req,
    @Param('id') id: string,
    @Query() query: GetProjectsQuery,
  ) {
    const userId = req.user.id as string;
    return this.projectsService.getProjectById(userId, id, query.withMeta);
  }

  // 특정 프로젝트 삭제
  @Delete(':id')
  async deleteProject(@Req() req, @Param('id') id: string) {
    const userId = req.user.id as string;
    return this.projectsService.deleteProject(userId, id);
  }

  // 특정 프로젝트 메타 Upsert (stage 단위)
  @Put(':id/meta/upsert')
  async upsertProjectMeta(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpsertMetaDto,
  ) {
    const userId = req.user.id as string;
    return this.projectsService.upsertProjectMeta(userId, id, dto);
  }

  // 특정 프로젝트 메타
  @Get(':id/meta')
  async getProjectMeta(@Req() req, @Param('id') id: string) {
    const userId = req.user.id as string;
    return this.projectsService.getProjectMetaById(userId, id);
  }
}