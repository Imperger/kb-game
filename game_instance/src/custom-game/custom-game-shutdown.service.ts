import { Subject, debounce, interval } from 'rxjs';
import { forwardRef, Inject, Injectable } from '@nestjs/common';

import { GameService } from '@/game/game.service';
import { ShutdownService } from '@/shutdown.service';
import { CustomGameParticipantService } from './custom-game-participant.service';
import { CustomGameService } from './custom-game.service';

@Injectable()
export class CustomGameShutdownService extends ShutdownService {
  @Inject(forwardRef(() => GameService))
  private readonly game: CustomGameService;

  protected readonly participant: CustomGameParticipantService;

  /**
   * Time to wait for owner connected while in a lobby state
   */
  private readonly waitForOwnerLobbyTtl = 60000;

  private readonly $waitForOwnerLobby = new Subject<boolean>();

  protected setupAutoShutdown(): void {
    super.setupAutoShutdown();

    this.participant.$ownerPresence.subscribe(
      (x) => this.game.isStarted || this.$waitForOwnerLobby.next(x),
    );

    this.$waitForOwnerLobby
      .pipe(debounce((x) => interval(x ? 0 : this.waitForOwnerLobbyTtl)))
      .subscribe((x) => x || this.autoShutdown());

    this.$waitForOwnerLobby.next(false);
  }
}
