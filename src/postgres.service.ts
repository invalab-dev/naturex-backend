import { Injectable } from '@nestjs/common';
import postgres from 'postgres';


@Injectable()
export class PostgresService {
  public sql = postgres(process.env.POSTGRES_URL!);
}