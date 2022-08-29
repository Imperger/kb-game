import { Socket } from 'socket.io-client';

export abstract class Strategy {
  private initialized = false;
  private initializationAwaiter: (() => void)[] = [];

  abstract activate(socket: Socket, switchStrategy: (strategy: Strategy) => void): Promise<void>;

  abstract deactivate(): Promise<void>;

  async use (socket: Socket, switchStrategy: (strategy: Strategy) => void): Promise<void> {
    await this.activate(socket, switchStrategy);

    if (this.initializationAwaiter.length) {
      this.initializationAwaiter.forEach(x => x());
      this.initializationAwaiter = [];
    }
    this.initialized = true;
  }

  async awaitInitialization (): Promise<void> {
    return this.initialized
      ? Promise.resolve()
      : new Promise<void>(resolve => (this.initializationAwaiter.push(resolve)));
  }
}

export type SwitchStrategy = (strategy: Strategy) => void;
