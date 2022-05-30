import { Socket } from 'socket.io-client';

export interface Strategy {
  use(socket: Socket, switchStrategy: (strategy: Strategy) => void): void;
}
