import { AppException } from '@/common/filters/app-exception/app-exception';
import { StatusCode } from '@/common/types/status-code';
import { HttpStatus } from '@nestjs/common';

export class UnknownRegistrationException extends AppException {
  code = StatusCode.InternalError;
  httpCode = HttpStatus.INTERNAL_SERVER_ERROR;
  message = 'Unknown registration exception.';
}