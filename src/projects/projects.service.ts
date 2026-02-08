import { Injectable } from '@nestjs/common';
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
  status!: ProjectStatus;
  changedBy!: string;
  description!: string | undefined | null;

  constructor(statusLog: {
    id: string;
    status: ProjectStatus;
    changedBy: string;
    description: string | undefined | null;
  }) {
    this.id = statusLog.id;
    this.status = statusLog.status;
    this.changedBy = statusLog.changedBy;
    this.description = statusLog.description;
  }
}

export class Project {
  public id!: string;
  public name!: string;
  public description!: string | null;
  public location!: string | null;
  public theme!: ProjectTheme;
  public organizationId!: string | null;
  public managerId!: string | null;
  public currentStatus!: ProjectStatus;

  constructor(project: {
    id: string;
    name: string;
    description: string | null;
    location: string | null;
    theme: ProjectTheme;
    organizationId: string | null;
    managerId: string | null;
    currentStatus: ProjectStatus;
  }) {
    this.id = project.id;
    this.name = project.name;
    this.description = project.description;
    this.location = project.location;
    this.theme = project.theme;
    this.organizationId = project.organizationId;
    this.managerId = project.managerId;
    this.currentStatus = project.currentStatus;
  }
}

@Injectable()
export class ProjectsService {
  constructor(private readonly pgService: PostgresService) {}

  async findOneById(id: string): Promise<Project | null> {
    const res = await this.pgService.sql`
      SELECT p.*,
             COALESCE(psl.status, 'pending') AS current_status
      FROM projects p
      LEFT JOIN project_status_logs psl
        ON psl.id = p.current_status_log_id
      WHERE p.id = ${id}
    `;
    const row = res.at(0);
    if (!row) return null;
    return new Project(row as Project);
  }

  async findManyByOrganizationId(organizationId: string): Promise<Project[]> {
    const res = await this.pgService.sql`
      SELECT p.*,
             COALESCE(psl.status, 'pending') AS current_status
      FROM projects p
      LEFT JOIN project_status_logs psl
        ON psl.id = p.current_status_log_id
      WHERE p.organization_id = ${organizationId}
      ORDER BY p.id DESC
    `;
    return res.map((r) => new Project(r as Project));
  }

  async createOne(
    project: Pick<Project, 'name' | 'theme'> & {
      description?: string | undefined | null;
      location?: string | undefined | null;
      organizationId?: string | undefined | null;
      managerId?: string | undefined | null;
    },
    firstStatusLog: Omit<ProjectStatusLog, 'id'>,
  ): Promise<Project> {
    const sanitizedProject = {
      ...project,
      description: project.description ?? null,
      location: project.location ?? null,
      organizationId: project.organizationId ?? null,
      managerId: project.managerId ?? null,
    };
    const sql = this.pgService.sql;

    const logRes = await sql`INSERT INTO project_status_logs ${sql(
      firstStatusLog,
      [
        'status',
        'changedBy',
        ...(firstStatusLog.description ? ['description'] : []),
      ] as any[],
    )} RETURNING id`;
    const firstStatusLogId = logRes.at(0)!.id as string;

    const res = await sql`INSERT INTO projects ${sql(
      {
        ...sanitizedProject,
        currentStatusLogId: firstStatusLogId,
      },
      [
        'name',
        'description',
        'location',
        'theme',
        'organizationId',
        'managerId',
        'currentStatusLogId',
      ] as any[],
    )}
    RETURNING *`;
    const row = res.at(0)!;
    const createdProject = new Project({
      ...row,
      currentStatus: firstStatusLog.status,
    } as Project);

    await sql`UPDATE project_status_logs SET ${sql(
      {
        projectId: createdProject.id,
      },
      ['projectId'],
    )} WHERE id = ${firstStatusLogId}`;

    return createdProject;
  }

  async updateOne(
    project: Pick<Project, 'id'> & {
      name?: string | undefined | null;
      description?: string | undefined | null;
      location?: string | undefined | null;
      organizationId?: string | undefined | null;
      managerId?: string | undefined | null;
    },
    statusLog?: Omit<ProjectStatusLog, 'id'> | null,
  ): Promise<Project> {
    const sanitizedProject = {
      ...project,
      name: project.name ?? null,
      description: project.description ?? null,
      location: project.location ?? null,
      organizationId: project.organizationId ?? null,
      managerId: project.managerId ?? null,
    };
    const sql = this.pgService.sql;

    let changedStatusLogId: string | null = null;
    if (statusLog) {
      const res = await sql`INSERT INTO project_status_logs ${sql(
        {
          ...statusLog,
          projectId: sanitizedProject.id,
        },
        [
          'projectId',
          'status',
          'changedBy',
          ...(statusLog.description ? ['description'] : []),
        ] as any[],
      )} RETURNING id`;
      changedStatusLogId = res.at(0)!.id as string;
    }

    const res = await sql`UPDATE projects SET ${sql(
      {
        ...sanitizedProject,
        currentStatusLogId: changedStatusLogId,
      },
      [
        'name',
        'description',
        'location',
        'organizationId',
        'managerId',
        ...(statusLog ? ['currentStatusLogId'] : []),
      ] as any[],
    )} WHERE id = ${sanitizedProject.id}
    RETURNING *`;

    const row = res.at(0)!;
    return new Project({
      ...row,
      ...(statusLog ? { currentStatus: statusLog.status } : {}),
    } as Project);
  }

  async findStatusLogs(projectId: string): Promise<ProjectStatusLog[]> {
    const res = await this.pgService
      .sql`SELECT * FROM project_status_logs WHERE project_id = ${projectId} ORDER BY created_at DESC`;
    return res.map((r: any) => new ProjectStatusLog(r));
  }

  async deleteOne(projectId: string): Promise<void> {
    const sql = this.pgService.sql;
    await sql`DELETE FROM projects WHERE id = ${projectId}`;
  }
}
