import { Inject, Injectable } from '@nestjs/common';

import { ParticipantService } from '@/game/participant.service';
import { ConfigService } from '@/game/config.service';
import { QuickGameConfigService } from './quick-game-config.service';
import { Player } from '@/game/Player';
import { PlayerDesc } from '@/game/game.service';
import { instanceUrl } from '@/game/instance-url';
import { LobbyEventType } from '@/game/interfaces/lobby-event.interface';
import { QuickGameService } from './quick-game.service';

@Injectable()
export class QuickGameparticiantService extends ParticipantService {
  @Inject(ConfigService)
  private readonly config: QuickGameConfigService;

  protected readonly game: QuickGameService;

  async addPlayer(player: PlayerDesc): Promise<boolean> {
    if (
      this._players.size < this.roomCapacity &&
      !this.isPlayerIn(player.id) &&
      this.config.players.includes(player.id)
    ) {
      if (
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

      this.eventEmitter.emitLobbyEvent({
        type: LobbyEventType.PlayerJoined,
        data: { id: player.id, nickname: player.nickname, slot: p.slot },
      });

      if (this.config.players.length === this.players.length) {
        await this.game.startGame();
      }

      return true;
    } else {
      setImmediate(() => player.socket.disconnect());

      return false;
    }
  }

  async playerDisconnected(player: Player): Promise<void> {
    await this.backendApi.unlinkGame(player.id);
  }
}
