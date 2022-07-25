import { Player } from '../Player';

export type EndGameHandle = () => void;

export interface EndGameStrategy {
  init(players: Player[], endGame: EndGameHandle): void;
  tick(emitter: Player): void;
}
