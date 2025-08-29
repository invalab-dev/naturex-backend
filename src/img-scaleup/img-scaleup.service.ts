import { HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { S3Service } from '../s3.service';
import { PostgresService } from '../postgres.service';
import { Readable } from 'stream';
import * as path from "node:path";


@Injectable()
export class ImgScaleupService {
  private readonly fastApiURL = process.env.FAST_API_URL!;

  constructor(private readonly httpService: HttpService,
              private readonly s3Service: S3Service,
              private readonly postgresService: PostgresService,
              ) {}

  async start(fileURL: string) {
    const sql = this.postgresService.sql;

    const filename = fileURL.split("/")[1];
    const outputPath = `img-scaleup:outputs/${filename}`;

    const [{ id }] =
      await sql`INSERT INTO img_scaleup_job(input_path, output_path)
                VALUES(${fileURL}, ${outputPath})
                RETURNING id`;
    await sql`INSERT INTO job_progress(job_name, job_id)
              VALUES(${"img_scaleup_job"}, ${id})`;

    // buffer가 아닌 stream으로 파일 보내기
    const bucket = fileURL.split(":")[0];
    const key = fileURL.split(":")[1];
    const stream = await this.s3Service.getObject(bucket, key);
    await firstValueFrom(
      this.httpService.post(
        `${this.fastApiURL}/save-file?id=${id}&filename=${fileURL.replaceAll("/", "-").replaceAll(":", "-")}`,
        stream,
        {
          headers: {
            "Content-Type": "application/octet-stream",
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      ),
    );
    await firstValueFrom(
      this.httpService.post(
        `${this.fastApiURL}/start/?id=${id}`,
      ),
    );

    return { id };
  }

  private async uploadOutput(id: string, fileURL: string) {
    const res2 = await firstValueFrom(
      this.httpService.get(`${this.fastApiURL}/download?id=${id}`, {
        "responseType": 'stream'
      }));

    const stream = res2.data as NodeJS.ReadableStream;

    const uploadJobId = await this.s3Service.putObject(fileURL, stream);

    await firstValueFrom(
      this.httpService.get(`${this.fastApiURL}/delete?id=${id}`)
    );

    return uploadJobId;
  }

  async progress(id: string) {
    const res = await firstValueFrom(
      this.httpService.get(`${this.fastApiURL}/progress?id=${id}`),
    );
    const sql = this.postgresService.sql;

    if(res.status === HttpStatus.OK) {
      console.log(`${id}'s progress: ${res.data.progress}`);

      const [{ startedTime, completedTime, inputPath, outputPath }] =
        await sql`UPDATE img_scaleup_job
                  SET started_time = ${res.data.started_time},
                      completed_time = ${res.data.completed_time}
                  WHERE id = ${id}
                  RETURNING started_time, completed_time, input_path, output_path`;
      const [{ progress }] =
        await sql`UPDATE job_progress
                  SET progress = ${res.data.progress}
                  WHERE job_name = ${"img_scaleup_job"} AND job_id = ${id}
                  RETURNING progress`;

      let outputAvailable = false;
      if(res.data.progress == 100) {
        try {
          const res2 =
            await sql`UPDATE img_scaleup_job
                      SET after_job_id = ${""}
                      WHERE id = ${id} AND after_job_id IS NULL`;
          if(res2.length > 0) {
            this.uploadOutput(id, outputPath).then(async (uploadJobId) => {
              await sql`UPDATE img_scaleup_job
                        SET after_job_id = ${uploadJobId}
                        WHERE id = ${id}`;
              outputAvailable = true;
            });
          }
        } catch(e) {
          console.log(`error: ${e}`);
        }
      }

      return {
        startedTime: startedTime,
        completedTime: completedTime,
        progress: progress,
        inputPath: inputPath,
        outputPath: outputPath,
        outputAvailable: outputAvailable,
      };
    } else {
      throw new InternalServerErrorException();
    }
  }
}