import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

import { Player } from './Player';
import { BackendApiService } from './backend-api.service';
import { EventEmitterService } from './event-emitter.service';
import { LobbyEventType } from './interfaces/lobby-event.interface';
import { GameService, PlayerDesc } from './game.service';

@Injectable()
export abstract class ParticipantService {
  protected readonly roomCapacity = 10;

  protected readonly _players = new Map<Socket, Player>();

  constructor(
    @Inject(forwardRef(() => GameService))
    protected readonly game: GameService,
    protected readonly eventEmitter: EventEmitterService,
    protected readonly backendApi: BackendApiService,
  ) {}

  abstract addPlayer(player: PlayerDesc);

  abstract playerDisconnected(player: Player): Promise<void>;

  newClient(client: Socket) {
    setTimeout(() => this.disconnectDangling(client), 1000);
  }

  async disconnectClient(client: Socket) {
    const p = this._players.get(client);

    if (p) {
      this.eventEmitter.emitLobbyEvent({
        type: LobbyEventType.PlayerLeaves,
        data: { id: p.id },
      });

      await this.playerDisconnected(p);

      this._players.delete(client);
    }
  }

  findBySocket(socket: Socket) {
    return this._players.get(socket);
  }

  dispose() {
    this._players.forEach((p, s) => !s.disconnected && s.disconnect());
    this._players.clear();
  }

  isPlayerIn(id: string): boolean {
    return !![...this._players.values()].find((x) => x.id === id);
  }

  get occupancy(): number {
    return this._players.size;
  }

  get players(): Player[] {
    return [...this._players.values()];
  }

  protected findFreeSlot(): number {
    const slotPool = new Set([...Array(10).keys()]);

    [...this._players.values()].forEach((x) => slotPool.delete(x.slot));

    return [...slotPool][0];
  }

  private disconnectDangling(client: Socket) {
    if (!(this._players.has(client) || client.disconnected)) {
      client.disconnect();
    }
  }
}
