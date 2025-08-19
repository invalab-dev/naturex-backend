import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';


@Injectable()
export class ImgScaleupService {
  private readonly host = "10.0.2.8:81";

  constructor(private readonly httpService: HttpService) {}

  async uploadImage(image: Express.Multer.File) {
    const { data } = await firstValueFrom(
      this.httpService.post(`${this.host}/upload`, image),
    );
    return data;
  }

  async checkProgress(filename: string) {
    const { data } = await firstValueFrom(
      this.httpService.get(`${this.host}/progress/${filename}`),
    );
    return data;
  }
}