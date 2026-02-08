import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service.js';
import { ProjectsController } from './projects.controller.js';
import { DeliverablesService } from './deliverables/deliverables.service.js';
import { DeliverablesController } from './deliverables/deliverables.controller.js';

@Module({
  providers: [ProjectsService, DeliverablesService],
  controllers: [ProjectsController, DeliverablesController],
})
export class ProjectsModule {}
