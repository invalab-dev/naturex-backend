CREATE TYPE PROJECT_THEME AS ENUM('운영비 절감', '자산 가치 향상', '생물 다양성');
CREATE TYPE PROJECT_STATUS AS ENUM('REGISTERED', 'ANALYZING', 'PROVIDING', 'COMPLETED', 'PAUSED');

CREATE TABLE IF NOT EXISTS projects (
    id                      BIGSERIAL PRIMARY KEY,
    name                    VARCHAR(255) NOT NULL,
    description             TEXT,
    location                VARCHAR(255),
    theme                   PROJECT_THEME NOT NULL,
    organization_id         BIGINT,
    manager_id              BIGINT,
    current_status_log_id   BIGINT NOT NULL,

    CONSTRAINT fk_projects_organization FOREIGN KEY(organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_projects_manager      FOREIGN KEY(manager_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS project_status_logs (
    id              BIGSERIAL PRIMARY KEY,
    project_id      BIGINT,
    status          PROJECT_STATUS,
    changed_by      BIGINT,
    description     TEXT,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_project_status_logs_project FOREIGN KEY(project_id) REFERENCES projects(id),
    CONSTRAINT fk_project_status_logs_changer FOREIGN KEY(changed_by) REFERENCES users(id)
);

ALTER TABLE projects ADD CONSTRAINT fk_project_current_status FOREIGN KEY(current_status) REFERENCES project_status_logs(id);