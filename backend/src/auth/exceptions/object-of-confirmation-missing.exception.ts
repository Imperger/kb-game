import { HttpStatus } from '@nestjs/common';

import { StatusCode } from '@/common/types/status-code';
import { AppException } from '@/common/filters/app-exception/app-exception';

export class UnknownUserForConfirmRegistrationException extends AppException {
  code = StatusCode.RegistrationAlreadyConfirmed;
  httpCode = HttpStatus.CONFLICT;
  message = 'Unknown user for confirm registration.';
}