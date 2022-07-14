import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { GoogleRecaptchaException } from "@nestlab/google-recaptcha";

import { FastifyReply } from 'fastify';
import { StatusCode } from "../types/status-code";

@Catch(GoogleRecaptchaException)
export class GoogleRecaptchaFilter implements ExceptionFilter {
  catch(exception: GoogleRecaptchaException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    response
      .status(HttpStatus.UNAUTHORIZED)
      .send({ code: StatusCode.CaptchaFailed, message: 'Invalid recaptcha.' });
  }
}