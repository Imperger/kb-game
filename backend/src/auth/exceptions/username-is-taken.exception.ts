import { HttpStatus } from '@nestjs/common';

import { StatusCode } from '../../common/types/status-code';
import { AppException } from '../../common/filters/app-exception/app-exception';

export class UsernameIsTakenException extends AppException {
    code = StatusCode.UsernameIsTaken;
    httpCode = HttpStatus.CONFLICT;
    message = 'Username already taken.';
}