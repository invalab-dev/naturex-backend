import { Module } from '@nestjs/common';
import { ImgScaleupController } from './img-scaleup.controller';
import { HttpModule } from '@nestjs/axios';
import { ImgScaleupService } from './img-scaleup.service';


@Module({
  imports: [HttpModule],
  controllers: [ImgScaleupController],
  providers: [ImgScaleupService]
})
export class ImgScaleupModule {

}