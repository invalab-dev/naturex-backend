import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ImgScaleupService } from './img-scaleup.service';


@Controller("img-scaleup")
export class ImgScaleupController {
  constructor(private readonly imgScaleupService: ImgScaleupService) {}

  @Post("start")
  @HttpCode(200)
  async uploadImage(@Body("fileURL") fileURL: string) {
    return this.imgScaleupService.start(fileURL);
  }

  @Get("progress")
  async checkProgress(@Query("id") id: string) {
    return this.imgScaleupService.progress(id);
  }
}