import { BadRequestException, Injectable } from '@nestjs/common';
import { PostgresService } from '../postgres.service.js';
import { isArray } from 'class-validator';

export class Organization {
  public id!: string;
  public name!: string;
  public type!: 'COMPANY' | 'PUBLIC' | 'NGO';
  public size!: 'SOLO' | 'SMALL' | 'MEDIUM' | 'ENTERPRISE';
  public contact!: string | null;
  public website!: string | null;
  public status!: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  public createdAt!: Date;

  constructor(org: Organization) {
    this.id = org.id;
    this.name = org.name;
    this.type = org.type;
    this.size = org.size;
    this.contact = org.contact;
    this.website = org.website;
    this.status = org.status;
    this.createdAt = org.createdAt;
  }
}

@Injectable()
export class OrganizationsService {
  constructor(private readonly pgService: PostgresService) {}

  async find(
    organizationId: string | string[] | undefined | null,
    exclude?: boolean | null,
  ): Promise<Organization[]> {
    const predicate = organizationId
      ? isArray(organizationId)
        ? organizationId
        : [organizationId]
      : null;
    const res = await this.pgService.sql`
      SELECT * 
      FROM organizations 
        ${
          predicate
            ? this.pgService
                .sql`WHERE id ${exclude ? 'NOT' : ''} IN ${predicate}`
            : this.pgService.sql``
        }
    `;
    return res.map((row) => new Organization(row as Organization));
  }

  async count(): Promise<number> {
    const res = await this.pgService
      .sql`SELECT COUNT(*)::INT FROM organizations`;
    return res.at(0)!.count as number;
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
      type?: Organization['type'] | undefined | null;
      size?: Organization['size'] | undefined | null;
      contact?: string | undefined | null;
      website?: string | undefined | null;
      status?: Organization['status'] | undefined | null;
    },
  ): Promise<Organization> {
    const sanitizedOrg = {
      ...org,
      type: org.type ?? null,
      size: org.size ?? null,
      contact: org.contact ?? null,
      website: org.website ?? null,
      status: org.status ?? null,
    };
    const sql = this.pgService.sql;

    const res = await sql`UPDATE organizations SET ${sql(sanitizedOrg, [
      ...(org.type ? ['type'] : []),
      ...(org.size ? ['size'] : []),
      ...(org.contact ? ['contact'] : []),
      ...(org.website ? ['website'] : []),
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
