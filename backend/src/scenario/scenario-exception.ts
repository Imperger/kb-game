import { HttpStatus } from '@nestjs/common';

import { AppException, exceptionGuardFactory } from '@/common/app-exception';

export enum ScenarioError {
  UnknownError = 400,
  ScenarioNotFound,
  RemovingLastScenario
}

export class ScenarioException extends AppException {}

export class ScenarioNotFoundException extends ScenarioException {
  code = ScenarioError.ScenarioNotFound;
  status = HttpStatus.NOT_FOUND;
  message = 'Scenario not found';
}

export class RemovingLastScenarioException extends ScenarioException {
  code = ScenarioError.RemovingLastScenario;
  status = HttpStatus.CONFLICT;
  message = 'Removing a last scenario is forbidden';
}

export const isSpawnerException = exceptionGuardFactory(ScenarioException, {
  min: 400,
  max: 500
});
