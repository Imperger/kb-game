import { HttpStatus } from '@nestjs/common';

import { SpawnerStatusCode } from '@/spawner/status-code';
import { AppException } from '@/common/filters/app-exception/app-exception';

export class ListGameFailedException extends AppException {
  code = SpawnerStatusCode.ListGameFailed;
  httpCode = HttpStatus.BAD_REQUEST;
  message = 'List games failed';
}