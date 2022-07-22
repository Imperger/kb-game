import { count, Subject, startWith, debounceTime, takeUntil } from 'rxjs';
import { Socket } from 'socket.io';

import { Player } from '../Player';
import { EndGameHandle, EndGameStrategy } from './end-game-strategy';

/**
 * The strategy waits for the winner and then wait other players until
 * they has progress. If no any progress with some timeout game has ended
 */
export class WaitUntilProgressEndGame implements EndGameStrategy {
  private players!: Map<Socket, Player>;

  private endGame!: EndGameHandle;

  private hasWinner = false;

  private $idle = new Subject<void>();

  constructor(private idleTimeout: number) {}

  init(players: Map<Socket, Player>, endGame: EndGameHandle): void {
    this.players = players;
    this.endGame = () => setImmediate(() => endGame());
  }

  tick(emitter: Player): void {
    if ([...this.players.values()].every((p) => p.finished)) {
      this.endGame();
      return;
    }

    if (emitter.finished) {
      if (this.players.size <= 1) {
        this.endGame();
        return;
      }

      if (!this.hasWinner) {
        this.$idle
          .pipe(
            startWith(),
            debounceTime(this.idleTimeout),
            takeUntil(this.$idle.pipe(count())),
          )
          .subscribe(() => this.endGame());
        this.hasWinner = true;
      }
    }

    if (this.hasWinner) {
      this.$idle.next();
    }
  }
}
