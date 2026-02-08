-- Legacy (no code column) kept for reference
-- (table definition updated below)

CREATE TYPE ORGANIZATION_TYPE AS ENUM('COMPANY', 'PUBLIC', 'NGO');
CREATE TYPE ORGANIZATION_SIZE AS ENUM('SOLO', 'SMALL', 'MEDIUM', 'ENTERPRISE');
-- Legacy enum (kept for reference)
-- CREATE TYPE ORGANIZATION_STATUS AS ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- v2 enum aligned to FE contract-02
CREATE TYPE ORGANIZATION_STATUS AS ENUM('active', 'onboarding', 'paused', 'archived');

CREATE TABLE IF NOT EXISTS organizations (
    id          BIGSERIAL PRIMARY KEY,
    -- External identifier (slug) for FE UI stability
    code        VARCHAR(100) NOT NULL UNIQUE,
    name        VARCHAR(255) NOT NULL UNIQUE,
    type        ORGANIZATION_TYPE NOT NULL,
    size        ORGANIZATION_SIZE NOT NULL,
    industry    VARCHAR(255) NOT NULL DEFAULT '',
    contact     VARCHAR(255) NOT NULL DEFAULT '',
    website     VARCHAR(255),
    status      ORGANIZATION_STATUS NOT NULL DEFAULT 'onboarding',

    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
