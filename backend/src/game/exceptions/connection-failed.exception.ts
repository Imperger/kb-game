import { HttpStatus } from '@nestjs/common';

import { StatusCode } from '@/game/status-code';
import { AppException } from '@/common/filters/app-exception/app-exception';

export class ConnectionFailedException extends AppException {
  code = StatusCode.ConnectionFailed;
  httpCode = HttpStatus.BAD_REQUEST;
  message = 'Connection failed';
}