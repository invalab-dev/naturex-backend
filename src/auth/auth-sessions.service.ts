import { Injectable } from '@nestjs/common';
import { PostgresService } from '../postgres.service.js';
import { undefinedToNull } from '../utils.js';

export class AuthSession {
  id!: string;
  userId!: string;
  refreshTokenHash!: string;
  expiresAt!: Date;
  revokedAt!: Date | null;
  lastUsedAt!: Date | null;
  userAgent!: string | null;
  ip!: string | null;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(session: {
    id: string;
    userId: string;
    refreshTokenHash: string;
    expiresAt: Date;
    revokedAt: Date | null;
    lastUsedAt: Date | null;
    userAgent: string | null;
    ip: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = session.id;
    this.userId = session.userId;
    this.refreshTokenHash = session.refreshTokenHash;
    this.expiresAt = session.expiresAt;
    this.revokedAt = session.revokedAt;
    this.lastUsedAt = session.lastUsedAt;
    this.userAgent = session.userAgent;
    this.ip = session.ip;
    this.createdAt = session.createdAt;
    this.updatedAt = session.updatedAt;
  }
}

@Injectable()
export class AuthSessionsService {
  constructor(private readonly pgService: PostgresService) {}

  async createOne(
    session: Pick<
      AuthSession,
      'id' | 'userId' | 'refreshTokenHash' | 'expiresAt'
    > & {
      userAgent?: string | undefined | null;
      ip?: string | undefined | null;
    },
  ): Promise<AuthSession> {
    const definedSession = undefinedToNull(session);

    const sql = this.pgService.sql;
    const res = await sql`
      INSERT INTO auth_sessions ${sql(definedSession, [
        'id',
        'userId',
        'refreshTokenHash',
        'expiresAt',
        ...[
          definedSession.userAgent
            ? ['userAgent', definedSession.userAgent]
            : [],
        ],
        ...[definedSession.ip ? ['ip', definedSession.ip] : []],
      ] as any[])}
      RETURNING *
    `;
    const row = res.at(0);
    return new AuthSession(row as AuthSession);
  }

  async findActiveById(id: string): Promise<AuthSession | null> {
    const res = await this.pgService.sql`
      SELECT * FROM auth_sessions
      WHERE id = ${id}
        AND revoked_at IS NULL
        AND expires_at > NOW()
    `;
    const row = res.at(0);
    return row ? new AuthSession(row as AuthSession) : null;
  }

  async findActiveByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<AuthSession | null> {
    const res = await this.pgService.sql`
      SELECT * FROM auth_sessions
      WHERE id = ${id}
        AND user_id = ${userId}
        AND revoked_at IS NULL
        AND expires_at > NOW()
    `;
    const row = res.at(0);
    return row ? new AuthSession(row as AuthSession) : null;
  }

  async rotateRefreshToken(
    session: Pick<AuthSession, 'id' | 'refreshTokenHash' | 'expiresAt'>,
  ): Promise<AuthSession | null> {
    const sql = this.pgService.sql;
    const res = await sql`
      UPDATE auth_sessions
      SET refresh_token_hash = ${session.refreshTokenHash},
          expires_at = ${session.expiresAt},
          last_used_at = NOW(),
          updated_at = NOW()
      WHERE id = ${session.id}
        AND revoked_at IS NULL
      RETURNING *
    `;
    const row = res.at(0);
    return row ? new AuthSession(row as AuthSession) : null;
  }

  async revoke(id: string): Promise<void> {
    await this.pgService.sql`
      UPDATE auth_sessions
      SET revoked_at = NOW(),
          updated_at = NOW()
      WHERE id = ${id}
        AND revoked_at IS NULL
    `;
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.pgService.sql`
      UPDATE auth_sessions
      SET revoked_at = NOW(),
          updated_at = NOW()
      WHERE user_id = ${userId}
        AND revoked_at IS NULL
    `;
  }
}
