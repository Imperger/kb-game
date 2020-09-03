import { HttpStatus } from '@nestjs/common';

import { AppException } from '../../common/filters/app-exception/app-exception';
import { StatusCode } from '../../common/types/status-code';

export class RegistrationNotConfirmedException extends AppException {
    code = StatusCode.PendingConfirmRegistration;
    httpCode = HttpStatus.UNAUTHORIZED;
    message = 'Pending confirm registration.';
}