import { HttpStatus } from '@nestjs/common';

import { SpawnerStatusCode } from '@/spawner/status-code';
import { AppException } from '@/common/filters/app-exception/app-exception';

export class HostNotFoundException extends AppException {
  code = SpawnerStatusCode.HostNotFound;
  httpCode = HttpStatus.BAD_REQUEST;
  message = 'Can\'t resolve host address';
}