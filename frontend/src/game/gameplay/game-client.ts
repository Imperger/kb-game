import { io, Socket } from 'socket.io-client';

import { AuthResult, AuthStrategy } from './strategies/auth-strategy';
import { GameStrategy } from './strategies/game-strategy';
import { LobbyStrategy } from './strategies/lobby-strategy';
import { Strategy } from './strategies/strategy';

export class GameClient {
  private state!: Strategy;

  private socket!: Socket;

  private authResult!: (s: AuthResult) => void;

  async connect (instanceUrl: string, playerToken: string): Promise<AuthResult> {
    const url = new URL(instanceUrl);
    this.socket = io(url.origin, { path: `${url.pathname}/socket.io` });

    const s = new AuthStrategy();
    s.playerToken = playerToken;
    this.state = s;

    this.state.use(this.socket, s => this.switchStrategy(s));

    return new Promise<AuthResult>((resolve, reject) => {
      this.authResult = resolve;
    });
  }

  async sendKey (key: string): Promise<number> {
    if (!(this.state instanceof GameStrategy)) {
      return -1;
    }

    return this.state.sendKey(key);
  }

  get lobby (): LobbyStrategy {
    return this.state as LobbyStrategy;
  }

  get inLobby (): boolean {
    return this.state instanceof LobbyStrategy;
  }

  get inGame () : boolean {
    return this.state instanceof GameStrategy;
  }

  get game (): GameStrategy {
    return this.state as GameStrategy;
  }

  private async switchStrategy (strategy: Strategy) {
    if (this.state instanceof AuthStrategy && strategy instanceof LobbyStrategy) {
      this.authResult(AuthResult.CustomGame);
    } else if (this.state instanceof AuthStrategy && strategy instanceof GameStrategy) {
      this.authResult(AuthResult.QuickGame);
    } else if (this.state instanceof LobbyStrategy && strategy instanceof GameStrategy) {
      strategy.players = this.state.players.map(x => ({ ...x, progress: 0 }));
    }

    this.state.deactivate();
    this.state = strategy;
    this.state.use(this.socket, s => this.switchStrategy(s));
  }
}
