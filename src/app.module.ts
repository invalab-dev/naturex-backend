import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GlobalModule } from './global.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { AreaGroupsModule } from './map/area-groups/area-groups.module';
import { ProjectsModule } from './projects/projects.module';

@Module({
  imports: [
    GlobalModule,
    AuthModule,
    ProjectsModule,
    AreaGroupsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
