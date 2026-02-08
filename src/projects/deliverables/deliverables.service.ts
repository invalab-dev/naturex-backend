import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../postgres.service.js';

export type ProjectDeliverables = {
  projectId: string;
  maps: any[];
  downloads: any[];
  visuals: any[];
  updatedAt: string;
};

@Injectable()
export class DeliverablesService {
  constructor(private readonly pg: PostgresService) {}

  async getByProjectId(projectId: string): Promise<ProjectDeliverables> {
    const sql = this.pg.sql;

    const projRes = await sql`SELECT id, code FROM projects WHERE code = ${projectId}`;
    const proj = projRes.at(0) as any;
    if (!proj) {
      // Return empty; controller may decide 404 later.
      return {
        projectId,
        maps: [],
        downloads: [],
        visuals: [],
        updatedAt: new Date().toISOString(),
      };
    }

    const res = await sql`
      SELECT maps_json, downloads_json, visuals_json, updated_at
      FROM project_deliverables
      WHERE project_id = ${proj.id}
    `;
    const row = res.at(0) as any;

    if (!row) {
      // create empty row
      const created = await sql`
        INSERT INTO project_deliverables (project_id, maps_json, downloads_json, visuals_json)
        VALUES (${proj.id}, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb)
        RETURNING maps_json, downloads_json, visuals_json, updated_at
      `;
      const r = created.at(0) as any;
      return {
        projectId,
        maps: r.mapsJson ?? r.maps_json ?? [],
        downloads: r.downloadsJson ?? r.downloads_json ?? [],
        visuals: r.visualsJson ?? r.visuals_json ?? [],
        updatedAt: String(r.updatedAt ?? r.updated_at),
      };
    }

    return {
      projectId,
      maps: row.mapsJson ?? row.maps_json ?? [],
      downloads: row.downloadsJson ?? row.downloads_json ?? [],
      visuals: row.visualsJson ?? row.visuals_json ?? [],
      updatedAt: String(row.updatedAt ?? row.updated_at),
    };
  }

  async putByProjectId(
    projectId: string,
    input: Pick<ProjectDeliverables, 'maps' | 'downloads' | 'visuals'>,
  ): Promise<ProjectDeliverables> {
    const sql = this.pg.sql;

    const projRes = await sql`SELECT id, code FROM projects WHERE code = ${projectId}`;
    const proj = projRes.at(0) as any;
    if (!proj) {
      // No project: cannot upsert.
      return {
        projectId,
        maps: input.maps ?? [],
        downloads: input.downloads ?? [],
        visuals: input.visuals ?? [],
        updatedAt: new Date().toISOString(),
      };
    }

    const res = await sql`
      INSERT INTO project_deliverables (project_id, maps_json, downloads_json, visuals_json, updated_at)
      VALUES (
        ${proj.id},
        ${sql.json(input.maps ?? [])},
        ${sql.json(input.downloads ?? [])},
        ${sql.json(input.visuals ?? [])},
        NOW()
      )
      ON CONFLICT (project_id)
      DO UPDATE SET
        maps_json = EXCLUDED.maps_json,
        downloads_json = EXCLUDED.downloads_json,
        visuals_json = EXCLUDED.visuals_json,
        updated_at = NOW()
      RETURNING maps_json, downloads_json, visuals_json, updated_at
    `;

    const row = res.at(0) as any;
    return {
      projectId,
      maps: row.mapsJson ?? row.maps_json ?? [],
      downloads: row.downloadsJson ?? row.downloads_json ?? [],
      visuals: row.visualsJson ?? row.visuals_json ?? [],
      updatedAt: String(row.updatedAt ?? row.updated_at),
    };
  }
}
