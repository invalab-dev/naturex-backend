CREATE TYPE USER_ROLE AS ENUM('ADMIN', 'USER'); -- 삭제할 시 DROP TYPE USER_ROLE

CREATE TABLE IF NOT EXISTS users (
    id              BIGSERIAL PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,
    role            USER_ROLE NOT NULL,
    name            VARCHAR(100),
    phone_number    VARCHAR(30),
    bio             TEXT,
    organization_id BIGINT,
    language        VARCHAR(10),
    timezone        VARCHAR(50),

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_users_organization FOREIGN KEY(organization_id) REFERENCES organizations(id)
);