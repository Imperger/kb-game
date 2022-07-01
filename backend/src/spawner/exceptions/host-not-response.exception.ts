import { HttpStatus } from '@nestjs/common';

import { SpawnerStatusCode } from '@/spawner/status-code';
import { AppException } from '@/common/filters/app-exception/app-exception';

export class HostNotResponseException extends AppException {
  code = SpawnerStatusCode.HostNotResponse;
  httpCode = HttpStatus.BAD_REQUEST;
  message = 'Can\'t connect to the host';
}