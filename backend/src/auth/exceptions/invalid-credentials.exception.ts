import { HttpStatus } from '@nestjs/common';

import { StatusCode } from '../../common/types/status-code';
import { AppException } from '../../common/filters/app-exception/app-exception';

export class InvalidCredentialsException extends AppException {
    code = StatusCode.InvalidCredentials;
    httpCode = HttpStatus.UNAUTHORIZED;
    message = 'Invalid credentials.';
}