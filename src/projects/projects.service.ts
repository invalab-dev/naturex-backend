import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PostgresService } from '../postgres.service.js';

// Legacy types (kept for reference)
// export type ProjectTheme = '운영비 절감' | '자산 가치 향상' | '생물 다양성';
// export type ProjectStatus =
//   | 'REGISTERED'
//   | 'ANALYZING'
//   | 'PROVIDING'
//   | 'COMPLETED'
//   | 'PAUSED';

// v2 types aligned to FE contract-02
export type ProjectTheme = 'efficiency' | 'asset' | 'biodiversity';

export type ProjectStatus =
  | 'pending'
  | 'analyzing'
  | 'delivering'
  | 'executing'
  | 'completed'
  | 'paused';

export class ProjectStatusLog {
  id!: string;
  projectId!: string;
  status!: ProjectStatus;
  changedBy!: string | null;
  description!: string | undefined | null;
  createdAt!: string;

  constructor(row: any) {
    this.id = String(row.id);
    this.projectId = String(row.projectId ?? row.project_id);
    this.status = row.status as ProjectStatus;
    this.changedBy = row.changedBy ?? row.changed_by ?? null;
    this.description = row.description ?? null;
    this.createdAt = String(row.createdAt ?? row.created_at);
  }
}

// Contract-02 DTO shape expected by FE
export type ProjectContract02 = {
  projectId: string; // projects.code
  orgId: string; // organizations.code
  name: string;
  theme: ProjectTheme;
  location: string;
  description?: string | null;
  deliveryStage: ProjectStatus;
  lastActivityAt: string;
  createdAt: string;
  updatedAt?: string | null;
  resultConfig?: any;
};

@Injectable()
export class ProjectsService {
  constructor(private readonly pgService: PostgresService) {}

  async findMany(filters?: {
    orgCode?: string;
    theme?: ProjectTheme;
    stage?: ProjectStatus;
    q?: string;
  }): Promise<ProjectContract02[]> {
    const sql = this.pgService.sql;

    const where: any[] = [];
    if (filters?.orgCode) where.push(sql`o.code = ${filters.orgCode}`);
    if (filters?.theme) where.push(sql`p.theme = ${filters.theme}`);
    if (filters?.stage) where.push(sql`COALESCE(psl.status, 'pending') = ${filters.stage}`);
    if (filters?.q) {
      const like = `%${filters.q}%`;
      where.push(sql`(p.name ILIKE ${like} OR COALESCE(p.location,'') ILIKE ${like})`);
    }

    const whereSql = where.length ? sql`WHERE ${sql.join(where, sql` AND `)}` : sql``;

    const res = await sql`
      SELECT
        p.code AS project_id,
        o.code AS org_id,
        p.name,
        p.theme,
        p.location,
        p.description,
        COALESCE(psl.status, 'pending') AS delivery_stage,
        COALESCE(psl.created_at, p.created_at) AS last_activity_at,
        p.created_at,
        p.updated_at,
        p.result_config_json
      FROM projects p
      LEFT JOIN organizations o ON o.id = p.organization_id
      LEFT JOIN project_status_logs psl ON psl.id = p.current_status_log_id
      ${whereSql}
      ORDER BY p.id DESC
    `;

    return (res as any[]).map((r) => ({
      projectId: String(r.projectId ?? r.project_id),
      orgId: String(r.orgId ?? r.org_id ?? ''),
      name: r.name,
      theme: r.theme,
      location: r.location ?? '',
      description: r.description ?? null,
      deliveryStage: r.deliveryStage ?? r.delivery_stage,
      lastActivityAt: String(r.lastActivityAt ?? r.last_activity_at),
      createdAt: String(r.createdAt ?? r.created_at),
      updatedAt: String(r.updatedAt ?? r.updated_at ?? null),
      resultConfig: r.resultConfigJson ?? r.result_config_json ?? null,
    }));
  }

