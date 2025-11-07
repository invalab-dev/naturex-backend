CREATE TABLE IF NOT EXISTS users (
    id              uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
    email           text    NOT NULL,
    password        text    NOT NULL,
    name            text    NOT NULL
);