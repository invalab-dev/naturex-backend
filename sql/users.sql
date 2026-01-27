CREATE TYPE USER_ROLE AS ENUM('ADMIN', 'USER'); -- 삭제할 시 DROP TYPE USER_ROLE

CREATE TABLE IF NOT EXISTS users (
    id              BIGSERIAL PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,
    role            USER_ROLE NOT NULL DEFAULT 'USER',
    name            VARCHAR(100),
    phone_number    VARCHAR(30),
    bio             TEXT,
    organization_id BIGINT,
    language        VARCHAR(10) NOT NULL DEFAULT 'kr', -- ISO 639-1
    timezone        VARCHAR(50) NOT NULL DEFAULT 'Asia/Seoul', -- region/city

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_users_organization FOREIGN KEY(organization_id) REFERENCES organizations(id)
);