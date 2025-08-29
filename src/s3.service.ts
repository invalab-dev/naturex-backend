import { Injectable } from '@nestjs/common';
import {
  GetObjectCommand,
  PutObjectCommand,
  PutObjectCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';
import { firstValueFrom } from 'rxjs';
import { PostgresService } from './postgres.service';


@Injectable()
export class S3Service {
  private s3Client = new S3Client({
    endpoint: process.env.NAVER_OBJECT_STORAGE_ENDPOINT,
    region: process.env.NAVER_OBJECT_STORAGE_REGION,
    credentials: {
      "accessKeyId": process.env.NAVER_ACCESS_KEY_ID!,
      "secretAccessKey": process.env.NAVER_SECRET_KEY!
    }
  });

  constructor(private readonly postgresService: PostgresService) {}

  async putObject(fileURL: string, body: any) {
    const sql = this.postgresService.sql;
    const bucket = fileURL.split(":")[0];
    const key = fileURL.split(":")[1];

    const [{ uploadJobId }] =
      await sql`INSERT INTO upload_job(file_url) 
              VALUES(${fileURL})
              RETURNING id as uploadJobId`;
    await sql`INSERT INTO job_progress(job_name, job_id)
              VALUES(${"upload_job"}, ${uploadJobId})`;

    this.s3Client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body
    })).then(async () => {
      await sql`UPDATE job_progress
              SET progress = ${100}
              WHERE job_name = ${"upload_job"} AND job_id = ${uploadJobId}`;
    });

    return uploadJobId;
  }

  async getObject(bucketName: string, key: string): Promise<NodeJS.ReadableStream> {
    console.log(`${bucketName} 내 ${key} 다운로드`);
    const { Body } = await this.s3Client.send(new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    }));
    return Body as NodeJS.ReadableStream;
  }
}