CREATE TABLE IF NOT EXISTS roles (
    id      uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
    code    text    NOT NULL UNIQUE
);