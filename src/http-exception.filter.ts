import { ArgumentsHost, ExceptionFilter, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;

    const method = request.method;
    const originalUrl = request.originalUrl;
    const routePath = request.route?.path;

    console.error(
      `[${new Date().toLocaleString()}][HTTP EXCEPTION] ${method} ${originalUrl}` +
        (routePath ? ` (route: ${routePath})` : ''),
    );
    console.error(`→ status: ${status}, message: ${exception}`);
    console.error(`[trace] ${exception.stack}`);

    response.status(status).json();
  }
}
