CREATE TABLE IF NOT EXISTS area_groups (
    project_id  uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

    feature_id  uuid NOT NULL,
    name        text NOT NULL,
    visible     boolean NOT NULL DEFAULT true,

    feature     jsonb NOT NULL,                     -- Feature<Polygon, any>
    geom        geometry(Polygon, 4326),

    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now(),

    PRIMARY KEY (project_id, feature_id)
);