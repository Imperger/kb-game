import { io, Socket } from 'socket.io-client';
import { AuthStrategy } from './strategies/auth-strategy';

import { Strategy } from './strategies/strategy';

export class GameClient {
  private state!: Strategy;

  private socket!: Socket;

  connect (instanceUrl: string, playerToken: string): void {
    this.socket = io(instanceUrl);

    const s = new AuthStrategy();
    s.playerToken = playerToken;
    this.state = s;

    this.state.use(this.socket, s => this.switchStrategy(s));
  }

  async sendKey (key: string): Promise<boolean> {
    return false;
  }

  private switchStrategy (strategy: Strategy) {
    this.state = strategy;
    this.state.use(this.socket, s => this.switchStrategy(s));
  }
}
