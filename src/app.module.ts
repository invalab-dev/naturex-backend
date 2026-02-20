import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { GlobalModule } from './global.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ProjectsModule } from './projects/projects.module.js';
import { TransmissionsModule } from './transmissions/transmissions.module.js';
import { QueueModule } from './queue/queue.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ResourcesModule } from './resources/resources.module.js';

@Module({
  imports: [
    GlobalModule,
    AuthModule,
    ProjectsModule,
    TransmissionsModule,
    ResourcesModule,
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
