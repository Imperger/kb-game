import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { debounce, firstValueFrom, interval, Subject } from 'rxjs';
import { GameService } from './game/game.service';
import { ParticipantService } from './game/participant.service';

@Injectable()
export class ShutdownService {
  /**
   * After elapsed the instance will be shut down independent of any state
   */
  private readonly globalTtl = 3600000;

  private globalShutdownTimer: NodeJS.Timer;

  /**
   * Time to wait for owner connected while in a lobby state
   */
  private readonly waitForOwnerLobbyTtl = 60000;

  private readonly $waitForOwnerLobby = new Subject<boolean>();

  private readonly $shutdowner = new Subject<void>();

  constructor(
    @Inject(forwardRef(() => GameService))
    private readonly game: GameService,
    @Inject(forwardRef(() => ParticipantService))
    private readonly participant: ParticipantService,
  ) {
    this.setupAutoShutdown();
  }

  subscribeToShutdown(shutdown: () => void): void {
    firstValueFrom(this.$shutdowner).then(() => shutdown());
  }

  shutdown(): void {
    clearTimeout(this.globalShutdownTimer);
    this.$shutdowner.next();
  }

  private setupAutoShutdown() {
    this.globalShutdownTimer = setTimeout(
      () => this.shutdown(),
      this.globalTtl,
    );

    this.$waitForOwnerLobby
      .pipe(debounce((x) => interval(x ? 0 : this.waitForOwnerLobbyTtl)))
      .subscribe((x) => x || this.shutdown());

    if (process.env.GAME_TYPE.toLowerCase() === 'custom') {
      this.$waitForOwnerLobby.next(false);
    }

    this.participant.$ownerPresence.subscribe(
      (x) => this.game.isStarted || this.$waitForOwnerLobby.next(x),
    );
  }
}
