CREATE TYPE QUESTION_STATUS AS ENUM('REGISTERED', 'CHECKING', 'RESPONDED', 'PENDING');
CREATE TYPE QUESTION_TYPE AS ENUM('AI', 'EMAIL');

CREATE TABLE IF NOT EXISTS questions (
    id              BIGSERIAL PRIMARY KEY,
    type            QUESTION_TYPE NOT NULL,
    status          QUESTION_STATUS,
    questioner_id   BIGINT,
    content         TEXT NOT NULL,
    responder_id    BIGINT,
    respond         TEXT,
    responded_at    TIMESTAMPTZ,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_questions_questioner FOREIGN KEY(questioner_id) REFERENCES users(id),
    CONSTRAINT fk_questions_responder  FOREIGN KEY(responder_id) REFERENCES users(id)
);