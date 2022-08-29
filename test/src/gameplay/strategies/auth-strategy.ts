import { Socket } from 'socket.io-client';

import { remoteCall } from '../remote-call';
import { LobbyStrategy } from './lobby-strategy';
import { QuickGameLobbyStrategy } from './quick-game-lobby-strategy';
import { Strategy } from './strategy';

export enum AuthResult { Unauthorized = 0, CustomGame = 1, QuickGame = 2 }

export class AuthStrategy extends Strategy {
  private token = '';

  private socket!: Socket;

  private bufferEventHandler = (e: unknown) => this.bufferEvent(e);

  public readonly bufferedEvents: unknown[] = [];

  async activate (socket: Socket, switchStrategy: (strategy: Strategy) => void): Promise<void> {
    this.socket = socket;

    this.socket.on('lobby_event', this.bufferEventHandler);

    switch (await this.auth()) {
      case AuthResult.CustomGame:
        switchStrategy(new LobbyStrategy());
        break;
      case AuthResult.QuickGame:
        switchStrategy(new QuickGameLobbyStrategy());
        break;
      case AuthResult.Unauthorized:
        break;
    }
  }

  async deactivate (): Promise<void> {
    this.socket.off('lobby_event', this.bufferEventHandler);
  }

  set playerToken (token: string) {
    this.token = token;
  }

  private async auth (): Promise<AuthResult> {
    return remoteCall(this.socket, 'auth', this.token);
  }

  private bufferEvent (e: unknown) {
    this.bufferedEvents.push(e);
  }
}
