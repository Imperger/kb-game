import { Socket } from 'socket.io-client';

export abstract class Strategy {
  private initialized = false;
  private initializationAwaiter: (() => void)[] = [];
  private _bufferedEvents: unknown[] = [];

  private _socket!: Socket;

  private bufferEventHandler = (e: unknown) => this.bufferEvent(e);

  async activate(
    socket: Socket,
    _switchStrategy: (strategy: Strategy) => void
  ): Promise<void> {
    this._socket = socket;

    this._socket.on('lobby_event', this.bufferEventHandler);
    this._socket.on('game_event', this.bufferEventHandler);

    await this.replayBufferedEvents();
  }

  async deactivate(): Promise<void> {
    this._socket.off('lobby_event', this.bufferEventHandler);
    this._socket.off('game_event', this.bufferEventHandler);
  }

  abstract onEvent(x: unknown): Promise<boolean>;

  async use(
    socket: Socket,
    switchStrategy: (strategy: Strategy) => void
  ): Promise<void> {
    await this.activate(socket, switchStrategy);

    if (this.initializationAwaiter.length) {
      this.initializationAwaiter.forEach(x => x());
      this.initializationAwaiter = [];
    }
    this.initialized = true;
  }

  async awaitInitialization(): Promise<void> {
    return this.initialized
      ? Promise.resolve()
      : new Promise<void>(resolve =>
          this.initializationAwaiter.push(resolve)
        );
  }

  get bufferedEvents(): unknown[] {
    return this._bufferedEvents;
  }

  set bufferedEvents(events: unknown[]) {
    this._bufferedEvents = events;
  }

  private async bufferEvent(e: unknown): Promise<void> {
    if (!(await this.onEvent(e))) {
      this._bufferedEvents.push(e);
    }
  }

  private async replayBufferedEvents() {
    const notProcesedEvents: unknown[] = [];
    for (const event of this._bufferedEvents) {
      if (!(await this.onEvent(event))) {
        notProcesedEvents.push(event);
      }
    }

    this._bufferedEvents = notProcesedEvents;
  }
}

export type SwitchStrategy = (strategy: Strategy) => void;
