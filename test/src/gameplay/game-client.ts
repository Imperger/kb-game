import { first } from 'rxjs/operators';
import { io, Socket } from 'socket.io-client';

import { AuthResult, AuthStrategy } from './strategies/auth-strategy';
import { GameStrategy } from './strategies/game-strategy';
import { LobbyStrategy } from './strategies/lobby-strategy';
import { QuickGameLobbyStrategy } from './strategies/quick-game-lobby-strategy';
import { Strategy } from './strategies/strategy';

export class GameClient {
  private state!: Strategy;

  private socket!: Socket;

  private authResult!: (s: AuthResult) => void;

  async connect(instanceUrl: string, playerToken: string): Promise<AuthResult> {
    const url = new URL(instanceUrl);
    this.socket = io(url.origin, { path: `${url.pathname}/socket.io` });

    await this.waitForConnected();

    const s = new AuthStrategy();
    s.playerToken = playerToken;
    this.state = s;

    this.state.use(this.socket, s => this.switchStrategy(s));

    return new Promise<AuthResult>((resolve, _reject) => {
      this.authResult = resolve;
    });
  }

  async sendKey(key: string): Promise<number> {
    if (!(this.state instanceof GameStrategy)) {
      return -1;
    }

    return this.state.sendKey(key);
  }

  get inLobby(): boolean {
    return this.state instanceof LobbyStrategy;
  }

  get lobby(): LobbyStrategy {
    return this.state as LobbyStrategy;
  }

  get inQuickgGameLobby(): boolean {
    return this.state instanceof QuickGameLobbyStrategy;
  }

  get quickGameLobby(): QuickGameLobbyStrategy {
    return this.state as QuickGameLobbyStrategy;
  }

  get inGame(): boolean {
    return this.state instanceof GameStrategy;
  }

  get game(): GameStrategy {
    return this.state as GameStrategy;
  }

  private async switchStrategy(strategy: Strategy) {
    if (
      this.state instanceof AuthStrategy &&
      strategy instanceof LobbyStrategy
    ) {
      this.authResult(AuthResult.CustomGame);
    } else if (
      this.state instanceof AuthStrategy &&
      strategy instanceof QuickGameLobbyStrategy
    ) {
      this.authResult(AuthResult.QuickGame);
    } else if (
      this.state instanceof LobbyStrategy &&
      strategy instanceof GameStrategy
    ) {
      strategy.players = this.state.players.map(x => ({ ...x, progress: 0 }));
      strategy.$endGame.pipe(first()).subscribe(() => strategy.deactivate());
    } else if (
      this.state instanceof QuickGameLobbyStrategy &&
      strategy instanceof GameStrategy
    ) {
      strategy.players = this.state.players.map(x => ({ ...x, progress: 0 }));
      strategy.$endGame.pipe(first()).subscribe(() => strategy.deactivate());
    }

    strategy.bufferedEvents = this.state.bufferedEvents ?? [];
    this.state.deactivate();
    this.state = strategy;
    this.state.use(this.socket, s => this.switchStrategy(s));
  }

  private waitForConnected(): Promise<void> {
    return new Promise<void>((resolve, _reject) =>
      this.socket.once('connect', () => resolve())
    );
  }
}
