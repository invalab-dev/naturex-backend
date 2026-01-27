import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StorageService } from '../storage.service.js';
import { PostgresService } from '../postgres.service.js';
import { FileMetadata } from './uploads.type.js';

@Injectable()
export class UploadsService {
  private readonly partSizeBytes = 64 * 1024 * 1024; // 64MB
  private readonly sessionTtlMs = 6 * 60 * 60 * 1000; // 6h

  constructor(
    private readonly storageService: StorageService,
    private readonly pgService: PostgresService,
  ) {}

  async prepare(
    userId: string,
    projectId: string,
    bucket: string,
    key: string,
    fileMetadata: FileMetadata,
  ) {
    const { uploadId: multipartUploadId } =
      await this.storageService.createMultipartUpload({
        bucket: bucket,
        key: `${key}.${fileMetadata.fileExtension}`,
        metadata: { original: fileMetadata.originalFileName },
      });
    const expiresAt = new Date(Date.now() + this.sessionTtlMs);

    const res = await this.pgService.sql`
      INSERT INTO uploads(
                          original_file_name,
                          file_extension,
                          size_bytes,
                          bucket,
                          object_key,
                          status,
                          multipart_upload_id,
                          part_size_bytes,
                          expires_at,
                          uploaded_user_id,
                          uploaded_project,
                          uploaded_at)
      VALUES(${fileMetadata.originalFileName}, 
             ${fileMetadata.fileExtension},
             ${fileMetadata.sizeBytes},
             ${bucket},
             ${key},
             ${'INITIATED'},
             ${multipartUploadId},
             ${this.partSizeBytes},
             ${expiresAt},
             ${userId},
             ${projectId},
             ${Date.now()})
      RETURNING id
    `;
    const uploadId = res.at(0)!.id;

    return {
      uploadId,
      partSizeBytes: this.partSizeBytes,
      expiresAt: expiresAt.toISOString(),
    };
  }

  async signPart(uploadId: string, userId: string, partNumber: number) {
    const res = await this.pgService.sql`
      SELECT * 
      FROM uploads 
      WHERE id = ${uploadId} AND uploaded_user_id = ${userId}
    `;
    const {
      bucket,
      object_key: objectKey,
      multipart_upload_id: multipartUploadId,
      expires_at: expiresAt,
    } = res.at(0)!;

    if (new Date(expiresAt).getTime() < Date.now()) {
      this.pgService
        .sql`UPDATE uploads SET status = ${'EXPIRED'} WHERE id = ${uploadId}`;
      throw new BadRequestException('Upload session expired');
    }

    await this.pgService.sql`
      UPDATE uploads 
      SET status = ${'UPLOADING'} 
      WHERE id = ${uploadId} AND uploaded_user_id = ${userId}
    `;

    const url = await this.storageService.signUploadPartUrl({
      bucket: bucket,
      key: objectKey,
      multipartUploadId: multipartUploadId,
      partNumber: partNumber,
      expiresInSec: 60 * 15, // part URL은 짧게(15m)
    });

    return { url };
  }

  async complete(
    uploadId: string,
    userId: string,
    parts: Array<{ partNumber: number; etag: string }>,
  ) {
    const res = await this.pgService.sql`
      SELECT * FROM uploads WHERE id = ${uploadId} AND uploaded_user_id = ${userId}
    `;
    const {
      bucket,
      object_key: objectKey,
      multipart_upload_id: multipartUploadId,
    } = res.at(0)!;

    try {
      const { etag } = await this.storageService.completeMultipartUpload({
        bucket: bucket,
        key: objectKey,
        multipartUploadId: multipartUploadId,
        parts: parts.map((p) => ({ partNumber: p.partNumber, etag: p.etag })),
      });

      // 실재 확인(권장)
      await this.storageService.headObject({ bucket: bucket, key: objectKey });

      await this.pgService.sql`
        UPDATE uploads 
        SET etag = ${etag}, status = ${'UPLOADED'}
        WHERE id = ${uploadId} AND uploaded_user_id = ${userId}
      `;
      return { ok: true, etag };
    } catch (e: any) {
      await this.pgService.sql`
        UPDATE uploads 
        SET status = ${'FAILED'}, error_code = ${'COMPLETE_FAILED'}, error_message=${e?.message ?? 'unknown'} 
        WHERE id = ${uploadId} AND uploaded_user_id = ${userId}
      `;
      throw e;
    }
  }

  async abort(uploadId: string, userId: string) {
    const res = await this.pgService.sql`
      SELECT * 
      FROM uploads 
      WHERE id = ${uploadId} AND uploaded_user_id = ${userId}
    `;
    const {
      bucket,
      object_key: objectKey,
      multipart_upload_id: multipartUploadId,
    } = res.at(0)!;

    try {
      await this.storageService.abortMultipartUpload({
        bucket: bucket,
        key: objectKey,
        multipartUploadId: multipartUploadId,
      });
    } catch {}

    await this.pgService.sql`
      UPDATE uploads 
      SET status = ${'ABORTED'} 
      WHERE id = ${uploadId} AND uploaded_user_id = ${userId}
    `;

    return { ok: true };
  }
}
