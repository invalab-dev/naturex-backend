import {
  Body,
  Controller,
  Post,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { S3Service } from '../s3.service';


@Controller()
export class ImageScaleupController {
  constructor(private s3service: S3Service) {}

  @Post("upload")
  @UseInterceptors(FilesInterceptor("files"))
  async uploadFiles(@UploadedFiles() files: Array<Express.Multer.File>, @Body() body) {
    


  }

}