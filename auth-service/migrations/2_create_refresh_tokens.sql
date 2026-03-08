-- migrations/2_create_refresh_tokens.sql

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  VARCHAR(64) NOT NULL UNIQUE,  -- SHA-256 hex del token raw
    user_agent  VARCHAR(500) NOT NULL DEFAULT '',
    ip_address  VARCHAR(45)  NOT NULL DEFAULT '', -- IPv4 o IPv6
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked     BOOLEAN     NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id    ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);

-- No limpia tokens expirados automáticamente (requeriría pg_cron en producción).
-- Por ahora se maneja desde el service al hacer refresh.