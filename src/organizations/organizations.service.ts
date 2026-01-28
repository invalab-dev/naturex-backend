import { BadRequestException, Injectable } from '@nestjs/common';
import { PostgresService } from '../postgres.service.js';

export class Organization {
  public id!: string;
  public name!: string;
  public type!: 'COMPANY' | 'PUBLIC' | 'NGO';
  public size!: 'SOLO' | 'SMALL' | 'MEDIUM' | 'ENTERPRISE';
  public website!: string | null;
  public status!: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

  constructor(org: {
    id: string;
    name: string;
    type: 'COMPANY' | 'PUBLIC' | 'NGO';
    size: 'SOLO' | 'SMALL' | 'MEDIUM' | 'ENTERPRISE';
    website: string | null;
    status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  }) {
    this.id = org.id;
    this.name = org.name;
    this.type = org.type;
    this.size = org.size;
    this.website = org.website;
    this.status = org.status;
  }
}

@Injectable()
export class OrganizationsService {
  constructor(private readonly pgService: PostgresService) {}

  async findOneByName(name: string): Promise<Organization | null> {
    const res = await this.pgService
      .sql`SELECT * FROM organizations WHERE name = ${name}`;
    const row = res.at(0);
    if (!row) return null;

    return new Organization(row as Organization);
  }

  async findOneById(id: string): Promise<Organization | null> {
    const res = await this.pgService
      .sql`SELECT * FROM organizations WHERE id = ${id}`;
    const row = res.at(0);
    if (!row) return null;

    return new Organization(row as Organization);
  }

  async createOne(
    org: Omit<Organization, 'id' | 'website' | 'status'> & {
      website?: string | undefined | null;
      status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' | undefined | null;
    },
  ): Promise<Organization> {
    if (await this.findOneByName(org.name)) {
      throw new BadRequestException('Organization already exists');
    }

    const sql = this.pgService.sql;

    const res = await sql`INSERT INTO organizations ${sql(org, [
      'name',
      'type',
      'size',
      ...(org.website ? ['website'] : []),
      ...(org.status ? ['status'] : []),
    ] as any[])}
    RETURNING *`;

    const row = res.at(0)!;
    return new Organization(row as Organization);
  }
}
