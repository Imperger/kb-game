import { Socket } from 'socket.io';

import { Player } from '../Player';

export type EndGameHandle = () => void;

export interface EndGameStrategy {
  init(players: Map<Socket, Player>, endGame: EndGameHandle): void;
  tick(emitter: Player): void;
}
