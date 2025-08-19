import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import FormData from 'form-data';


@Injectable()
export class ImgScaleupService {
  private readonly baseUrl = "http://10.0.2.8:81";

  constructor(private readonly httpService: HttpService) {}

  async uploadImage(image: Express.Multer.File) {
    const form = new FormData();
    form.append("image", image.buffer);

    const { data } = await firstValueFrom(
      this.httpService.post(`${this.baseUrl}/upload`, form),
    );
    return data;
  }

  async checkProgress(filename: string) {
    const { data } = await firstValueFrom(
      this.httpService.get(`${this.baseUrl}/progress/${filename}`),
    );
    return data;
  }
}