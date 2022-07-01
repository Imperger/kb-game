import { HttpStatus } from '@nestjs/common';

import { SpawnerStatusCode } from '@/spawner/status-code';
import { AppException } from '@/common/filters/app-exception/app-exception';

export class WrongSecretException extends AppException {
  code = SpawnerStatusCode.WrongSecret;
  httpCode = HttpStatus.BAD_REQUEST;
  message = 'Wront secret';
}