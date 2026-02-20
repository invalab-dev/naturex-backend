import { Injectable } from '@nestjs/common';
import { PostgresService } from '../postgres.service.js';

export class Resource {
  public id!: string;
  public projectId!: string;
  public uploaderId!: string;
  public originalName!: string;
  public storedName!: string;
  public fullPath!: string;
  public byteSize!: bigint;
  public extension!: string | null;
  public mimeType!: string | null;
  public isPublic: boolean;
  public isDeleted: boolean;
  public createdAt!: Date;

  constructor(
    resource: Omit<Resource, 'byteSize'> & {
      byteSize: string;
    },
  ) {
    this.id = resource.id;
    this.projectId = resource.projectId;
    this.uploaderId = resource.uploaderId;
    this.originalName = resource.originalName;
    this.storedName = resource.storedName;
    this.fullPath = resource.fullPath;
    this.byteSize = BigInt(resource.byteSize);
    this.extension = resource.extension;
    this.mimeType = resource.mimeType;
    this.isPublic = resource.isPublic;
    this.isDeleted = resource.isDeleted;
    this.createdAt = resource.createdAt;
  }
}

@Injectable()
export class ResourcesService {
  constructor(private readonly pgService: PostgresService) {}

  async findManyByProjectId(projectId: string): Promise<Resource[]> {
    const res = await this.pgService
      .sql`SELECT * FROM resources WHERE project_id = ${projectId}`;
    return res.map((r: any) => new Resource(r));
  }

  async deleteOne(resourceId: string): Promise<void> {
    await this.pgService
      .sql`UPDATE resources SET is_deleted = TRUE WHERE id = ${resourceId}`;
  }

  async setOnePublic(resourceId: string): Promise<void> {
    await this.pgService
      .sql`UPDATE resources SET is_public = TRUE WHERE id = ${resourceId}`;
  }
}
