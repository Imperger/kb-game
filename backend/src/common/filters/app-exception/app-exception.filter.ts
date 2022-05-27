import { FastifyReply } from 'fastify';
import { Catch, ArgumentsHost } from '@nestjs/common';

import { AppException } from './app-exception';

@Catch(AppException as any)
export class AppExceptionFilter {
  catch(exception: AppException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    response
      .status(exception.httpCode)
      .send({ code: exception.code, message: exception.message });
  }
}