import { FastifyReply } from 'fastify';
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';

import { StatusCode } from '@/common/types/status-code';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    response
      .status(exception.getStatus())
      .send({
        code: StatusCode.InternalError,
        message: exception.message
      });
  }
}