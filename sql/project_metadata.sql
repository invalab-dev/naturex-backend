CREATE TABLE IF NOT EXISTS project_metadata (
    stage           text NOT NULL,
    progress        smallint NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
    "input"         json,
    "output"        json,

    project_id      uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    PRIMARY KEY(project_id, stage)
);