CREATE TABLE IF NOT EXISTS projects (
    id              uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
    name            text NOT NULL,

    created_at  timestamptz NOT NULL DEFAULT now(),
    created_by      uuid REFERENCES users(id) ON DELETE SET NULL
);