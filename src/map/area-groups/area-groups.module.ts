import { Module } from "@nestjs/common";
import { AreaGroupsService } from './area-groups.service';
import { AreaGroupsController } from './area-groups.controller';

@Module({
  controllers: [AreaGroupsController],
  providers: [AreaGroupsService],
})
export class AreaGroupsModule {}