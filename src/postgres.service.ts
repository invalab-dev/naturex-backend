import postgres from 'postgres';

export class PostgresService {
  public sql = postgres(process.env.POSTGRES_URL!, {
    transform: postgres.camel,
  });
}
