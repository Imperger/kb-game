import { Observable, Subject } from 'rxjs';
import { Inject, Injectable } from '@nestjs/common';

import { ParticipantService } from '@/game/participant.service';
import { PlayerDesc } from '@/game/game.service';
import { ConfigService } from '@/game/config.service';
import { CustomGameConfigService } from './custom-game-config.service';
import { instanceUrl } from '@/game/instance-url';
import { Player } from '@/game/Player';
import { LobbyEventType } from '@/game/interfaces/lobby-event.interface';

@Injectable()
export class CustomGameParticipantService extends ParticipantService {
  @Inject(ConfigService)
  private readonly config: CustomGameConfigService;

  private readonly _$ownerPresence = new Subject<boolean>();

  async addPlayer(player: PlayerDesc): Promise<boolean> {
    const extraSlot = +(this.config.ownerId !== player.id);
    const capacity = this.roomCapacity - extraSlot;

    if (this._players.size < capacity && !this.isPlayerIn(player.id)) {
      if (
        player.id !== this.config.ownerId &&
        !(await this.backendApi.linkGame(player.id, {
          instanceUrl: instanceUrl(),
        }))
      ) {
        return false;
      }

      const p = new Player(
        player.socket,
        player.id,
        player.nickname,
        this.findFreeSlot(),
      );

      this._players.set(player.socket, p);

      this._$ownerPresence.next(true);

      this.eventEmitter.emitLobbyEvent({
        type: LobbyEventType.PlayerJoined,
        data: { id: player.id, nickname: player.nickname, slot: p.slot },
      });

      return true;
    } else {
      setImmediate(() => player.socket.disconnect());

      return false;
    }
  }

  async playerDisconnected(player: Player): Promise<void> {
    if (player.id === this.config.ownerId) {
      this._$ownerPresence.next(false);
    } else {
      await this.backendApi.unlinkGame(player.id);
    }
  }

  get ownerNickname(): string {
    return (
      [...this._players.values()].find((p) => p.id === process.env.OWNER_ID)
        ?.nickname ?? 'Unknown'
    );
  }

  get $ownerPresence(): Observable<boolean> {
    return this._$ownerPresence;
  }
}
