import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from './http-exception.filter.js';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors({
    origin: ["http://localhost:3000", "http://223.130.146.58:3002"],
    credentials: true,
  });
  await app.listen(3001, "0.0.0.0");
}
bootstrap();
