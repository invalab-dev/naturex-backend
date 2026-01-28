import { BadRequestException, Injectable } from '@nestjs/common';
import { PostgresService } from '../postgres.service.js';

export class User {
  public id!: string;
  public email!: string;
  public password!: string;
  public roles!: ('ADMIN' | 'USER')[];
  public name!: string | null;
  public phoneNumber!: string | null;
  public bio!: string | null;
  public organizationId!: string | null;
  public language!: string;
  public timezone!: string;

  constructor(user: {
    id: string;
    email: string;
    password: string;
    roles: ('ADMIN' | 'USER')[];
    name: string | null;
    phoneNumber: string | null;
    bio: string | null;
    organizationId: string | null;
    language: string;
    timezone: string;
  }) {
    Object.assign(this, user);
  }
}

@Injectable()
export class UsersService {
  constructor(private readonly pgService: PostgresService) {}

  async findOneByEmail(email: string): Promise<User | null> {
    const res = await this.pgService
      .sql`SELECT * FROM users WHERE email = ${email}`;
    const row = res.at(0);
    if (!row) {
      return null;
    }

    return new User(row as User);
  }

  async findOneById(id: string): Promise<User | null> {
    const res = await this.pgService.sql`SELECT * FROM users WHERE id = ${id}`;
    const row = res.at(0);
    if (!row) {
      return null;
    }

    return new User(row as User);
  }

  async createOne(
    user: Omit<
      User,
      | 'id'
      | 'roles'
      | 'name'
      | 'phoneNumber'
      | 'bio'
      | 'organizationId'
      | 'language'
      | 'timezone'
    > & {
      roles?: ('ADMIN' | 'USER')[] | undefined | null;
      name?: string | undefined | null;
      phoneNumber?: string | undefined | null;
      bio?: string | undefined | null;
      organizationId?: string | undefined | null;
      language?: string | undefined | null;
      timezone?: string | undefined | null;
    },
  ): Promise<User> {
    if (await this.findOneByEmail(user.email)) {
      throw new BadRequestException('User already exists');
    }
    const sql = this.pgService.sql;

    const res = await sql`INSERT INTO users ${sql(user, [
      ...(user.email ? ['email'] : []),
      ...(user.password ? ['password'] : []),
      ...(user.roles ? ['roles'] : []),
      ...(user.name ? ['name'] : []),
      ...(user.phoneNumber ? ['phoneNumber'] : []),
      ...(user.bio ? ['bio'] : []),
      ...(user.organizationId ? ['organizationId'] : []),
      ...(user.language ? ['language'] : []),
      ...(user.timezone ? ['timezone'] : []),
    ] as any[])}
    RETURNING *`;
    const row = res.at(0)!;
    return new User(row as User);
  }

  async updateOne(
    user: Omit<
      User,
      | 'email'
      | 'password'
      | 'roles'
      | 'name'
      | 'phoneNumber'
      | 'bio'
      | 'organizationId'
      | 'language'
      | 'timezone'
    > & {
      password?: string | undefined | null;
      roles?: ('ADMIN' | 'USER')[] | undefined | null;
      phoneNumber?: string | undefined | null;
      bio?: string | undefined | null;
      organizationId?: string | undefined | null;
      language?: string | undefined | null;
      timezone?: string | undefined | null;
    },
  ) {
    const sql = this.pgService.sql;

    const res = await sql`UPDATE users SET ${sql(user, [
      ...(user.password ? ['password'] : []),
      ...(user.roles ? ['roles'] : []),
      ...(user.phoneNumber ? ['phoneNumber'] : []),
      ...(user.bio ? ['bio'] : []),
      ...(user.organizationId ? ['organizationId'] : []),
      ...(user.language ? ['language'] : []),
      ...(user.timezone ? ['timezone'] : []),
    ] as any[])} WHERE id = ${user.id}
    RETURNING *`;
    const row = res.at(0)!;
    return new User(row as User);
  }
}
