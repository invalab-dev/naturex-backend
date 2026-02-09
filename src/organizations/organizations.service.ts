import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PostgresService } from '../postgres.service.js';

export class Organization {
  public id!: string;
  public name!: string;
  public type!: 'COMPANY' | 'PUBLIC' | 'NGO';
  public size!: 'SOLO' | 'SMALL' | 'MEDIUM' | 'ENTERPRISE';
  public contact!: string | null;
  public website!: string | null;
  public status!: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

  constructor(org: {
    id: string;
    name: string;
    type: 'COMPANY' | 'PUBLIC' | 'NGO';
    size: 'SOLO' | 'SMALL' | 'MEDIUM' | 'ENTERPRISE';
    contact: string | null;
    website: string | null;
    status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  }) {
    this.id = org.id;
    this.name = org.name;
    this.type = org.type;
    this.size = org.size;
    this.contact = org.contact;
    this.website = org.website;
    this.status = org.status;
  }
}

@Injectable()
export class OrganizationsService {
  constructor(private readonly pgService: PostgresService) {}

  async findAll(): Promise<Organization[]> {
    const res = await this.pgService.sql`SELECT * FROM organizations`;
    return res.map((row) => new Organization(row as Organization));
  }

  async count(): Promise<string> {
    const res = await this.pgService.sql`SELECT COUNT(*) FROM organizations`;
    return res.at(0).count;
  }

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
    org: Pick<Organization, 'name' | 'type' | 'size'> & {
      website?: string | undefined | null;
      status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' | undefined | null;
    },
  ): Promise<Organization> {
    const sanitizedOrg = {
      ...org,
      website: org.website ?? null,
      status: org.status ?? null,
    };

    if (await this.findOneByName(sanitizedOrg.name)) {
      throw new BadRequestException('Organization already exists');
    }

    const sql = this.pgService.sql;

    const res = await sql`INSERT INTO organizations ${sql(sanitizedOrg, [
      'name',
      'type',
      'size',
      'website',
      ...(org.status ? ['status'] : []),
    ] as any[])}
    RETURNING *`;

    const row = res.at(0)!;
    return new Organization(row as Organization);
  }

  async updateOne(
    org: Pick<Organization, 'id'> & {
      name?: string | undefined | null;
      type?: Organization['type'] | undefined | null;
      size?: Organization['size'] | undefined | null;
      website?: string | undefined | null;
      status?: Organization['status'] | undefined | null;
    },
  ): Promise<Organization> {
    const sanitizedOrg = {
      ...org,
      name: org.name ?? null,
      type: org.type ?? null,
      size: org.size ?? null,
      website: org.website ?? null,
      status: org.status ?? null,
    };
    const sql = this.pgService.sql;

    if (sanitizedOrg.name && (await this.findOneByName(sanitizedOrg.name))) {
      throw new ForbiddenException('same name already exists');
    }

    const res = await sql`UPDATE organizations SET ${sql(sanitizedOrg, [
      ...(org.name ? ['name'] : []),
      ...(org.type ? ['type'] : []),
      ...(org.size ? ['size'] : []),
      'website',
      ...(org.status ? ['status'] : []),
    ] as any[])} WHERE id = ${org.id}
  RETURNING *`;

    const row = res.at(0)!;
    return new Organization(row as Organization);
  }

  async deleteOne(id: string): Promise<void> {
    await this.pgService.sql`DELETE FROM organizations WHERE id = ${id}`;
  }
}
