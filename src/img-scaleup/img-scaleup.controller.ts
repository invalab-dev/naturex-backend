import {
  Body,
  Controller,
  Get,
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
  @UseInterceptors(FileInterceptor("image"))
  async uploadImage(@UploadedFile() image: Express.Multer.File) {
    return this.imgScaleupService.uploadImage(image);
  }

  @Get("progress/:filename")
  async checkProgress(@Param("filename") filename: string) {
    return this.imgScaleupService.checkProgress(filename);
  }
}