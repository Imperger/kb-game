import { HttpStatus } from '@nestjs/common';

import { StatusCode } from '@/common/types/status-code';
import { AppException } from '@/common/filters/app-exception/app-exception';

export class RegistrationConfirmExpiredException extends AppException {
  code = StatusCode.PendingConfirmRegistrationExpired;
  httpCode = HttpStatus.UNAUTHORIZED;
  message = 'Registration confirm expired.';
}