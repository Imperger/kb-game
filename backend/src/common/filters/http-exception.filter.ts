import { FastifyReply } from 'fastify';
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<FastifyReply>();
        const status = exception.getStatus();

        
        response
            .status(status)
            .send({
                code: 99999,
                statusCode: status,
                message: exception.message
            });
    }
}