import { BadRequestException, Injectable } from '@nestjs/common';
import { PostgresService } from '../postgres.service.js';

export const enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export class User {
  public id!: string;
  public email!: string;
  public password!: string;
  public roles!: UserRole[];
  public name!: string | null;
  public phoneNumber!: string | null;
  public bio!: string | null;
  public organizationId!: string | null;
  public language!: string;
  public timezone!: string;

  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    this.password = user.password;
    this.roles = user.roles;
    this.name = user.name;
    this.phoneNumber = user.phoneNumber;
    this.bio = user.bio;
    this.organizationId = user.organizationId;
    this.language = user.language;
    this.timezone = user.timezone;
  }
}

@Injectable()
export class UsersService {
  constructor(private readonly pgService: PostgresService) {}

  async findAll(): Promise<User[]> {
    const res = await this.pgService.sql`SELECT * FROM users;`;
    return res.map((row) => new User(row as User));
  }

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
    user: Pick<User, 'email' | 'password'> & {
      roles?: UserRole[] | undefined | null;
      name?: string | undefined | null;
      phoneNumber?: string | undefined | null;
      bio?: string | undefined | null;
      organizationId?: string | undefined | null;
      language?: string | undefined | null;
      timezone?: string | undefined | null;
    },
  ): Promise<User> {
    const sanitizedUser = {
      ...user,
      roles: user.roles ?? null,
      name: user.name ?? null,
      phoneNumber: user.phoneNumber ?? null,
      bio: user.bio ?? null,
      organizationId: user.organizationId ?? null,
      language: user.language ?? null,
      timezone: user.timezone ?? null,
    };
    if (await this.findOneByEmail(sanitizedUser.email)) {
      throw new BadRequestException('User already exists');
    }
    const sql = this.pgService.sql;

    const res = await sql`INSERT INTO users ${sql(sanitizedUser, [
      'email',
      'password',
      ...(user.roles ? ['roles'] : []),
      'name',
      'phoneNumber',
      'bio',
      'organizationId',
      ...(user.language ? ['language'] : []),
      ...(user.timezone ? ['timezone'] : []),
    ] as any[])}
    RETURNING *`;
    const row = res.at(0)!;
    return new User(row as User);
  }

  async updateOne(
    user: Pick<User, 'id'> & {
      password?: string | undefined | null;
      roles?: UserRole[] | undefined | null;
      name?: string | undefined | null;
      phoneNumber?: string | undefined | null;
      bio?: string | undefined | null;
      organizationId?: string | undefined | null;
      language?: string | undefined | null;
      timezone?: string | undefined | null;
    },
  ) {
    const sanitizedUser = {
      ...user,
      password: user.password ?? null,
      roles: user.roles ?? null,
      name: user.name ?? null,
      phoneNumber: user.phoneNumber ?? null,
      bio: user.bio ?? null,
      organizationId: user.organizationId ?? null,
      language: user.language ?? null,
      timezone: user.timezone ?? null,
    };
    const sql = this.pgService.sql;

    const res = await sql`UPDATE users SET ${sql(sanitizedUser, [
      ...(user.password ? ['password'] : []),
      ...(user.roles ? ['roles'] : []),
      'name',
      'phoneNumber',
      'bio',
      'organizationId',
      ...(user.language ? ['language'] : []),
      ...(user.timezone ? ['timezone'] : []),
    ] as any[])} WHERE id = ${sanitizedUser.id}
    RETURNING *`;
    const row = res.at(0)!;
    return new User(row as User);
  }

  toInsensitiveUser(user: User): Omit<User, 'password'> {
    const { password: _, ...insensitiveUser } = user;
    return insensitiveUser;
  }
}
