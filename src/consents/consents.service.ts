import { Injectable } from '@nestjs/common';
import { PostgresService } from '../postgres.service.js';

export class Consent {
  public userId!: string;
  public notificationEmail!: boolean;
  public notificationSns!: boolean;
  public marketingEmail!: boolean;
  public marketingSns!: boolean;

  constructor(consent: {
    userId: string;
    notificationEmail: boolean;
    notificationSns: boolean;
    marketingEmail: boolean;
    marketingSns: boolean;
  }) {
    this.userId = consent.userId;
    this.notificationEmail = consent.notificationEmail;
    this.notificationSns = consent.notificationSns;
    this.marketingEmail = consent.marketingEmail;
    this.marketingSns = consent.marketingSns;
  }
}

@Injectable()
export class ConsentsService {
  constructor(private readonly pgService: PostgresService) {}

  async findAll(): Promise<Consent[]> {
    const res = await this.pgService.sql`
      SELECT * FROM consents ORDER BY user_id ASC
    `;
    return (res as any[]).map((r) => new Consent(r));
  }

  async findOneByUserId(userId: string): Promise<Consent | null> {
    const res = await this.pgService.sql`
      SELECT * FROM consents WHERE user_id = ${userId}
    `;
    const row = res.at(0);
    if (!row) return null;
    return new Consent(row as Consent);
  }

  async upsertOne(consent: {
    userId: string;
    notificationEmail: boolean | undefined | null;
    notificationSns: boolean | undefined | null;
    marketingEmail: boolean | undefined | null;
    marketingSns: boolean | undefined | null;
  }): Promise<Consent> {
    const sanitizedConsent = {
      userId: consent.userId,
      notificationEmail: consent.notificationEmail || null,
      notificationSns: consent.notificationSns || null,
      marketingEmail: consent.marketingEmail || null,
      marketingSns: consent.marketingSns || null,
    };
    const sql = this.pgService.sql;

    const res = await sql`INSERT INTO consents ${sql(sanitizedConsent, [
      'userId',
      'notificationEmail',
      'notificationSns',
      'marketingEmail',
      'marketingSns',
    ] as any[])} ON CONFLICT(user_id) UPDATE consents ${sql(sanitizedConsent, [
      ...[sanitizedConsent.notificationEmail ? ['notificationEmail'] : []],
      ...[sanitizedConsent.notificationSns ? ['notificationSns'] : []],
      ...[sanitizedConsent.marketingEmail ? ['marketingEmail'] : []],
      ...[sanitizedConsent.marketingSns ? ['marketingSns'] : []],
    ] as any[])} RETURNING *`;

    const row = res.at(0);
    return new Consent(row as Consent);
  }
}
