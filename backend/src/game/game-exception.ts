import { AppException, exceptionGuardFactory } from '@/common/app-exception';
import { HttpStatus } from '@nestjs/common';

export enum GameError {
  ConnectionFailed = 200,
  RequestInstanceFailed,
  EnterQuickMatchQueueError,
  CantStartGame
}

export class GameException extends AppException { }

export class ConnectionFailedException extends GameException {
  code = GameError.ConnectionFailed;
  status = HttpStatus.BAD_REQUEST;
  message = 'Connection failed';
}

export class RequestInstanceFailedException extends GameException {
  code = GameError.RequestInstanceFailed;
  status = HttpStatus.BAD_REQUEST;
  message = "Cant't request game instance";
}

export class EnterQuickMatchQueueException extends GameException {
  code = GameError.EnterQuickMatchQueueError;
  status = HttpStatus.BAD_REQUEST;
  message = "The player already in a queue or in a running game";
}

export class CantStartGameException extends GameException {
  code = GameError.CantStartGame;
  status = HttpStatus.SERVICE_UNAVAILABLE;
  message = "The server can't start the game";
}

export const isGameException = exceptionGuardFactory(GameException, {
  min: 200,
  max: 300
});
