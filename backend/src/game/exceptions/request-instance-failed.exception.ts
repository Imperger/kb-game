import { HttpStatus } from '@nestjs/common';

import { StatusCode } from '@/game/status-code';
import { AppException } from '@/common/filters/app-exception/app-exception';

export class RequestInstanceFailedException extends AppException {
  code = StatusCode.RequestInstanceFailed;
  httpCode = HttpStatus.BAD_REQUEST;
  message = 'Cant\'t request game instance';
}