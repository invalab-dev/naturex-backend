import { Injectable } from '@nestjs/common';
import {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class StorageService {
  private readonly s3: S3Client;

  constructor() {
    this.s3 = new S3Client({
      region: process.env.STORAGE_REGION,
      endpoint: process.env.STORAGE_ENDPOINT,
      credentials: {
        accessKeyId: process.env.STORAGE_ACCESS_KEY!,
        secretAccessKey: process.env.STORAGE_SECRET_KEY!,
      },
    });
  }

  async createMultipartUpload(params: {
    bucket: string;
    key: string;
    metadata?: Record<string, string>;
  }) {
    const res = await this.s3.send(
      new CreateMultipartUploadCommand({
        Bucket: params.bucket,
        Key: params.key,
        Metadata: params.metadata,
      }),
    );

    if (!res.UploadId) throw new Error('CreateMultipartUpload returned no UploadId');
    return { uploadId: res.UploadId };
  }

  async signUploadPartUrl(params: {
    bucket: string;
    key: string;
    multipartUploadId: string;
    partNumber: number;
    expiresInSec: number;
  }) {
    const cmd = new UploadPartCommand({
      Bucket: params.bucket,
      Key: params.key,
      UploadId: params.multipartUploadId,
      PartNumber: params.partNumber,
    });
    return getSignedUrl(this.s3, cmd, { expiresIn: params.expiresInSec });
  }

  async completeMultipartUpload(params: {
    bucket: string;
    key: string;
    multipartUploadId: string;
    parts: Array<{ partNumber: number; etag: string }>;
  }) {
    const res = await this.s3.send(
      new CompleteMultipartUploadCommand({
        Bucket: params.bucket,
        Key: params.key,
        UploadId: params.multipartUploadId,
        MultipartUpload: {
          Parts: params.parts
            .sort((a, b) => a.partNumber - b.partNumber)
            .map(p => ({ PartNumber: p.partNumber, ETag: p.etag })),
        },
      }),
    );
    return { etag: res.ETag ?? null, versionId: res.VersionId ?? null };
  }

  async abortMultipartUpload(params: { bucket: string; key: string; multipartUploadId: string }) {
    await this.s3.send(
      new AbortMultipartUploadCommand({
        Bucket: params.bucket,
        Key: params.key,
        UploadId: params.multipartUploadId,
      }),
    );
  }

  async headObject(params: { bucket: string; key: string }) {
    return this.s3.send(new HeadObjectCommand({ Bucket: params.bucket, Key: params.key }));
  }
}
