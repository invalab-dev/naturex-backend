import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PostgresService } from '../../postgres.service.js';
import { UpsertAreaGroupsDto } from './dto/upsert-area-groups.dto.js';

@Injectable()
export class AreaGroupsService {
  constructor(private readonly pgService: PostgresService) {}

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

  async upsertAreaGroups(userId: string, projectId: string, dto: UpsertAreaGroupsDto) {
    await this.assertProjectMembership(userId, projectId);

    if (!dto.items || dto.items.length === 0) {
      return { upserted: 0 };
    }

    await this.pgService.sql.begin(async (trx) => {
      for (const item of dto.items) {
        const geomText = JSON.stringify(item.feature?.geometry ?? null); // GeoJSON Geometry string
        await trx/*sql*/`
          INSERT INTO area_groups (
            project_id, feature_id, name, visible, feature, geom, updated_at
          )
          VALUES (
            ${projectId},
            ${item.feature_id},
            ${item.name},
            ${item.visible},
            ${trx.json(item.feature)},
            ${geomText ? trx`ST_SetSRID(ST_GeomFromGeoJSON(${geomText}), 4326)` : null},
            now()
          )
          ON CONFLICT (project_id, feature_id)
          DO UPDATE SET
            name      = EXCLUDED.name,
            visible   = EXCLUDED.visible,
            feature   = EXCLUDED.feature,
            geom      = EXCLUDED.geom,
            updated_at = now()
        `;
      }
    });

    return { ok: true, upserted: dto.items.length };
  }

  async getAreaGroups(userId: string, projectId: string) {
    await this.assertProjectMembership(userId, projectId);

    const rows = await this.pgService.sql`
      SELECT project_id, feature_id, name, visible, feature, 
             ST_AsGeoJSON(geom)::jsonb AS geom, created_at, updated_at
      FROM area_groups
      WHERE project_id = ${projectId}
      ORDER BY created_at ASC
    `;
    return rows;
  }
}