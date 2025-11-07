CREATE TABLE IF NOT EXISTS projects_users (
    project_id      uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id         uuid NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
--    role            text NOT NULL CHECK (role IN ('owner','editor','viewer')),

    PRIMARY KEY (project_id, user_id)
);