import { FastifyReply } from 'fastify';
import { MongoError } from 'mongodb';
import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';

import { StatusCode } from '../../common/types/status-code';
import { ResponseStatus } from '../../common/types/response-status';

enum IdentifierType { Unknown, Username, Email };

@Catch(MongoError)
export class RegisterExceptionFilter implements ExceptionFilter {
    private ex: MongoError;
    catch(exception: MongoError, host: ArgumentsHost) {
        this.ex = exception;
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<FastifyReply>();

        let resp: ResponseStatus;
        if (exception.code === 11000)
            resp = this.ResponseForDuplicateKey();

        response
            .status(HttpStatus.CONFLICT)
            .send(resp);
    }

    extractDuplicateKey() {
        const start = this.ex.message.indexOf(':', this.ex.message.indexOf(':') + 1) + 2;
        const end = this.ex.message.indexOf(' ', start);
        return this.ex.message.substring(start, end);
    }

    ResponseForDuplicateKey() {
        switch (RegisterExceptionFilter.DetectIdentifuerType(this.extractDuplicateKey())) {
            case IdentifierType.Username:
                return { code: StatusCode.UsernameIsTaken, message: 'Username already taken.' };
            case IdentifierType.Email:
                return { code: StatusCode.EmailIsTaken, message: 'Email address already taken.' };
            case IdentifierType.Unknown:
                return { code: StatusCode.InternalError, message: 'Can\'t detect duplicate key.' };
        }
    }

    static DetectIdentifuerType(key: string) {
        if (key.startsWith('username'))
            return IdentifierType.Username;
        else if (key.startsWith('email'))
            return IdentifierType.Email;

        return IdentifierType.Unknown;
    }
}