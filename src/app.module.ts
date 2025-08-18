import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ImgScaleupModule } from './img-scaleup/img-scaleup.module';
import { GlobalModule } from './global.module';

@Module({
  imports: [ImgScaleupModule, GlobalModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
