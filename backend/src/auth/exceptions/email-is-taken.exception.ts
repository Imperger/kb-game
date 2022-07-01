import { HttpStatus } from '@nestjs/common';

import { StatusCode } from '@/common/types/status-code';
import { AppException } from '@/common/filters/app-exception/app-exception';

export class EmailIsTakenException extends AppException {
  code = StatusCode.EmailIsTaken;
  httpCode = HttpStatus.CONFLICT;
  message = 'Email already taken.';
}