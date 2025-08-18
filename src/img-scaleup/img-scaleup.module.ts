import { Module } from '@nestjs/common';
import { ImageScaleupController } from './img-scaleup.controller';


@Module({
  controllers: [ImageScaleupController],
})
export class ImgScaleupModule {

}