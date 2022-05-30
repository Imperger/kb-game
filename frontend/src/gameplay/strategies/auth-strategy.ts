import { Socket } from 'socket.io-client';
import { remoteCall } from '../remote-call';
import { Strategy } from './strategy';

enum AuthResult { Unauthorized = 0, CustomGame = 1, QuickGame = 2 }

export class AuthStrategy implements Strategy {
  private token = '';

  private socket!: Socket;

  use (socket: Socket, switchStrategy: (strategy: Strategy) => void): void {
    this.socket = socket;
    this.auth();
  }

  set playerToken (token: string) {
    this.token = token;
  }

  private async auth (): Promise<AuthResult> {
    const ret = await remoteCall(this.socket, 'auth', this.token);

    return AuthResult.CustomGame;
  }
}
