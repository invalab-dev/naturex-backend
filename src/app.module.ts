import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ImgScaleupModule } from './img-scaleup/img-scaleup.module';

@Module({
  imports: [ImgScaleupModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
