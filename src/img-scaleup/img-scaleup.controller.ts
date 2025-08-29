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
  async uploadImage(@Body("file_url") fileURL: string) {
    return this.imgScaleupService.start(fileURL);
  }

  @Get("progress/:id")
  async checkProgress(@Param("id") id: string) {
    return this.imgScaleupService.progress(id);
  }
}