import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { GlobalModule } from './global.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ProjectsModule } from './projects/projects.module.js';
import { AreaGroupsModule } from './map/area-groups/area-groups.module.js';
import { UploadsModule } from './uploads/uploads.module.js';
import { QueueModule } from './queue/queue.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [
    GlobalModule,
    AuthModule,
    ProjectsModule,
    AreaGroupsModule,
    UploadsModule,
    // BullModule.forRoot({
    //   connection: {
    //     host: 'localhost',
    //     port: 6379,
    //   },
    // }),
    // QueueModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
