import { FastifyReply } from 'fastify';
import { Catch, ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { AppException } from '../app-exception';

@Catch(AppException)
export class AppExceptionFilter implements ExceptionFilter {
  catch(exception: AppException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    response.status(exception.status).send({
      code: exception.code,
      message: exception.message
    });
  }
}
