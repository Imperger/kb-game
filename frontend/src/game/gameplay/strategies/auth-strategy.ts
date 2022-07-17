import { Socket } from 'socket.io-client';

import { remoteCall } from '../remote-call';
import { LobbyStrategy } from './lobby-strategy';
import { Strategy } from './strategy';

export enum AuthResult { Unauthorized = 0, CustomGame = 1, QuickGame = 2 }

export class AuthStrategy extends Strategy {
  private token = '';

  private socket!: Socket;

  async activate (socket: Socket, switchStrategy: (strategy: Strategy) => void): Promise<void> {
    this.socket = socket;
    switch (await this.auth()) {
      case AuthResult.CustomGame:
        switchStrategy(new LobbyStrategy());
        break;
      case AuthResult.QuickGame:
        throw new Error('Not implemented yet');
      case AuthResult.Unauthorized:
        break;
    }
  }

  async deactivate (): Promise<void> { }

  set playerToken (token: string) {
    this.token = token;
  }

  private async auth (): Promise<AuthResult> {
    return remoteCall(this.socket, 'auth', this.token);
  }
}
