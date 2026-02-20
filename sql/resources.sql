CREATE TABLE IF NOT EXISTS resources (
    id                  BIGSERIAL PRIMARY KEY,
    project_id          BIGINT NOT NULL,
    uploader_id         BIGINT NOT NULL,
    original_name       VARCHAR(255) NOT NULL,
    stored_name         VARCHAR(255) NOT NULL,
    full_path           TEXT NOT NULL,
    byte_size           BIGINT NOT NULL,
    extension           VARCHAR(10),
    mime_type           VARCHAR(100),
    is_public           BOOLEAN NOT NULL DEFAULT FALSE,
    is_deleted          BOOLEAN NOT NULL DEFAULT FALSE,

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ,

    CONSTRAINT fk_resources_project  FOREIGN KEY(project_id) REFERENCES projects(id),
    CONSTRAINT fk_resources_uploader FOREIGN KEY(uploader_id) REFERENCES users(id)
);
