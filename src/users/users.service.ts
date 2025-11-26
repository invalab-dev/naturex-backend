import { BadRequestException, Injectable } from '@nestjs/common';
import { PostgresService } from '../postgres.service';

export class User {
  constructor(
    public id: string,
    public name: string,
    public email: string,
    public password: string,
  ) {}
}

@Injectable()
export class UsersService {
  constructor(
    private readonly pgService: PostgresService,
  ) {}

  async findOne(email: string): Promise<User | undefined> {
    const res = await this.pgService.sql`SELECT * FROM users WHERE email = ${email}`;
    const row = res.at(0);
    if(!row) {
      return undefined;
    }

    return new User(row.id, row.name, row.email, row.password);
  }

  async findUserRoles(userId: string): Promise<string[]> {
    const res = await this.pgService.sql`SELECT roles.code as code FROM roles NATURAL JOIN users_roles WHERE users_roles.user_id = ${userId}`;
    return res.map(row => { return row["code"] as string })
  }

  async createOne(email: string, password: string, name: string): Promise<User> {
    if(await this.findOne(email)) {
      throw new BadRequestException('User already exists');
    }

    const sql = this.pgService.sql;

    const res = await sql`INSERT INTO users ${sql({
      "email": email,
      "password": password,
      "name": name,
    }, "email", "password", "name")}
    RETURNING id`;
    const id = res.at(0)!.id;

    return new User(id, email, password, name);
  }
}