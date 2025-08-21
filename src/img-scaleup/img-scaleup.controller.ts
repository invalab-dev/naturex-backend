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
import { S3Service } from '../s3.service';
import { ImgScaleupService } from './img-scaleup.service';


@Controller()
export class ImgScaleupController {
  constructor(private readonly imgScaleupService: ImgScaleupService) {}

  @Post("upload")
  @HttpCode(200)
  @UseInterceptors(FileInterceptor("image"))
  async uploadImage(@UploadedFile() image: Express.Multer.File) {
    return this.imgScaleupService.upload(image);
  }

  @Get("progress/:filename")
  async checkProgress(@Param("filename") filename: string) {
    return this.imgScaleupService.progress(filename);
  }
}