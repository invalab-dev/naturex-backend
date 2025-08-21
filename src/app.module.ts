import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ImgScaleupModule } from './img-scaleup/img-scaleup.module';
import { GlobalModule } from './global.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ImgScaleupModule, GlobalModule, ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: '.env',
  })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
