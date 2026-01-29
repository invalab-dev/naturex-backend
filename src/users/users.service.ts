import { BadRequestException, Injectable } from '@nestjs/common';
import { PostgresService } from '../postgres.service.js';
import { undefinedToNull } from '../utils.js';

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

  constructor(user: {
    id: string;
    email: string;
    password: string;
    roles: UserRole[];
    name: string | null;
    phoneNumber: string | null;
    bio: string | null;
    organizationId: string | null;
    language: string;
    timezone: string;
  }) {
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
    const definedUser = undefinedToNull(user);
    if (await this.findOneByEmail(definedUser.email)) {
      throw new BadRequestException('User already exists');
    }
    const sql = this.pgService.sql;

    const res = await sql`INSERT INTO users ${sql(definedUser, [
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
    const definedUser = undefinedToNull(user);
    const sql = this.pgService.sql;

    const res = await sql`UPDATE users SET ${sql(definedUser, [
      ...(user.password ? ['password'] : []),
      ...(user.roles ? ['roles'] : []),
      'name',
      'phoneNumber',
      'bio',
      'organizationId',
      ...(user.language ? ['language'] : []),
      ...(user.timezone ? ['timezone'] : []),
    ] as any[])} WHERE id = ${definedUser.id}
    RETURNING *`;
    const row = res.at(0)!;
    return new User(row as User);
  }
}
