import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus
} from '@nestjs/common';
import { GoogleRecaptchaException } from '@nestlab/google-recaptcha';
import { FastifyReply } from 'fastify';

import { CommonError } from '../common-exception';

@Catch(GoogleRecaptchaException)
export class GoogleRecaptchaFilter implements ExceptionFilter {
  catch(exception: GoogleRecaptchaException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    response
      .status(HttpStatus.UNAUTHORIZED)
      .send({ code: CommonError.CaptchaFailed });
  }
}
