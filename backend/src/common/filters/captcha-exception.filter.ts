import { FastifyReply } from 'fastify';
import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';

import { CaptchaException } from '../exceptions/captcha-exception';
import { StatusCode } from '../types/status-code';

@Catch(CaptchaException)
export class CaptchaExceptionFilter implements ExceptionFilter {
    catch(exception: CaptchaException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<FastifyReply>();


        response
            .status(HttpStatus.UNAUTHORIZED)
            .send({
                code: StatusCode.CaptchaFailed,
                message: 'Invalid recaptcha.'
            });
    }
}