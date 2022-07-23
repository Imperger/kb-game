import { AppException, exceptionGuardFactory } from "@/common/app-exception";
import { HttpStatus } from "@nestjs/common";

export enum GameError {
  ConnectionFailed = 200,
  RequestInstanceFailed
};

export class GameException extends AppException {}

export class ConnectionFailedException extends GameException {
  code = GameError.ConnectionFailed;
  status = HttpStatus.BAD_REQUEST;
  message = 'Connection failed';
}

export class RequestInstanceFailedException extends GameException {
  code = GameError.RequestInstanceFailed;
  status = HttpStatus.BAD_REQUEST;
  message = 'Cant\'t request game instance';
}

export const isGameException = exceptionGuardFactory(GameException, { min: 200, max: 300 });
  