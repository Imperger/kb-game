import { AppException } from '../filters/app-exception/app-exception';
import { StatusCode } from '../types/status-code';
import { HttpStatus } from '@nestjs/common';

export class InternalException extends AppException {
    code = StatusCode.InternalError;
    httpCode = HttpStatus.INTERNAL_SERVER_ERROR;
    message = 'Internal error.';
}