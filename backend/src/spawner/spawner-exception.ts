import { AppException, exceptionGuardFactory } from '@/common/app-exception';
import { HttpStatus } from '@nestjs/common';

export enum SpawnerError {
  UnknownError = 100,
  SpawnerAlreadyAdded,
  HostNotResponse,
  HostNotFound,
  WrongSecret,
  RequestInstanceFailed,
  ListGameFailed
}

export class SpawnerException extends AppException {}

export class HostNotFoundException extends SpawnerException {
  code = SpawnerError.HostNotFound;
  status = HttpStatus.BAD_REQUEST;
  message = "Can't resolve host address";
}

export class HostNotResponseException extends SpawnerException {
  code = SpawnerError.HostNotResponse;
  status = HttpStatus.BAD_REQUEST;
  message = "Can't connect to the host";
}

export class ListGameFailedException extends SpawnerException {
  code = SpawnerError.ListGameFailed;
  status = HttpStatus.BAD_REQUEST;
  message = 'List games failed';
}

export class RequestInstanceFailedException extends SpawnerException {
  code = SpawnerError.RequestInstanceFailed;
  status = HttpStatus.CONFLICT;
  message = 'Request instance failed';
}

export class SpawnerAlreadyAdded extends SpawnerException {
  code = SpawnerError.SpawnerAlreadyAdded;
  status = HttpStatus.CONFLICT;
  message = 'Spawner already added';
}

export class UnknownException extends AppException {
  code = SpawnerError.UnknownError;
  status = HttpStatus.BAD_REQUEST;
  message = 'Unknown error';
}

export class WrongSecretException extends AppException {
  code = SpawnerError.WrongSecret;
  status = HttpStatus.BAD_REQUEST;
  message = 'Wront secret';
}

export const isSpawnerException = exceptionGuardFactory(SpawnerException, {
  min: 100,
  max: 200
});
