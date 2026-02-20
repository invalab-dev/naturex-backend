import { Injectable } from '@nestjs/common';
import { PostgresService } from '../postgres.service.js';
import { isArray } from 'class-validator';

export enum ProjectTheme {
  EFFICIENCY = 'efficiency',
  ASSET = 'asset',
  BIODIVERSITY = 'biodiversity',
}

export enum ProjectStatus {
  PENDING = 'pending',
  ANALYZING = 'analyzing',
  DELIVERING = 'delivering',
  EXECUTING = 'executing',
  COMPLETED = 'completed',
}

export class ProjectStatusLog {
  public id!: string;
  public status!: ProjectStatus;
  public changedBy!: string;
  public description!: string | undefined | null;

  constructor(statusLog: ProjectStatusLog) {
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

  constructor(project: Project) {
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

  // TODO: pagination 구현 필요
  async findAll(): Promise<Project[]> {
    const res = (await this.pgService.sql`
          SELECT 
            row_to_json(projects) AS project, 
            row_to_json(project_status_logs) AS project_status_log
          FROM projects JOIN project_status_logs 
          ON projects.current_status_log_id = project_status_logs.id`) as {
      project: Omit<Project, 'currentStatus'>;
      projectStatusLog: { status: ProjectStatus };
    }[];
    return res.map((row) => {
      const o = {
        ...row.project,
        currentStatus: row.projectStatusLog.status,
      };
      return new Project(o);
    });
  }

  async countAll(): Promise<number> {
    const res = await this.pgService.sql`SELECT COUNT(*)::INT FROM projects`;
    return res.at(0)!.count as number;
  }

  async countGroupByThemeAndStatus(
    organizationId: string | string[] | undefined | null,
    exclude: boolean | undefined | null,
  ) {
    let res = (await this.pgService.sql`
        SELECT p.organization_id, p.theme, s.status, COUNT(*)::INT AS count 
        FROM projects AS p JOIN project_status_logs AS s
        ON p.current_status_log_id = s.id
        GROUP BY p.organization_id, p.theme, s.status`) as {
      organizationId: string;
      theme: ProjectTheme;
      status: ProjectStatus;
      count: number;
    }[];

    const result = [] as {
      organizationId: string | null;
      total: number;
      value: { theme: ProjectTheme; status: ProjectStatus; count: number }[];
    }[];
    let predicates = isArray(organizationId)
      ? organizationId
      : [organizationId ?? null];
    if (exclude) {
      res = res.filter((e) => !predicates.includes(e.organizationId));
      predicates = [null];
    }

    for (const predicate of predicates) {
      const r = res.filter((e) =>
        predicate ? e.organizationId == predicate : true,
      );
      const value = [] as {
        theme: ProjectTheme;
        status: ProjectStatus;
        count: number;
      }[];
      let total = 0;
      for (const e of r) {
        let flag = true;
        for (const v of value) {
          if (v.theme == e.theme && v.status == e.status) {
            v.count += e.count;
            flag = false;
            break;
          }
        }
        if (flag) {
          value.push({
            theme: e.theme,
            status: e.status,
            count: e.count,
          });
        }
        total += e.count;
      }
      result.push({
        organizationId: predicate,
        total: total,
        value: value,
      });
    }
    return result;
  }

  async findOneById(id: string): Promise<Project | null> {
    const res = await this.pgService
      .sql`SELECT * FROM projects WHERE id = ${id}`;
    const row = res.at(0);
    if (!row) return null;
    return new Project(row as Project);
  }

  async findManyByOrganizationId(organizationId: string): Promise<Project[]> {
    const res = await this.pgService
      .sql`SELECT * FROM projects WHERE organization_id = ${organizationId} ORDER BY id DESC`;
    return res.map((r: any) => new Project(r));
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
    )} WHERE `;

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
      const res = await sql`INSERT INTO project_status_logs SET ${sql(
        statusLog,
        [
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
    await this.pgService
      .sql`DELETE FROM projects WHERE project_id = ${projectId}`;
  }
}
