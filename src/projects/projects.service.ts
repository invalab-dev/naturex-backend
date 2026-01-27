import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { PostgresService } from '../postgres.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpsertMetaDto } from './dto/upsert-meta.dto.js';

@Injectable()
export class ProjectsService {
  constructor(private readonly pgService: PostgresService) {}

  // 프로젝트 생성 + 생성자 membership 연결
  async createProject(userId: string, dto: CreateProjectDto) {
    return this.pgService.sql.begin(async (trx) => {
      const [project] = await trx`
        INSERT INTO projects (name, created_by)
        VALUES (${dto.name}, ${userId})
        RETURNING *
      `;

      // 생성자를 멤버십에 추가 (owner/role 컬럼이 없으니 단순 연결)
      await trx`
        INSERT INTO projects_users (project_id, user_id)
        VALUES (${project.id}, ${userId})
        ON CONFLICT DO NOTHING
      `;

      return project; // { id, name, created_by }
    });
  }

  // 사용자가 프로젝트에 속해있는지 검사
  private async assertProjectMembership(userId: string, projectId: string) {
    const rows = await this.pgService.sql`
      SELECT 1
      FROM projects_users
      WHERE project_id = ${projectId} AND user_id = ${userId}
      LIMIT 1
    `;
    if (rows.length === 0) {
      throw new ForbiddenException('You do not have access to this project.');
    }
  }

  // 사용자가 가진 모든 프로젝트 (+옵션: 메타 포함)
  async getProjects(userId: string, withMeta = false) {
    if (withMeta) {
      const rows = await this.pgService.sql`
        SELECT 
          p.*,
          COALESCE(
            JSON_AGG(pm ORDER BY pm.stage),
            '[]'::json
          ) AS metadata
        FROM projects p
        JOIN projects_users pu ON pu.project_id = p.id
        LEFT JOIN project_metadata pm ON pm.project_id = p.id
        WHERE pu.user_id = ${userId}
        GROUP BY p.id
        ORDER BY p.created_by NULLS LAST, p.name ASC
      `;
      return rows;
    } else {
      const rows = await this.pgService.sql`
        SELECT p.*
        FROM projects p
        JOIN projects_users pu ON pu.project_id = p.id
        WHERE pu.user_id = ${userId}
        ORDER BY p.created_by NULLS LAST, p.name ASC
      `;
      return rows;
    }
  }

  // 사용자가 가진 특정 프로젝트 (+옵션: 메타 포함)
  async getProjectById(userId: string, projectId: string, withMeta = false) {
    await this.assertProjectMembership(userId, projectId);

    if (withMeta) {
      const rows = await this.pgService.sql`
        SELECT 
          p.*,
          COALESCE(
            JSON_AGG(pm ORDER BY pm.stage),
            '[]'::json
          ) AS metadata
        FROM projects p
        LEFT JOIN project_metadata pm ON pm.project_id = p.id
        WHERE p.id = ${projectId}
        GROUP BY p.id
        LIMIT 1
      `;
      if (rows.length === 0) throw new NotFoundException('Project not found');
      return rows[0];
    } else {
      const rows = await this.pgService.sql`
        SELECT * FROM projects WHERE id = ${projectId} LIMIT 1
      `;
      if (rows.length === 0) throw new NotFoundException('Project not found');
      return rows[0];
    }
  }

  // 사용자가 가진 특정 프로젝트 삭제
  async deleteProject(userId: string, projectId: string) {
    await this.assertProjectMembership(userId, projectId);

    await this.pgService.sql.begin(async (trx) => {
      // CASCADE로 area_groups, project_metadata, projects_users 등 연쇄 삭제
      await trx`DELETE FROM projects WHERE id = ${projectId}`;
    });

    return { ok: true };
  }

  // 특정 프로젝트 메타데이터 Upsert (stage 단위)
  async upsertProjectMeta(
    userId: string,
    projectId: string,
    dto: UpsertMetaDto,
  ) {
    await this.assertProjectMembership(userId, projectId);

    const { stage, progress = 0, input = null, output = null } = dto;

    const rows = await this.pgService.sql`
      INSERT INTO project_metadata (project_id, stage, progress, "input", "output")
      VALUES (${projectId}, ${stage}, ${progress}, 
              ${this.pgService.sql.json(input)}, 
              ${this.pgService.sql.json(output)})
      ON CONFLICT (project_id, stage)
      DO UPDATE SET 
        progress = EXCLUDED.progress,
        "input"  = EXCLUDED."input",
        "output" = EXCLUDED."output"
      RETURNING *
    `;
    return rows[0];
  }

  // 사용자가 가진 특정 프로젝트 메타 (+옵션: 메타 포함)
  async getProjectMetaById(userId: string, projectId: string) {
    await this.assertProjectMembership(userId, projectId);

    const rows = await this.pgService.sql`
      SELECT 
        pm.*
      FROM project_metadata pm
      WHERE pm.project_id = ${projectId}
    `;
    return rows[0];
  }
}