  async findOneByCode(code: string): Promise<ProjectContract02 | null> {
    const sql = this.pgService.sql;
    const res = await sql`
      SELECT
        p.code AS project_id,
        o.code AS org_id,
        p.name,
        p.theme,
        p.location,
        p.description,
        COALESCE(psl.status, 'pending') AS delivery_stage,
        COALESCE(psl.created_at, p.created_at) AS last_activity_at,
        p.created_at,
        p.updated_at,
        p.result_config_json
      FROM projects p
      LEFT JOIN organizations o ON o.id = p.organization_id
      LEFT JOIN project_status_logs psl ON psl.id = p.current_status_log_id
      WHERE p.code = ${code}
      LIMIT 1
    `;
    const r = (res as any[]).at(0);
    if (!r) return null;
    return {
      projectId: String(r.projectId ?? r.project_id),
      orgId: String(r.orgId ?? r.org_id ?? ''),
      name: r.name,
      theme: r.theme,
      location: r.location ?? '',
      description: r.description ?? null,
      deliveryStage: r.deliveryStage ?? r.delivery_stage,
      lastActivityAt: String(r.lastActivityAt ?? r.last_activity_at),
      createdAt: String(r.createdAt ?? r.created_at),
      updatedAt: String(r.updatedAt ?? r.updated_at ?? null),
      resultConfig: r.resultConfigJson ?? r.result_config_json ?? null,
    };
  }

  async createOneContract02(
    input: {
      code: string;
      name: string;
      description: string | null;
      location: string | null;
      theme: ProjectTheme;
      orgCode: string;
      managerId: string | null;
      resultConfig: any | null;
    },
    firstStatusLog: { status: ProjectStatus; changedBy: string | null; description: string | null },
  ): Promise<ProjectContract02> {
    const sql = this.pgService.sql;

    const orgRes = await sql`SELECT id, code FROM organizations WHERE code = ${input.orgCode}`;
    const org = (orgRes as any[]).at(0);
    if (!org) throw new BadRequestException('Organization not found');

    const existed = await sql`SELECT 1 FROM projects WHERE code = ${input.code}`;
    if ((existed as any[]).length) throw new BadRequestException('Project code already exists');

    const pRes = await sql`
      INSERT INTO projects (code, name, description, location, theme, organization_id, manager_id, current_status_log_id, result_config_json)
      VALUES (
        ${input.code},
        ${input.name},
        ${input.description},
        ${input.location},
        ${input.theme},
        ${org.id},
        ${input.managerId},
        NULL,
        ${input.resultConfig ? sql.json(input.resultConfig) : null}
      )
      RETURNING id, code, created_at, updated_at
    `;
    const p = (pRes as any[]).at(0);

    const logRes = await sql`
      INSERT INTO project_status_logs (project_id, status, changed_by, description)
      VALUES (${p.id}, ${firstStatusLog.status}, ${firstStatusLog.changedBy}, ${firstStatusLog.description})
      RETURNING id, created_at
    `;
    const log = (logRes as any[]).at(0);

    await sql`UPDATE projects SET current_status_log_id = ${log.id}, updated_at = NOW() WHERE id = ${p.id}`;

    const created = await this.findOneByCode(input.code);
    if (!created) throw new NotFoundException('Created project not found');
    return created;
  }

  async deleteOneByCode(code: string): Promise<void> {
    const sql = this.pgService.sql;
    await sql`DELETE FROM projects WHERE code = ${code}`;
  }

  async changeStatusByCode(
    projectCode: string,
    status: ProjectStatus,
    memo: string | null,
  ): Promise<ProjectContract02> {
    const sql = this.pgService.sql;

    const projRes = await sql`SELECT id, code FROM projects WHERE code = ${projectCode}`;
    const proj = (projRes as any[]).at(0);
    if (!proj) throw new NotFoundException('Project not found');

    const logRes = await sql`
      INSERT INTO project_status_logs (project_id, status, changed_by, description)
      VALUES (${proj.id}, ${status}, NULL, ${memo})
      RETURNING id
    `;
    const log = (logRes as any[]).at(0);

    await sql`UPDATE projects SET current_status_log_id = ${log.id}, updated_at = NOW() WHERE id = ${proj.id}`;

    const updated = await this.findOneByCode(projectCode);
    if (!updated) throw new NotFoundException('Project not found');
    return updated;
  }

  async findStatusLogsByCode(projectCode: string): Promise<ProjectStatusLog[]> {
    const sql = this.pgService.sql;
    const projRes = await sql`SELECT id FROM projects WHERE code = ${projectCode}`;
    const proj = (projRes as any[]).at(0);
    if (!proj) throw new NotFoundException('Project not found');

    const res = await sql`
      SELECT * FROM project_status_logs
      WHERE project_id = ${proj.id}
      ORDER BY created_at DESC
    `;
    return (res as any[]).map((r) => new ProjectStatusLog(r));
  }
}
