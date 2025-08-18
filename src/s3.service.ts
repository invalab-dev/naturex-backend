import { Injectable } from '@nestjs/common';
import {
  GetObjectCommand,
  PutObjectCommand,
  PutObjectCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';


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

  async putObject(bucketName: string, key: string, body: any) {
    await this.s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body
    }));
  }

  async getObject(bucketName: string, key: string): Promise<any> {
    const { Body } = await this.s3Client.send(new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    }));
    return Body;
  }
}