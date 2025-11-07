import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';

export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): any {
    console.log(`http exception: ${exception}`);

    const response = host.switchToHttp().getResponse<Response>();
    const status = exception.status || 500;

    response
      .status(status)
      .json({});
  }
}