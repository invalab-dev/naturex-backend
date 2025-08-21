import { HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { S3Service } from '../s3.service';
import { v4 as uuidv4 } from 'uuid';
import { PostgresService } from '../postgres.service';
import { Readable } from 'stream';

@Injectable()
export class ImgScaleupService {
  private readonly gpu_server_url = "http://10.0.2.8:81";

  constructor(private readonly httpService: HttpService,
              private readonly s3Service: S3Service,
              private readonly postgresService: PostgresService,
              ) {}

  async upload(image: Express.Multer.File) {
    const filename = `${uuidv4()}-${image.originalname}`;

    this.uploadInput(new Uint8Array(image.buffer), filename);

    const form = new FormData();
    form.append("image", new Blob([new Uint8Array(image.buffer)], { type: image.mimetype }), filename);

    const res = await firstValueFrom(
      this.httpService.post(`${this.gpu_server_url}/upload`, form),
    );

    if(res.status === HttpStatus.OK) {
      const sql = this.postgresService.sql;

      await sql`INSERT INTO image_scaleup ${sql({
                 "file_name": filename,
                 "request_time": new Date().toISOString(),
                }, "file_name", "request_time")}`;

      return { filename };
    } else {
      throw new InternalServerErrorException();
    }
  }

  private async uploadCloud(image: Uint8Array, filename: string, isInput: boolean) {
    const bucketName = "image-scaleup";
    const key = `${isInput ? "inputs" : "outputs"}/${filename}`;

    await this.s3Service.putObject(bucketName, key, new Uint8Array(image.buffer));
    const path = `${bucketName}:${filename}`;
    console.log(`${path} is saved`);

    const sql = this.postgresService.sql;
    await sql`UPDATE image_scaleup
              SET ${isInput ? "input_path" : "output_path"}
              WHERE file_name = ${filename}`;
  }

  private async uploadInput(image: Uint8Array, filename: string) {
    await this.uploadCloud(image, filename, true);
  }

  private async uploadOutput(filename: string) {
    const res = await firstValueFrom(
      this.httpService.get(`${this.gpu_server_url}/download/${filename}`, {
        "responseType": 'arraybuffer'
      }));
    if(res.status === HttpStatus.OK) {
      const image = new Uint8Array(res.data);
      await this.uploadCloud(image, filename, false);
      await firstValueFrom(
        this.httpService.get(`${this.gpu_server_url}/delete/${filename}`)
      );
    }
  }

  async progress(filename: string) {
    const res = await firstValueFrom(
      this.httpService.get(`${this.gpu_server_url}/progress/${filename}`),
    );
    const sql = this.postgresService.sql;

    if(res.status === HttpStatus.OK) {
      console.log(`${filename}'s progress: ${res.data.progress}`);

      const res1 =
        await sql`SELECT 
                    request_time, 
                    response_time,
                    input_path,
                    output_path
                  FROM image_scaleup
                  WHERE file_name = ${filename}`;

      if(res.data.progress == 100) {
        await sql`UPDATE img_scaleup_job
                  SET response_time = ${new Date().toISOString()},
                  WHERE file_name = ${filename} AND response_time IS NULL`;
      }
      if(res.data.progress == 100 && res1.at(0)!.output_path == null) {
        const res =
          await sql`UPDATE img_scaleup_job
                    SET output_path = ""
                    WHERE file_name = ${filename} AND output_path IS NULL`;

        try {
          if(res.length > 0) {
            this.uploadOutput(filename);
          }
        } catch(e) {
          await sql`UPDATE img_scaleup_job
                  SET output_path = NULL
                  WHERE file_name = ${filename}`;
        }
      }

      return {
        requestTime: res1.at(0)!.request_time,
        responseTime: res1.at(0)!.response_time,
        inputPath: res1.at(0)!.input_path,
        outputPath: res1.at(0)!.output_path,
      };
    } else {
      throw new InternalServerErrorException();
    }
  }
}