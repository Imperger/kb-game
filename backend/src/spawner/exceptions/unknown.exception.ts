import { HttpStatus } from '@nestjs/common';

import { SpawnerStatusCode } from '@/spawner/status-code';
import { AppException } from '@/common/filters/app-exception/app-exception';

export class UnknownException extends AppException {
  code = SpawnerStatusCode.UnknownError;
  httpCode = HttpStatus.BAD_REQUEST;
  message = 'Unknown error';
}