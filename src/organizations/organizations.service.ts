import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PostgresService } from '../postgres.service.js';

export class Organization {
  public id!: string;
  public code!: string;
  public name!: string;
  public type!: 'COMPANY' | 'PUBLIC' | 'NGO';
  public size!: 'SOLO' | 'SMALL' | 'MEDIUM' | 'ENTERPRISE';
  public industry!: string;
  public contact!: string;
  public website!: string | null;
  public status!: 'active' | 'onboarding' | 'paused' | 'archived';

  constructor(org: {
    id: string;
    code: string;
    name: string;
    type: 'COMPANY' | 'PUBLIC' | 'NGO';
    size: 'SOLO' | 'SMALL' | 'MEDIUM' | 'ENTERPRISE';
    industry: string;
    contact: string;
    website: string | null;
    status: 'active' | 'onboarding' | 'paused' | 'archived';
  }) {
    this.id = org.id;
    this.code = (org as any).code;
    this.name = org.name;
    this.type = org.type;
    this.size = org.size;
    this.industry = (org as any).industry ?? '';
    this.contact = (org as any).contact ?? '';
    this.website = org.website;
    this.status = org.status;
  }
}

@Injectable()
export class OrganizationsService {
  constructor(private readonly pgService: PostgresService) {}

  async findMany(): Promise<Organization[]> {
    const res = await this.pgService.sql`SELECT * FROM organizations ORDER BY id DESC`;
    return res.map((r) => new Organization(r as any));
  }

  async findOneByCode(code: string): Promise<Organization | null> {
    const res = await this.pgService.sql`SELECT * FROM organizations WHERE code = ${code}`;
    const row = res.at(0);
    if (!row) return null;
    return new Organization(row as any);
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
    org: Pick<Organization, 'code' | 'name' | 'type' | 'size' | 'industry' | 'contact'> & {
      website?: string | undefined | null;
      status?: Organization['status'] | undefined | null;
    },
  ): Promise<Organization> {
    const sanitizedOrg = {
      ...org,
      industry: org.industry ?? '',
      contact: org.contact ?? '',
      website: org.website ?? null,
      status: org.status ?? null,
    };

    if (await this.findOneByName(sanitizedOrg.name)) {
      throw new BadRequestException('Organization already exists');
    }
    if (await this.findOneByCode(sanitizedOrg.code)) {
      throw new BadRequestException('Organization code already exists');
    }

    const sql = this.pgService.sql;

    const res = await sql`INSERT INTO organizations ${sql(sanitizedOrg, [
      'code',
      'name',
      'type',
      'size',
      'industry',
      'contact',
      'website',
      ...(org.status ? ['status'] : []),
    ] as any[])}
    RETURNING *`;

    const row = res.at(0)!;
    return new Organization(row as any);
  }

  async updateOneById(
    org: Pick<Organization, 'id'> & {
      name?: string | undefined | null;
      type?: Organization['type'] | undefined | null;
      size?: Organization['size'] | undefined | null;
      industry?: string | undefined | null;
      contact?: string | undefined | null;
      website?: string | undefined | null;
      status?: Organization['status'] | undefined | null;
    },
  ): Promise<Organization> {
    const sanitizedOrg = {
      ...org,
      name: org.name ?? null,
      type: org.type ?? null,
      size: org.size ?? null,
      industry: org.industry ?? null,
      contact: org.contact ?? null,
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
      ...(org.industry ? ['industry'] : []),
      ...(org.contact ? ['contact'] : []),
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
