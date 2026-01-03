import { Module } from "@nestjs/common";
import { AreaGroupsController } from './area-groups.controller.js';
import { AreaGroupsService } from './area-groups.service.js';

@Module({
  controllers: [AreaGroupsController],
  providers: [AreaGroupsService],
})
export class AreaGroupsModule {}