import { HttpStatus } from '@nestjs/common';

import { SpawnerStatusCode } from '../types/spawner-status-code';
import { AppException } from '../../common/filters/app-exception/app-exception';

export class SpawnerAlreadyAdded extends AppException {
  code = SpawnerStatusCode.SpawnerAlreadyAdded;
  httpCode = HttpStatus.CONFLICT;
  message = 'Spawner already added.';
}