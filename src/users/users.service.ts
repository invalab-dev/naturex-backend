import { BadRequestException, Injectable } from '@nestjs/common';
import { PostgresService } from '../postgres.service';

export class User {
  constructor(
    public id: number,
    public name: string,
    public email: string,
    public password: string,
  ) {}
}

@Injectable()
export class UsersService {
  constructor(
    private readonly postgresService: PostgresService,
  ) {}

  async findOne(email: string): Promise<User | undefined> {
    const sql = this.postgresService.sql;

    const res = await sql`SELECT * FROM users WHERE email = ${email}`;
    const row = res.at(0);
    if(!row) {
      return undefined;
    }

    return new User(row.id, row.name, row.email, row.password);
  }

  async createOne(email: string, password: string, name: string): Promise<User> {
    if(await this.findOne(email)) {
      throw new BadRequestException('User already exists');
    }

    const sql = this.postgresService.sql;

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