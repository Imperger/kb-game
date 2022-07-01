import { HttpStatus } from '@nestjs/common';

import { SpawnerStatusCode } from '@/spawner/status-code';
import { AppException } from '@/common/filters/app-exception/app-exception';

export class RequestInstanceFailedException extends AppException {
  code = SpawnerStatusCode.RequestInstanceFailed;
  httpCode = HttpStatus.CONFLICT;
  message = 'Request instance failed';
}