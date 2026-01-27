CREATE TABLE IF NOT EXISTS consents (
    user_id             BIGINT PRIMARY KEY,
    notification_email  BOOLEAN NOT NULL DEFAULT FALSE,
    notification_sns    BOOLEAN NOT NULL DEFAULT FALSE,
    marketing_email     BOOLEAN NOT NULL DEFAULT FALSE,
    marketing_sns       BOOLEAN NOT NULL DEFAULT FALSE,

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_consent_user FOREIGN KEY(user_id) REFERENCES users(id)
);